import { IsString, IsNotEmpty, IsMongoId, IsEnum, IsOptional } from 'class-validator';
import { Types } from 'mongoose';

export class CreateNotificationDto {
  @IsMongoId()
  @IsNotEmpty()
  userId: Types.ObjectId;

  @IsString()
  @IsNotEmpty()
  message: string;

  @IsEnum(['task_assigned', 'task_due', 'comment_added', 'project_invite', 'task_completed'])
  @IsNotEmpty()
  type: string;

  @IsMongoId()
  @IsOptional()
  relatedTaskId?: Types.ObjectId;

  @IsMongoId()
  @IsOptional()
  relatedProjectId?: Types.ObjectId;

  @IsMongoId()
  @IsOptional()
  triggeredBy?: Types.ObjectId;
}
