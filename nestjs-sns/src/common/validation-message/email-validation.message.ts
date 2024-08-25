import { ValidationArguments } from 'class-validator';

export const emailValidationMessage = (args: ValidationArguments) => {
  return `${args.property}은 email 형식이어야 합니다.`;
};
