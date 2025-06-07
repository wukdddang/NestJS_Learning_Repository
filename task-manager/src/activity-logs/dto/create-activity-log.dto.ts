import { IsString, IsNotEmpty, IsMongoId, IsEnum, IsOptional } from 'class-validator';
import { Types } from 'mongoose';

export class CreateActivityLogDto {
  @IsMongoId()
  @IsNotEmpty()
  projectId: Types.ObjectId;

  @IsMongoId()
  @IsOptional()
  taskId?: Types.ObjectId;

  @IsMongoId()
  @IsNotEmpty()
  userId: Types.ObjectId;

  @IsEnum([
    'task_created',
    'task_updated',
    'task_completed',
    'task_assigned',
    'task_moved',
    'comment_added',
    'attachment_added',
    'project_updated',
  ])
  @IsNotEmpty()
  actionType: string;

  @IsString()
  @IsNotEmpty()
  details: string;

  @IsString()
  @IsOptional()
  previousValue?: string;

  @IsString()
  @IsOptional()
  newValue?: string;
}
