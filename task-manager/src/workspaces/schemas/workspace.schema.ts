import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { User } from '../../users/schemas/user.schema';

export type WorkspaceDocument = Workspace & Document;

@Schema({ timestamps: true })
export class Workspace {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  owner: Types.ObjectId | User;

  @Prop({ required: true, trim: true })
  name: string;

  @Prop({ trim: true })
  description?: string;

  @Prop({ default: true })
  isActive: boolean;

  @Prop({ type: [{ type: Types.ObjectId, ref: 'User' }] })
  members: (Types.ObjectId | User)[];

  // 설정 관련
  @Prop({ default: 'public' })
  visibility: 'public' | 'private';

  @Prop()
  color?: string;

  // timestamps로 자동 생성되는 필드들
  createdAt?: Date;
  updatedAt?: Date;
}

export const WorkspaceSchema = SchemaFactory.createForClass(Workspace);
