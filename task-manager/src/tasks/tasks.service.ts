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
      .populate('listId creatorId assigneeIds labelIds')
      .sort({ orderIndex: 1 })
      .exec();
  }

  async findByList(listId: string): Promise<Task[]> {
    return this.taskModel
      .find({ listId: new Types.ObjectId(listId), isActive: true })
      .populate('creatorId assigneeIds labelIds')
      .sort({ orderIndex: 1 })
      .exec();
  }

  async findByAssignee(assigneeId: string): Promise<Task[]> {
    return this.taskModel
      .find({
        assigneeIds: new Types.ObjectId(assigneeId),
        isActive: true,
      })
      .populate('listId creatorId assigneeIds labelIds')
      .sort({ dueDate: 1 })
      .exec();
  }

  async findOne(id: string): Promise<Task> {
    const task = await this.taskModel.findById(id).populate('listId creatorId assigneeIds labelIds').exec();

    if (!task) {
      throw new NotFoundException(`Task with ID ${id} not found`);
    }

    return task;
  }

  async update(id: string, updateTaskDto: UpdateTaskDto): Promise<Task> {
    const task = await this.taskModel
      .findByIdAndUpdate(id, updateTaskDto, { new: true })
      .populate('listId creatorId assigneeIds labelIds')
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
}
