import { Controller, Post, Body, UseGuards, Req } from '@nestjs/common';
import { LlmService } from './llm.service';
import { GenerateQuizDto } from './dto/generate-quiz.dto';
import { GenerateFortuneDto } from './dto/generate-fortune.dto';
import { AuthGuard } from '@nestjs/passport';
import { Request } from 'express';
import {
  IQuizData,
  IFortuneData,
} from './interfaces/ollama-response.interface';

@Controller('llm')
export class LlmController {
  constructor(private readonly llmService: LlmService) {}

  @Post('quiz')
  @UseGuards(AuthGuard('jwt'))
  async generateQuizWithAuth(
    @Body() generateQuizDto: GenerateQuizDto,
    @Req() req: Request,
  ): Promise<IQuizData> {
    const { userId } = req.user as any;
    return this.llmService.generateQuiz(generateQuizDto, userId);
  }

  @Post('quiz/guest')
  async generateQuizWithoutAuth(
    @Body() generateQuizDto: GenerateQuizDto,
  ): Promise<IQuizData> {
    return this.llmService.generateQuiz(generateQuizDto);
  }

  @Post('fortune')
  async generateFortune(@Body() generateFortuneDto: GenerateFortuneDto) {
    console.log('generateFortuneDto : ', generateFortuneDto);
    return this.llmService.generateFortune(generateFortuneDto);
  }
}
