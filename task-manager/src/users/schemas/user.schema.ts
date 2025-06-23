import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type UserDocument = User & Document;

@Schema({ timestamps: true })
export class User {
  @Prop({ required: true, unique: true })
  username: string;

  @Prop({ required: true, unique: true })
  email: string;

  @Prop({ required: true })
  password: string;

  @Prop()
  fullName?: string;

  @Prop()
  avatar?: string;

  @Prop({ default: false })
  isEmailVerified: boolean;

  @Prop({ default: true })
  isActive: boolean;

  @Prop()
  refreshToken?: string;

  @Prop({ type: [{ type: Types.ObjectId, ref: 'Task' }], default: [] })
  assignedTaskIds: Types.ObjectId[];
}

export const UserSchema = SchemaFactory.createForClass(User);
