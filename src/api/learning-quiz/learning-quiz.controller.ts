import { Controller, Post, Body, UseGuards, Req } from '@nestjs/common';
import { LearningQuizService } from './learning-quiz.service';
import { CreateLearningQuizDto } from './dto/create-learning-quiz.dto';
import { AuthGuard } from '@nestjs/passport';
import { Request } from 'express';

@Controller('learning-quiz')
export class LearningQuizController {
  constructor(private readonly learningQuizService: LearningQuizService) {}

  @Post()
  @UseGuards(AuthGuard('jwt'))
  create(
    @Body() createLearningQuizDto: CreateLearningQuizDto,
    @Req() req: Request,
  ) {
    const { userId } = req.user as any;

    return this.learningQuizService.create(createLearningQuizDto, userId);
  }
}
