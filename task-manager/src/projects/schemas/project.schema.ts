import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type ProjectDocument = Project & Document;

@Schema({ timestamps: true })
export class Project {
  @Prop({ type: Types.ObjectId, ref: 'Workspace', required: true })
  workspaceId: Types.ObjectId;

  @Prop({ required: true })
  name: string;

  @Prop()
  description?: string;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  leadUserId: Types.ObjectId;

  @Prop({ default: true })
  isActive: boolean;

  @Prop()
  color?: string;

  @Prop()
  icon?: string;

  // timestamps로 자동 생성되는 필드들
  createdAt?: Date;
  updatedAt?: Date;
}

export const ProjectSchema = SchemaFactory.createForClass(Project);
