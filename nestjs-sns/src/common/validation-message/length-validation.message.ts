import { ValidationArguments } from 'class-validator';

export const lengthValidationMessage = (args: ValidationArguments) => {
  /**
   * ValidationArguments
   * 1) value -> 현재 검증하고 있는 값 (입력된 값)
   * 2) constraints -> 파라미터에 입력된 제한 사항들
   *   args.constraints[0] -> 최소 길이
   *   args.constraints[1] -> 최대 길이
   * 3) targetName -> 검증하고 있는 클래스의 이름
   * 4) object -> 검증하고 있는 클래스의 인스턴스
   * 5) property -> 검증하고 있는 인스턴스의 프로퍼티 이름
   */
  if (args.constraints.length === 2) {
    return `${args.property}은 ${args.constraints[0]}~${args.constraints[1]}자 이어야 합니다!`;
  } else {
    return `${args.property}은 ${args.constraints[0]}자 이상이어야 합니다!`;
  }
};
