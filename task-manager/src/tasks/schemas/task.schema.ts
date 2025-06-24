import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type TaskDocument = Task &
  Document & {
    _id: Types.ObjectId;
  };

@Schema({ timestamps: true })
export class Task {
  @Prop({ type: Types.ObjectId, ref: 'List', required: true })
  listId: Types.ObjectId;

  @Prop({ required: true })
  title: string;

  @Prop()
  description?: string;

  @Prop()
  dueDate?: Date;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  creatorId: Types.ObjectId;

  @Prop({ type: [{ type: Types.ObjectId, ref: 'User' }] })
  assigneeIds: Types.ObjectId[];

  @Prop({ type: [{ type: Types.ObjectId, ref: 'Label' }] })
  labelIds: Types.ObjectId[];

  @Prop({ default: 0 })
  orderIndex: number;

  @Prop({ default: 'todo', enum: ['todo', 'in-progress', 'done'] })
  status: string;

  @Prop({ default: 'low', enum: ['low', 'medium', 'high', 'urgent'] })
  priority: string;

  @Prop({ default: true })
  isActive: boolean;

  @Prop({ type: Types.ObjectId, ref: 'Task', default: null })
  parentTaskId?: Types.ObjectId;

  @Prop({ default: false })
  isSubtask: boolean;
}

export const TaskSchema = SchemaFactory.createForClass(Task);
