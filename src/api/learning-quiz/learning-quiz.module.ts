import { Module } from '@nestjs/common';
import { LearningQuizService } from './learning-quiz.service';
import { LearningQuizController } from './learning-quiz.controller';
import { PrismaModule } from '../../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [LearningQuizController],
  providers: [LearningQuizService],
})
export class LearningQuizModule {}
