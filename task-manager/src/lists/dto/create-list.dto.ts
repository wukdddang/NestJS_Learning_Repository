import { IsString, IsOptional, IsMongoId, IsNotEmpty, IsNumber } from 'class-validator';
import { Types } from 'mongoose';

export class CreateListDto {
  @IsMongoId()
  @IsNotEmpty()
  boardId: Types.ObjectId;

  @IsString()
  @IsNotEmpty()
  name: string;

  @IsNumber()
  @IsOptional()
  orderIndex?: number;
}
