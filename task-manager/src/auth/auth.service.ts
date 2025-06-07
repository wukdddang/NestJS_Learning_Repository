import { Injectable, ConflictException, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { UsersService } from '../users/users.service';
import { CreateAuthDto } from './dto/create-auth.dto';
import { LoginDto } from './dto/login.dto';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  async register(createAuthDto: CreateAuthDto) {
    const { username, email, password } = createAuthDto;

    // 중복 사용자 확인
    const userExists = await this.usersService.checkUserExists(username, email);
    if (userExists) {
      throw new ConflictException('이미 존재하는 사용자명 또는 이메일입니다.');
    }

    // 비밀번호 해싱
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // 사용자 생성
    const createUserDto = {
      username,
      email,
      password: hashedPassword,
      isEmailVerified: false,
      isActive: true,
    };

    const user = await this.usersService.create(createUserDto);

    // 비밀번호 제외하고 응답 (사용자 생성시 이미 비밀번호가 제외되어 반환됨)
    return user;
  }

  async login(loginDto: LoginDto) {
    const { username, password } = loginDto;

    const user = await this.validateUser(username, password);
    if (!user) {
      throw new UnauthorizedException('사용자명 또는 비밀번호가 일치하지 않습니다.');
    }

    const payload = {
      username: user.username,
      sub: user._id,
      email: user.email,
    };

    return {
      access_token: this.jwtService.sign(payload),
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        avatar: user.avatar,
      },
    };
  }

  async validateUser(username: string, password: string): Promise<any> {
    const user = await this.usersService.findByUsernameOrEmail(username);

    if (user && (await bcrypt.compare(password, user.password))) {
      const { password: _, ...result } = user.toObject();
      return result;
    }
    return null;
  }

  async findUserById(id: string) {
    return this.usersService.findOne(id);
  }

  async updateProfile(userId: string, updateData: any) {
    return this.usersService.update(userId, updateData);
  }

  async changePassword(userId: string, currentPassword: string, newPassword: string) {
    const user = await this.usersService.findByUsernameOrEmail(userId);

    if (!user) {
      throw new UnauthorizedException('사용자를 찾을 수 없습니다.');
    }

    // 현재 비밀번호 확인
    const isCurrentPasswordValid = await bcrypt.compare(currentPassword, user.password);
    if (!isCurrentPasswordValid) {
      throw new UnauthorizedException('현재 비밀번호가 일치하지 않습니다.');
    }

    // 새 비밀번호 해싱
    const saltRounds = 10;
    const hashedNewPassword = await bcrypt.hash(newPassword, saltRounds);

    // 비밀번호 업데이트
    await this.usersService.updatePassword(userId, hashedNewPassword);

    return { message: '비밀번호가 성공적으로 변경되었습니다.' };
  }
}
