import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type LabelDocument = Label & Document;

@Schema({ timestamps: true })
export class Label {
  @Prop({ type: Types.ObjectId, ref: 'Project', required: true })
  projectId: Types.ObjectId;

  @Prop({ required: true })
  name: string;

  @Prop({ required: true })
  color: string;

  @Prop()
  description?: string;

  @Prop({ default: true })
  isActive: boolean;

  @Prop({ type: [{ type: Types.ObjectId, ref: 'Task' }], default: [] })
  taskIds: Types.ObjectId[];
}

export const LabelSchema = SchemaFactory.createForClass(Label);
