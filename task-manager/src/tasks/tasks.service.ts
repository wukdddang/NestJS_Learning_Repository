import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Task, TaskDocument } from './schemas/task.schema';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { NotificationEventHelper } from '../notifications/utils/notification-event.helper';

@Injectable()
export class TasksService {
  constructor(
    @InjectModel(Task.name) private taskModel: Model<TaskDocument>,
    private readonly notificationEventHelper: NotificationEventHelper,
  ) {}

  async create(createTaskDto: CreateTaskDto, projectId?: string): Promise<TaskDocument> {
    const createdTask = new this.taskModel(createTaskDto);
    const savedTask = await createdTask.save();

    // 활동 로그 생성 (projectId가 있는 경우에만)
    if (projectId) {
      // ActivityLogsService는 별도로 주입받아 사용할 수 있습니다
      // 여기서는 기본 구조만 남겨둡니다
    }

    return savedTask;
  }

  async findAll(): Promise<TaskDocument[]> {
    return this.taskModel
      .find({ isActive: true })
      .populate('listId creatorId assigneeIds labelIds parentTaskId')
      .sort({ orderIndex: 1 })
      .exec();
  }

  async findByList(listId: string): Promise<TaskDocument[]> {
    return this.taskModel
      .find({ listId: new Types.ObjectId(listId), isActive: true })
      .populate('creatorId assigneeIds labelIds parentTaskId')
      .sort({ orderIndex: 1 })
      .exec();
  }

  async findByAssignee(assigneeId: string): Promise<TaskDocument[]> {
    return this.taskModel
      .find({
        assigneeIds: new Types.ObjectId(assigneeId),
        isActive: true,
      })
      .populate('listId creatorId assigneeIds labelIds parentTaskId')
      .sort({ dueDate: 1 })
      .exec();
  }

  async findOne(id: string): Promise<TaskDocument> {
    const task = await this.taskModel
      .findById(id)
      .populate('listId creatorId assigneeIds labelIds parentTaskId')
      .exec();

    if (!task) {
      throw new NotFoundException(`Task with ID ${id} not found`);
    }

    return task;
  }

  async findSubtasks(parentTaskId: string): Promise<TaskDocument[]> {
    return this.taskModel
      .find({
        parentTaskId: new Types.ObjectId(parentTaskId),
        isSubtask: true,
        isActive: true,
      })
      .populate('creatorId assigneeIds labelIds')
      .sort({ orderIndex: 1 })
      .exec();
  }

  async createSubtask(parentTaskId: string, createTaskDto: CreateTaskDto): Promise<TaskDocument> {
    const parentTask = await this.findOne(parentTaskId);
    if (!parentTask) {
      throw new NotFoundException(`Parent task with ID ${parentTaskId} not found`);
    }

    const subtaskData = {
      ...createTaskDto,
      parentTaskId: new Types.ObjectId(parentTaskId),
      isSubtask: true,
      listId: parentTask.listId,
    };

    const createdSubtask = new this.taskModel(subtaskData);
    return createdSubtask.save();
  }

  async getTaskWithSubtasks(id: string): Promise<TaskDocument & { subtasks: TaskDocument[] }> {
    const task = await this.findOne(id);
    const subtasks = await this.findSubtasks(id);

    return {
      ...(task as any).toObject(),
      subtasks,
    };
  }

  async calculateTaskProgress(id: string): Promise<number> {
    const subtasks = await this.findSubtasks(id);

    if (subtasks.length === 0) {
      return 0;
    }

    const completedSubtasks = subtasks.filter((subtask) => subtask.status === 'done');
    return Math.round((completedSubtasks.length / subtasks.length) * 100);
  }

  async update(id: string, updateTaskDto: UpdateTaskDto, userId?: string): Promise<TaskDocument> {
    const oldTask = await this.findOne(id);

    const task = await this.taskModel
      .findByIdAndUpdate(id, updateTaskDto, { new: true })
      .populate('listId creatorId assigneeIds labelIds parentTaskId')
      .exec();

    if (!task) {
      throw new NotFoundException(`Task with ID ${id} not found`);
    }

    // 상태가 변경된 경우 알림 처리
    if (updateTaskDto.status && oldTask.status !== updateTaskDto.status) {
      if (updateTaskDto.status === 'done' && userId) {
        // 작업 완료 이벤트 발행 (작업 생성자에게)
        if (oldTask.creatorId.toString() !== userId) {
          // 완료자와 생성자가 다른 경우에만 알림
          this.notificationEventHelper.emitTaskCompleted(
            oldTask.creatorId.toString(),
            task._id.toString(),
            task.title,
            userId,
            '사용자', // 실제로는 User 정보를 조회해야 함
            'creator@example.com', // 실제로는 User 정보를 조회해야 함
          );
        }
      }
    }

    return task;
  }

  async updateStatus(id: string, status: string, userId?: string): Promise<TaskDocument> {
    return this.update(id, { status }, userId);
  }

  async assignUser(id: string, userId: string, assignedBy?: string): Promise<TaskDocument> {
    const task = await this.findOne(id);
    const assigneeIds = task.assigneeIds || [];

    if (!assigneeIds.some((assigneeId) => assigneeId.toString() === userId)) {
      assigneeIds.push(new Types.ObjectId(userId));

      const updatedTask = await this.update(id, { assigneeIds });

      // 작업 할당 이벤트 발행
      if (assignedBy && assignedBy !== userId) {
        // 할당자와 피할당자가 다른 경우에만 알림
        this.notificationEventHelper.emitTaskAssigned(
          userId,
          updatedTask._id.toString(),
          updatedTask.title,
          assignedBy,
          '할당자', // 실제로는 User 정보를 조회해야 함
          'assignee@example.com', // 실제로는 User 정보를 조회해야 함
        );
      }

      return updatedTask;
    }

    return task;
  }

  async unassignUser(id: string, userId: string): Promise<TaskDocument> {
    const task = await this.findOne(id);
    const assigneeIds = (task.assigneeIds || []).filter((assigneeId) => assigneeId.toString() !== userId);

    return this.update(id, { assigneeIds });
  }

  async remove(id: string): Promise<TaskDocument> {
    const task = await this.taskModel.findByIdAndUpdate(id, { isActive: false }, { new: true }).exec();

    if (!task) {
      throw new NotFoundException(`Task with ID ${id} not found`);
    }

    return task;
  }

  async reorderTasks(listId: string, taskIds: string[]): Promise<void> {
    const bulkOps = taskIds.map((taskId, index) => ({
      updateOne: {
        filter: { _id: new Types.ObjectId(taskId) },
        update: { orderIndex: index },
      },
    }));

    await this.taskModel.bulkWrite(bulkOps);
  }

  async searchTasks(query: string, userId?: string): Promise<TaskDocument[]> {
    const searchCriteria: any = {
      isActive: true,
      $or: [{ title: { $regex: query, $options: 'i' } }, { description: { $regex: query, $options: 'i' } }],
    };

    if (userId) {
      searchCriteria.$or.push({ assigneeIds: new Types.ObjectId(userId) });
    }

    return this.taskModel
      .find(searchCriteria)
      .populate('listId creatorId assigneeIds labelIds parentTaskId')
      .sort({ dueDate: 1 })
      .exec();
  }

  async findTasksByDateRange(startDate: Date, endDate: Date, userId?: string): Promise<TaskDocument[]> {
    const criteria: any = {
      isActive: true,
      dueDate: {
        $gte: startDate,
        $lte: endDate,
      },
    };

    if (userId) {
      criteria.assigneeIds = new Types.ObjectId(userId);
    }

    return this.taskModel
      .find(criteria)
      .populate('listId creatorId assigneeIds labelIds parentTaskId')
      .sort({ dueDate: 1 })
      .exec();
  }

  async findTasksDueToday(userId?: string): Promise<TaskDocument[]> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    return this.findTasksByDateRange(today, tomorrow, userId);
  }

  async findUpcomingTasks(userId?: string): Promise<TaskDocument[]> {
    const today = new Date();
    const weekFromNow = new Date();
    weekFromNow.setDate(weekFromNow.getDate() + 7);

    return this.findTasksByDateRange(today, weekFromNow, userId);
  }

  // 프로젝트별 작업 통계
  async getProjectTaskStats(projectId: string): Promise<any> {
    // 프로젝트의 보드들을 통해 작업 통계를 계산해야 합니다
    // 여기서는 기본 구조만 제공합니다
    return {
      totalTasks: 0,
      completedTasks: 0,
      inProgressTasks: 0,
      todoTasks: 0,
      overdueTasks: 0,
    };
  }
}
