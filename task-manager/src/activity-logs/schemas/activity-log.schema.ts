import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type ActivityLogDocument = ActivityLog & Document;

@Schema({ timestamps: true })
export class ActivityLog {
  @Prop({ type: Types.ObjectId, ref: 'Project', required: true })
  projectId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Task' })
  taskId?: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  userId: Types.ObjectId;

  @Prop({
    required: true,
    enum: [
      'task_created',
      'task_updated',
      'task_completed',
      'task_assigned',
      'task_moved',
      'comment_added',
      'attachment_added',
      'project_updated',
    ],
  })
  actionType: string;

  @Prop({ required: true })
  details: string;

  @Prop()
  previousValue?: string;

  @Prop()
  newValue?: string;
}

export const ActivityLogSchema = SchemaFactory.createForClass(ActivityLog);
