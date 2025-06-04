import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type ListDocument = List & Document;

@Schema({ timestamps: true })
export class List {
  @Prop({ type: Types.ObjectId, ref: 'Board', required: true })
  boardId: Types.ObjectId;

  @Prop({ required: true })
  name: string;

  @Prop({ default: 0 })
  orderIndex: number;

  @Prop({ default: true })
  isActive: boolean;
}

export const ListSchema = SchemaFactory.createForClass(List);
