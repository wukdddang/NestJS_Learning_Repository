import { BasePaginationDto } from '../../../common/dto/base-pagination.dto';
import { IsNumber, IsOptional, IsString } from 'class-validator';

export class PaginateCommentsDto extends BasePaginationDto {
  @IsNumber()
  @IsOptional()
  where__likeCount__more_than: number;

  @IsString()
  @IsOptional()
  where__comment__i_like: string;
}
