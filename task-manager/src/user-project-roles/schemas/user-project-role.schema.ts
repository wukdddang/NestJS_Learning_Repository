import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type UserProjectRoleDocument = UserProjectRole & Document;

@Schema({ timestamps: true })
export class UserProjectRole {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  userId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Project', required: true })
  projectId: Types.ObjectId;

  @Prop({ required: true, enum: ['admin', 'member', 'viewer'], default: 'member' })
  role: string;

  @Prop({ default: true })
  isActive: boolean;
}

export const UserProjectRoleSchema = SchemaFactory.createForClass(UserProjectRole);

// 복합 인덱스: 한 사용자는 한 프로젝트에서 하나의 역할만 가질 수 있음
UserProjectRoleSchema.index({ userId: 1, projectId: 1 }, { unique: true });
