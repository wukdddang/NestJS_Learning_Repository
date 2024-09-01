import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
} from '@nestjs/common';

@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse();
    const request = ctx.getRequest();
    const status = exception.getStatus();

    // 로그 파일을 생성하거나
    // 에러 모니터링 시스템에 API 콜 하는 경우
    // main.ts에서 useGlobalFilters()를 사용하면 모든 예외를 이곳으로 보낼 수 있음

    response.status(status).json({
      statusCode: status,
      message: exception.message,
      timestamp: new Date().toLocaleString('kr'),
      path: request.url,
    });
  }
}
