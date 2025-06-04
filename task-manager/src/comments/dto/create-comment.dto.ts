import { IsString, IsOptional, IsMongoId, IsNotEmpty } from 'class-validator';
import { Types } from 'mongoose';

export class CreateCommentDto {
  @IsMongoId()
  @IsNotEmpty()
  taskId: Types.ObjectId;

  @IsMongoId()
  @IsNotEmpty()
  userId: Types.ObjectId;

  @IsString()
  @IsNotEmpty()
  text: string;

  @IsMongoId()
  @IsOptional()
  parentCommentId?: Types.ObjectId;
}
