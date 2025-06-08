import { IsString, IsNotEmpty, IsMongoId, IsEnum, IsOptional } from 'class-validator';
import { Types } from 'mongoose';
import { ActivityActionType, ACTIVITY_ACTION_TYPES } from '../enums/action-type.enum';

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

  @IsEnum(ACTIVITY_ACTION_TYPES)
  @IsNotEmpty()
  actionType: ActivityActionType;

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
