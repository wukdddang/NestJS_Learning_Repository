import { IsEmail, IsEnum, IsNotEmpty, IsString } from 'class-validator';
import { ROLE } from '../entities/user.entity';

export class CreateUserDto {
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsNotEmpty()
  @IsString()
  password: string;

  @IsNotEmpty()
  @IsEnum(ROLE)
  role: ROLE;
}
