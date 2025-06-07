import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Task, TaskDocument } from './schemas/task.schema';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';

@Injectable()
export class TasksService {
  constructor(@InjectModel(Task.name) private taskModel: Model<TaskDocument>) {}

  async create(createTaskDto: CreateTaskDto): Promise<Task> {
    const createdTask = new this.taskModel(createTaskDto);
    return createdTask.save();
  }

  async findAll(): Promise<Task[]> {
    return this.taskModel
      .find({ isActive: true })
      .populate('listId creatorId assigneeIds labelIds parentTaskId')
      .sort({ orderIndex: 1 })
      .exec();
  }

  async findByList(listId: string): Promise<Task[]> {
    return this.taskModel
      .find({ listId: new Types.ObjectId(listId), isActive: true })
      .populate('creatorId assigneeIds labelIds parentTaskId')
      .sort({ orderIndex: 1 })
      .exec();
  }

  async findByAssignee(assigneeId: string): Promise<Task[]> {
    return this.taskModel
      .find({
        assigneeIds: new Types.ObjectId(assigneeId),
        isActive: true,
      })
      .populate('listId creatorId assigneeIds labelIds parentTaskId')
      .sort({ dueDate: 1 })
      .exec();
  }

  async findOne(id: string): Promise<Task> {
    const task = await this.taskModel
      .findById(id)
      .populate('listId creatorId assigneeIds labelIds parentTaskId')
      .exec();

    if (!task) {
      throw new NotFoundException(`Task with ID ${id} not found`);
    }

    return task;
  }

  async findSubtasks(parentTaskId: string): Promise<Task[]> {
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

  async createSubtask(parentTaskId: string, createTaskDto: CreateTaskDto): Promise<Task> {
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

  async getTaskWithSubtasks(id: string): Promise<Task & { subtasks: Task[] }> {
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

  async update(id: string, updateTaskDto: UpdateTaskDto): Promise<Task> {
    const task = await this.taskModel
      .findByIdAndUpdate(id, updateTaskDto, { new: true })
      .populate('listId creatorId assigneeIds labelIds parentTaskId')
      .exec();

    if (!task) {
      throw new NotFoundException(`Task with ID ${id} not found`);
    }

    return task;
  }

  async updateStatus(id: string, status: string): Promise<Task> {
    return this.update(id, { status });
  }

  async assignUser(id: string, userId: string): Promise<Task> {
    const task = await this.findOne(id);
    const assigneeIds = task.assigneeIds || [];

    if (!assigneeIds.some((assigneeId) => assigneeId.toString() === userId)) {
      assigneeIds.push(new Types.ObjectId(userId));
      return this.update(id, { assigneeIds });
    }

    return task;
  }

  async unassignUser(id: string, userId: string): Promise<Task> {
    const task = await this.findOne(id);
    const assigneeIds = (task.assigneeIds || []).filter((assigneeId) => assigneeId.toString() !== userId);

    return this.update(id, { assigneeIds });
  }

  async remove(id: string): Promise<Task> {
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

  async searchTasks(query: string, userId?: string): Promise<Task[]> {
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

  async findTasksByDateRange(startDate: Date, endDate: Date, userId?: string): Promise<Task[]> {
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

  async findTasksDueToday(userId?: string): Promise<Task[]> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    return this.findTasksByDateRange(today, tomorrow, userId);
  }

  async findUpcomingTasks(userId?: string): Promise<Task[]> {
    const today = new Date();
    const weekFromNow = new Date();
    weekFromNow.setDate(weekFromNow.getDate() + 7);

    return this.findTasksByDateRange(today, weekFromNow, userId);
  }
}
