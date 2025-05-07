import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const { method, url, body } = request;
    const timestamp = new Date().toISOString();

    console.log(`[${timestamp}] 요청: ${method} ${url}`);
    // console.log('요청 바디:', JSON.stringify(body, null, 2));

    return next.handle().pipe(
      tap({
        next: (data) => {
          console.log(`[${timestamp}] 응답:`, JSON.stringify(data, null, 2));
        },
        error: (error) => {
          console.error(`[${timestamp}] 에러 발생:`);
          console.error('에러 메시지:', error.message);
          // if (error.response) {
          //   console.error(
          //     '에러 응답:',
          //     JSON.stringify(error.response.data, null, 2),
          //   );
          // }
        },
      }),
    );
  }
}
