import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateLearningQuizDto } from './dto/create-learning-quiz.dto';

@Injectable()
export class LearningQuizService {
  constructor(private prisma: PrismaService) {}

  async create(createLearningQuizDto: CreateLearningQuizDto, userId: number) {
    // 트랜잭션을 사용하여 원자적 작업 수행
    return await this.prisma.$transaction(async (prisma) => {
      // 현재 사용자의 퀴즈 개수 확인
      const quizCount = await prisma.learningQuiz.count({
        where: { userId },
      });

      // 10개가 넘는 경우 가장 오래된 퀴즈 삭제
      if (quizCount >= 10) {
        const oldestQuiz = await prisma.learningQuiz.findFirst({
          where: { userId },
          orderBy: { createdAt: 'asc' },
        });

        if (oldestQuiz) {
          await prisma.learningQuiz.delete({
            where: { id: oldestQuiz.id },
          });
        }
      }

      // 새로운 퀴즈 생성
      return await prisma.learningQuiz.create({
        data: {
          quiz: createLearningQuizDto.quiz,
          userId,
        },
      });
    });
  }
}
