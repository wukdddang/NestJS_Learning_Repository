import { IsString, IsMongoId, IsNotEmpty, IsNumber } from 'class-validator';
import { Types } from 'mongoose';

export class CreateAttachmentDto {
  @IsMongoId()
  @IsNotEmpty()
  taskId: Types.ObjectId;

  @IsMongoId()
  @IsNotEmpty()
  uploadedBy: Types.ObjectId;

  @IsString()
  @IsNotEmpty()
  fileName: string;

  @IsString()
  @IsNotEmpty()
  originalName: string;

  @IsString()
  @IsNotEmpty()
  fileUrl: string;

  @IsNumber()
  @IsNotEmpty()
  fileSize: number;

  @IsString()
  @IsNotEmpty()
  mimeType: string;
}
