import { PartialType, OmitType } from '@nestjs/mapped-types';
import { CreateAuthDto } from './create-auth.dto';

export class UpdateAuthDto extends PartialType(OmitType(CreateAuthDto, ['password'] as const)) {}
