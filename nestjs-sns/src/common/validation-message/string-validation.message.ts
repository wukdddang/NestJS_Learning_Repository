import { ValidationArguments } from 'class-validator';

export const stringValidationMessage = (args: ValidationArguments) => {
  return `${args.property}은 string을 입력해주어야 합니다.`;
};
