/**
 * 구현할 기능
 *
 * 1) 요청 객체 (request)를 불러오고 authorization header로부터 토큰을 가져온다.
 * 2) authService.extractTokenFromHeader()를 사용할 수 있는 형태로 토큰을 추출한다.
 * 3) authService.decodeBasicToken()를 사용하여 email과 password를 추출한다.
 * 4) email, password를 authService.authenticateWithEmailAndPassword()를 사용하여 인증한다.
 * 5) 찾아낸 사용자를 request 객체에 저장한다.
 *   req.user = user;
 */
import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthService } from '../auth.service';

@Injectable()
export class BasicTokenGuard implements CanActivate {
  constructor(private readonly authService: AuthService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = context.switchToHttp().getRequest();

    const rawToken = req.headers['authorization'];

    if (!rawToken) {
      throw new UnauthorizedException('토큰이 없습니다!');
    }

    const token = this.authService.extractTokenFromHeader(rawToken, false);

    const { email, password } = this.authService.decodeBasicToken(token);

    req.user = await this.authService.authenticateWithEmailAndPassword({
      email,
      password,
    });

    return true;
  }
}
