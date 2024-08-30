import { BadRequestException, Injectable } from '@nestjs/common';
import { BasePaginationDto } from './dto/base-pagination.dto';
import { FindManyOptions, FindOptionsOrder, Repository } from 'typeorm';
import { BaseModel } from './entity/base.entity';
import { FindOptionsWhere } from 'typeorm/find-options/FindOptionsWhere';
import { FILTER_MAPPER } from './const/filter-mapper.const';
import { ConfigService } from '@nestjs/config';
import { ENV_HOST_KEY, ENV_PROTOCOL_KEY } from './const/env-keys.const';

@Injectable()
export class CommonService {
  constructor(private readonly configService: ConfigService) {}

  paginate<T extends BaseModel>(
    dto: BasePaginationDto,
    repository: Repository<T>,
    overrideFindOptions: FindManyOptions<T> = {},
    path: string,
  ) {
    if (dto.page) {
      return this.pagePaginate(dto, repository, overrideFindOptions);
    } else {
      return this.cursorPaginate(dto, repository, overrideFindOptions, path);
    }
  }

  private async pagePaginate<T extends BaseModel>(
    dto: BasePaginationDto,
    repository: Repository<T>,
    overrideFindOptions: FindManyOptions<T> = {},
  ) {
    const findOptions = this.composeFindOptions<T>(dto);

    const [data, count] = await repository.findAndCount({
      ...findOptions,
      ...overrideFindOptions,
    });

    return {
      data,
      total: count,
    };
  }

  private async cursorPaginate<T extends BaseModel>(
    dto: BasePaginationDto,
    repository: Repository<T>,
    overrideFindOptions: FindManyOptions<T> = {},
    path: string,
  ) {
    const findOptions = this.composeFindOptions<T>(dto);

    const results = await repository.find({
      ...findOptions,
      ...overrideFindOptions,
    });

    const lastItem =
      results.length > 0 && results.length === dto.take
        ? results[results.length - 1]
        : null;

    const PROTOCOL = this.configService.get<string>(ENV_PROTOCOL_KEY);
    const HOST = this.configService.get<string>(ENV_HOST_KEY);

    const nextUrl = lastItem && new URL(`${PROTOCOL}://${HOST}/${path}`);

    if (nextUrl) {
      for (const key of Object.keys(dto)) {
        if (dto[key]) {
          if (
            key !== 'where__id__more_than' &&
            key !== 'where__id__less_than'
          ) {
            nextUrl.searchParams.append(key, dto[key]);
          }
        }
      }

      let key = null;

      if (dto.order__createdAt === 'ASC') {
        key = 'where__id__more_than';
      } else {
        key = 'where__id__less_than';
      }

      nextUrl.searchParams.append(key, lastItem.id.toString());
    }

    return {
      data: results,
      cursor: {
        after: lastItem?.id ?? null,
      },
      count: results.length,
      next: nextUrl?.toString() ?? null,
    };
  }

  private composeFindOptions<T extends BaseModel>(
    dto: BasePaginationDto,
  ): FindManyOptions<T> {
    /**
     * where,
     * order,
     * take,
     * skip -> page 기반일 때만 반환
     */
    /**
     * DTO 구조
     * {
     *   where__id__more_than: 1,
     *   order__createdAt: 'ASC',
     * }
     *
     * 현재는 where__id__more_than / where__id__less_than만 사용중이지만
     * 나중에 다른 where 조건이 추가될 수 있으므로 모든 where 조건을 받아서 처리할 수 있도록 구현
     *
     * 1) where로 시작한다면 필터 로직을 적용한다.
     * 2) order로 시작한다면 정렬 로직을 적용한다.
     * 3) 필터 로직을 적용한다면 '__' 기준으로 split을 했을 때 3개의 값으로 나뉘는지, 2개의 값으로 나뉘는지 확인한다.
     *   3-1) 3개로 나뉜다면, FILTER_MAPPER에서 해당 operator 함수를 찾아 적용한다.
     *     ['where', 'id', 'more_than']
     *   3-2) 2개로 나뉜다면, 정확한 값을 필터하는 것이므로 operator 없이 적용한다.
     *     ['where', 'id']
     * 4) order의 경우 3-2와 같이 적용한다. (항상 2개로 나뉘기 때문)
     *
     */

    let where: FindOptionsWhere<T> = {};
    let order: FindOptionsOrder<T> = {};

    for (const [key, value] of Object.entries(dto)) {
      // ex)
      // key -> where__id__less_than
      // value -> 1
      if (key.startsWith('where__')) {
        where = {
          ...where,
          ...this.parseWhereFilter(key, value),
        };
      } else if (key.startsWith('order__')) {
        order = {
          ...order,
          ...this.parseWhereFilter(key, value),
        };
      }
    }
    return {
      where,
      order,
      take: dto.take,
      skip: dto.page ? dto.take * (dto.page - 1) : null,
    };
  }

  private parseWhereFilter<T extends BaseModel>(
    key: string,
    value: any,
  ): FindOptionsWhere<T> | FindOptionsOrder<T> {
    const options: FindOptionsWhere<T> = {};

    /**
     * ex) where__id__more_than
     * __ 기준으로 나눌 때
     *
     * => ['where', 'id', 'more_than'] 나눌 수 있다.
     */
    const split = key.split('__');

    if (split.length !== 2 && split.length !== 3) {
      throw new BadRequestException(`
      where 필터는 '__'로 split 했을 때 길이가 2 또는 3이어야 합니다. - 문제되는 키 값: ${key}`);
    }

    /**
     * ex) 길이가 2일 경우는
     *  where__id = 3
     */
    if (split.length === 2) {
      // [where, id]
      const [_, field] = split;

      /**
       * field -> 'id'
       * value -> 3
       *
       * {
       *   id: 3
       * }
       */

      options[field] = value;
    } else {
      /**
       * 길이가 3일 경우 TypeOrm 유틸리티 적용이 필요한 경우이다.
       *
       * where__id__more_than = 3
       * id는 필터할 키 값, more_than은 TypeOrm 유틸리티 함수가 된다.
       *
       * FILTER _MAPPER에 미리 정의해둔 값으로
       * field 값에 FILTER_MAPPER에 해당되는 유틸리티를 가져온 후 적용한다.
       */

      // ex)
      // [where, id, more_than]
      const [_, field, operator] = split;

      // where__id__between = 3,4
      // 만약에 split 대상 문자가 존재하지 않으면 길이가 무조건 1이다.
      // const values = value.toString().split(',');

      // field -> id
      // operator -> more_than
      // FILTER_MAPPER[more_than] -> MoreThan

      // 이런식으로 해보면 된다.
      // if (operator === 'between') {
      //   options[field] = FILTER_MAPPER[operator](values[0], values[1]);
      // } else {
      //   options[field] = FILTER_MAPPER[operator](value);
      // }

      /**
       * where: {
       *   id: MoreThan(3)
       * }
       */

      if (operator === 'i_like') {
        options[field] = FILTER_MAPPER[operator](`%${value}%`);
      } else {
        options[field] = FILTER_MAPPER[operator](value);
      }
    }

    return options;
  }
}
