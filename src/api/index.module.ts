import { Module } from '@nestjs/common';
import { UserModule } from './user/user.module';
import { AuthModule } from './auth/auth.module';
import { LlmModule } from './llm/llm.module';
import { LoggingInterceptor } from 'src/interceptors/logging.interceptor';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { LearningQuizModule } from './learning-quiz/learning-quiz.module';

@Module({
  imports: [UserModule, AuthModule, LlmModule, LearningQuizModule],
  providers: [
    {
      provide: APP_INTERCEPTOR,
      useClass: LoggingInterceptor,
    },
  ],
})
export class ApiModule {}
