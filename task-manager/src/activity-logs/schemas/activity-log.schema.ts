import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { ActivityActionType, ACTIVITY_ACTION_TYPES } from '../enums/action-type.enum';

// 활동 로그 문서 타입
export type ActivityLogDocument = ActivityLog & Document;

// 활동 로그 스키마 정의
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
    enum: ACTIVITY_ACTION_TYPES,
    type: String,
  })
  actionType: ActivityActionType;

  @Prop({ required: true })
  details: string;

  @Prop()
  previousValue?: string;

  @Prop()
  newValue?: string;

  createdAt: Date;
  updatedAt: Date;
}

export const ActivityLogSchema = SchemaFactory.createForClass(ActivityLog);
