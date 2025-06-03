import { IsString } from 'class-validator';

export class UploadMovieFileDto {
  @IsString()
  originalName: string;

  @IsString()
  fileName: string;

  @IsString()
  filePath: string;
}
