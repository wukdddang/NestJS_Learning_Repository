import { IsString, IsOptional, IsEnum, IsNotEmpty, MaxLength } from 'class-validator';

export class CreateWorkspaceDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  name: string;

  @IsString()
  @IsOptional()
  @MaxLength(500)
  description?: string;

  @IsEnum(['public', 'private'])
  @IsOptional()
  visibility?: 'public' | 'private' = 'public';

  @IsString()
  @IsOptional()
  color?: string;
}
