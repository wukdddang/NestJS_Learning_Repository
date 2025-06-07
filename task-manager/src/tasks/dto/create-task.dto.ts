import { IsString, IsOptional, IsMongoId, IsNotEmpty, IsArray, IsEnum, IsDateString, IsBoolean } from 'class-validator';
import { Types } from 'mongoose';

export class CreateTaskDto {
  @IsMongoId()
  @IsNotEmpty()
  listId: Types.ObjectId;

  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsDateString()
  @IsOptional()
  dueDate?: Date;

  @IsMongoId()
  @IsNotEmpty()
  creatorId: Types.ObjectId;

  @IsArray()
  @IsMongoId({ each: true })
  @IsOptional()
  assigneeIds?: Types.ObjectId[];

  @IsArray()
  @IsMongoId({ each: true })
  @IsOptional()
  labelIds?: Types.ObjectId[];

  @IsEnum(['todo', 'in-progress', 'done'])
  @IsOptional()
  status?: string;

  @IsEnum(['low', 'medium', 'high', 'urgent'])
  @IsOptional()
  priority?: string;

  @IsMongoId()
  @IsOptional()
  parentTaskId?: Types.ObjectId;

  @IsBoolean()
  @IsOptional()
  isSubtask?: boolean;
}
