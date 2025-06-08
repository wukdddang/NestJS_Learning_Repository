import { IsString, IsOptional, IsMongoId, IsNotEmpty } from 'class-validator';
import { Types } from 'mongoose';

export class CreateProjectDto {
  @IsMongoId()
  @IsNotEmpty()
  workspaceId: Types.ObjectId;

  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsString()
  @IsOptional()
  color?: string;

  @IsString()
  @IsOptional()
  icon?: string;
}
