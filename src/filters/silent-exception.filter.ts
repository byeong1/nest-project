import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
} from '@nestjs/common';

@Catch()
export class SilentExceptionFilter implements ExceptionFilter {
  catch(exception: any, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse();
    const status =
      exception instanceof HttpException ? exception.getStatus() : 500;

    // getResponse() 값이 순환 참조가 없는 경우 그대로 전달
    if (exception instanceof HttpException) {
      const res = exception.getResponse();
      response.status(status).json(res);
    } else {
      // HttpException이 아니면 message만 전달
      response
        .status(status)
        .json({ message: exception.message || 'Internal server error' });
    }
  }
}
