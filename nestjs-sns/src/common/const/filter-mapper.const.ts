import {
  Any,
  ArrayContains,
  ArrayContainedBy,
  ArrayOverlap,
  Between,
  Like,
  ILike,
  Equal,
  In,
  IsNull,
  LessThan,
  LessThanOrEqual,
  MoreThan,
  MoreThanOrEqual,
  Not,
} from 'typeorm';

/**
 * where__id__not
 *
 * {
 *   where: {
 *     id: Not(value)
 *   }
 * }
 */
export const FILTER_MAPPER = {
  not: Not,
  less_than: LessThan,
  less_than_or_equal: LessThanOrEqual,
  more_than: MoreThan,
  more_than_or_equal: MoreThanOrEqual,
  equal: Equal,
  like: Like,
  i_like: ILike,
  between: Between,
  in: In,
  any: Any,
  is_null: IsNull,
  array_contains: ArrayContains,
  array_contained_by: ArrayContainedBy,
  array_overlap: ArrayOverlap,
};
