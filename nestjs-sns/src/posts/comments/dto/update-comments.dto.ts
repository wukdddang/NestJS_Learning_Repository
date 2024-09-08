import { CreateCommentsDto } from './create-comments.dto';
import { PartialType } from '@nestjs/mapped-types';
import { IsOptional, IsString } from 'class-validator';
import { stringValidationMessage } from '../../../common/validation-message/string-validation.message';

export class UpdateCommentsDto extends PartialType(CreateCommentsDto) {
  @IsString({
    message: stringValidationMessage,
  })
  @IsOptional()
  content?: string;
}
