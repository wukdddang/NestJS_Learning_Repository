import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersModel } from '../users/entities/users.entity';
import { HASH_ROUNDS, JWT_SECRET } from './const/auth.const';
import { UsersService } from '../users/users.service';
import * as bcrypt from 'bcrypt';
import { RegisterUserDto } from './dto/register-user.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly usersService: UsersService,
  ) {}

  /**
   * 토큰을 사용하는 방식
   *
   * 1) 사용자가 로그인 / 회원가입을 진행하면
   *   -> accessToken, refreshToken을 발급
   * 2) 로그인 할때는 Basic 토큰과 함께 요청을 보낸다.
   *   ex) Basic 토큰 -> 'email:password'를 base64로 인코딩한 값
   * 3) 아무나 접근할 수 없는 정보 (private route)를 접근할 떄는 accessToken을 Header에 담아서 요청을 보낸다.
   *   ex) { authorization: `Bearer ${accessToken}` }
   *
   * 4) 토큰과 요청을 함께 받은 서버는 토큰 검증을 통해 현재 요청을 보낸 사용자를 확인할 수 있다.
   *   ex) 현재 로그인한 사용자가 작성한 포스트
   *     -> 토큰의 sub에 입력된 사용자의 포스트만 필터링
   * 5) 모든 토큰은 만료 기간이 있따. 만료기간이 지나면 재발급을 진행해야 한다.
   *   -> 만료기간이 지나면 throw new ...Exception refreshToken을 사용해서 accessToken을 재발급
   *   -> /auth/token/access, /auth/token/refresh
   *
   */

  /**
   * 헤더로부터 토큰을 받을 때
   *
   * { authorization: `Basic ${base64(email:password)}` }
   * { authorization: `Bearer ${accessToken}` }
   */
  extractTokenFromHeader(header: string, isBearer: boolean) {
    const splitToken = header.split(' ');

    const prefix = isBearer ? 'Bearer' : 'Basic';

    if (splitToken.length !== 2 || splitToken[0] !== prefix) {
      throw new UnauthorizedException('토큰이 올바르지 않습니다.');
    }

    return splitToken[1];
  }

  decodeBasicToken(token: string) {
    const decodedToken = Buffer.from(token, 'base64').toString('utf-8');

    const splitToken = decodedToken.split(':');

    if (splitToken.length !== 2) {
      throw new UnauthorizedException('잘못된 유형의 토큰입니다.');
    }

    const email = splitToken[0];
    const password = splitToken[1];

    return { email, password };
  }

  verifyToken(token: string) {
    try {
      return this.jwtService.verify(token, {
        secret: JWT_SECRET,
      });
    } catch (e) {
      throw new UnauthorizedException('토큰이 만료되었거나 잘못된 토큰입니다.');
    }
  }

  rotateToken(token: string, isRefreshToken: boolean) {
    const decodedToken = this.verifyToken(token);

    if (decodedToken.type !== 'refresh') {
      throw new BadRequestException('토큰 재발급은 refresh 토큰만 가능합니다.');
    }

    return this.signToken(
      {
        ...decodedToken,
      },
      isRefreshToken,
    );
  }

  /**
   * 만들 기능
   *
   * 1) registerWithEmail
   *   -> email, nickname, password를 입력받고 사용자를 생성
   *   -> 생성 완료되면 accessToken, refreshToken을 발급
   *   -> (회원가입 후 다시 로그인 방지)
   *
   * 2) loginWithEmail
   *   -> email, password를 입력하면 사용자 검증을 진행
   *   -> 검증 완료되면 accessToken, refreshToken을 발급
   *
   * 3) loginUser
   *   -> 1), 2)에서 필요한 accessToken, refreshToken을 반환하는 로직
   *
   * 4) signToken
   *   -> 3)에서 필요한 accessToken, refreshToken을 sign하는 로직
   *
   * 5) authenticateWithEmailAndPassword
   *   -> 2)에서 로그인을 진행할 때 필요한 기본 검증 진행
   *   1. 사용자가 존재하는지 확인(email)
   *   2. 사용자의 비밀번호가 일치하는지 확인(password)
   *   3. 모두 통과하면 사용자 정보 반환
   *   4. loginWithEmail에서 받은 데이터 기반으로 토큰 생성
   */

  /**
   * payload
   * 1) email
   * 2) sub(id)
   * 3) type : 'access' | 'refresh'
   */
  signToken(user: Pick<UsersModel, 'email' | 'id'>, isRefreshToken: boolean) {
    const payload = {
      email: user.email,
      sub: user.id,
      type: isRefreshToken ? 'refresh' : 'access',
    };

    return this.jwtService.sign(payload, {
      secret: JWT_SECRET,
      expiresIn: isRefreshToken ? 3600 : 300,
    });
  }

  loginUser(user: Pick<UsersModel, 'email' | 'id'>) {
    return {
      accessToken: this.signToken(user, false),
      refreshToken: this.signToken(user, true),
    };
  }

  async authenticateWithEmailAndPassword(
    user: Pick<UsersModel, 'email' | 'password'>,
  ) {
    /**
     * 1. 사용자가 존재하는지 확인(email)
     * 2. 사용자의 비밀번호가 일치하는지 확인(password)
     * 3. 모두 통과하면 사용자 정보 반환
     */
    const existingUser = await this.usersService.getUserByEmail(user.email);

    if (!existingUser) {
      throw new UnauthorizedException('존재하지 않는 사용자입니다.');
    }

    const passOk = await bcrypt.compare(user.password, existingUser.password);

    if (!passOk) {
      throw new UnauthorizedException('비밀번호가 일치하지 않습니다.');
    }

    return existingUser;
  }

  async loginWithEmail(user: Pick<UsersModel, 'email' | 'password'>) {
    const existingUser = await this.authenticateWithEmailAndPassword(user);

    return this.loginUser(existingUser);
  }

  async registerWithEmail(user: RegisterUserDto) {
    const hashedPassword = await bcrypt.hash(user.password, HASH_ROUNDS);

    const newUser = await this.usersService.createUser({
      ...user,
      password: hashedPassword,
    });

    return this.loginUser(newUser);
  }
}
