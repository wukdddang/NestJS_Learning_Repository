import { IsIn, IsNumber, IsOptional } from 'class-validator';
import { Type } from 'class-transformer';

export class BasePaginationDto {
  @IsNumber()
  @IsOptional()
  page?: number;

  @IsNumber()
  @IsOptional()
  where__id__less_than?: number;

  // 이전 마지막 데이터의 ID
  // 프로퍼티에 입력된 ID보다 높은 ID부터 값을 가져옴
  @IsNumber()
  @IsOptional()
  where__id__more_than?: number;

  // 정렬
  // createdAt을 기준으로 내림차/오름차[순 정렬
  @IsIn(['ASC', 'DESC'])
  @IsOptional()
  order__createdAt: 'ASC' | 'DESC' = 'ASC';

  // 몇 개의 데이터를 응답으로 받을지

  @Type(() => Number)
  @IsNumber()
  @IsOptional()
  take = 20;
}
