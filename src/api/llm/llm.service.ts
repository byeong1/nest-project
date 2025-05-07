import { Injectable } from '@nestjs/common';
import axios, { AxiosInstance } from 'axios';
import {
  IOllamaResponse,
  IQuizData,
  IFortuneData,
} from './interfaces/ollama-response.interface';
import { GenerateQuizDto } from './dto/generate-quiz.dto';
import { GenerateFortuneDto } from './dto/generate-fortune.dto';
import { PrismaService } from '../../prisma/prisma.service';
import { getEmbedding } from './hf-embedding.util';
import { QdrantService } from './qdrant.service';
import { v4 as uuidv4 } from 'uuid';
import { LearningQuiz } from '@prisma/client';

@Injectable()
export class LlmService {
  private readonly axiosInstance: AxiosInstance;
  private readonly MAX_RETRY = 3;
  private readonly SIMILARITY_THRESHOLD = 0.85;
  private readonly TOP_K = 1;

  constructor(
    private readonly prisma: PrismaService,
    private readonly qdrantService: QdrantService,
  ) {
    this.axiosInstance = axios.create({
      baseURL: 'http://localhost:11434/api',
    });
  }

  /**
   * 중복되지 않는 수학 문제를 생성합니다.
   * @param generateQuizDto 프롬프트 및 생성 조건
   * @param userId (선택) 사용자 ID
   */
  async generateQuiz(
    generateQuizDto: GenerateQuizDto,
    userId?: number,
  ): Promise<IQuizData> {
    let retry = 0;
    let duplicateQuizzes: string[] = [];
    let lastResult: IQuizData | null = null;

    const learningQuizs: LearningQuiz[] =
      await this.prisma.learningQuiz.findMany({
        where: {
          userId: userId,
          deletedAt: null,
        },
      });

    while (retry < this.MAX_RETRY) {
      try {
        // 프롬프트 조립: 중복 판정된 문제를 누적해서 추가
        let prompt = this.buildPrompt(
          generateQuizDto.prompt,
          duplicateQuizzes,
          retry,
          learningQuizs,
        );

        // LLM 호출
        const result = await this.requestQuizFromLLM(prompt);
        lastResult = result;

        console.log('quiz :', result.quiz);

        // 임베딩 추출
        const embedding = await getEmbedding(result.quiz);

        // Qdrant에서 유사도 검색
        const similarResults = await this.qdrantService.searchSimilar(
          embedding,
          this.TOP_K,
        );

        console.log(
          '유사도 점수:',
          similarResults.map((item) => item.score),
        );

        const isDuplicate = similarResults.some(
          (item: any) => item.score >= this.SIMILARITY_THRESHOLD,
        );

        if (!isDuplicate) {
          // 중복이 아니면 문제(quiz)만 저장
          await this.qdrantService.saveEmbedding(uuidv4(), embedding, {
            quiz: result.quiz,
          });

          return result;
        } else {
          // 중복 판정된 문제를 누적
          duplicateQuizzes.push(result.quiz);
          retry++;
          console.warn(
            `유사한 문제가 발견되어 재생성 시도 (${retry}/${this.MAX_RETRY})`,
          );
        }
      } catch (error) {
        console.error('퀴즈 생성 중 오류:', error);
        throw new Error('퀴즈 생성에 실패했습니다.');
      }
    }
    // 마지막 시도 결과가 있으면 반환, 없으면 에러
    if (lastResult) {
      return lastResult;
    }
    throw new Error('중복되지 않는 문제를 생성하지 못했습니다.');
  }

  /**
   * 프롬프트를 동적으로 조립합니다.
   */
  private buildPrompt(
    basePrompt: string,
    duplicateQuizzes: string[],
    retry: number,
    learningQuizs?: LearningQuiz[],
  ): string {
    let prompt = basePrompt;

    // 학습하고자 하는 문제들을 프롬프트에 추가
    if (learningQuizs && learningQuizs.length > 0) {
      prompt +=
        '\n<start_of_turn>user\n아래는 사용자가 학습하고자 선택한 문제들입니다. 이 문제들의 난이도와 유형을 참고하여 비슷하거나 조금 더 어려운 새로운 문제를 만들어주세요. 단, 유사도가 높은 문제는 만들지 마세요, 난이도만 참고하여 문제를 만들어주세요:\n';
      learningQuizs.forEach((quiz, idx) => {
        prompt += `참고문제${idx + 1}: ${quiz.quiz}\n`;
      });
      prompt += '<end_of_turn>\n';
    }

    if (duplicateQuizzes.length > 0) {
      prompt +=
        '\n<start_of_turn>user\n아래 문제들과 내용, 정답, 상황, 수치, 맥락이 겹치거나 비슷하면 절대 생성하지 마! 완전히 새로운 문제를 만들어줘. 참고로, 이전에 생성된 문제들과의 유사도가 0.85 이상이면 중복으로 판단되므로, 반드시 0.85 미만의 유사도를 가진 새로운 문제를 만들어주세요:\n';
      duplicateQuizzes.forEach((quiz, idx) => {
        prompt += `중복${idx + 1}: ${quiz}\n`;
      });
      prompt += '<end_of_turn>\n';
    }
    if (retry > 0) {
      prompt +=
        '\n<start_of_turn>user\n이번에는 반드시 상황, 정답, 수치, 맥락이 완전히 새로운 문제를 만들어라! 이전 문제들과의 유사도가 0.85 미만이어야 한다!\n<end_of_turn>\n';
    }
    return prompt;
  }

  /**
   * LLM에 문제 생성을 요청합니다.
   */
  private async requestQuizFromLLM(prompt: string): Promise<IQuizData> {
    const response = await this.axiosInstance.post<IOllamaResponse>(
      '/generate',
      {
        model: 'qwen3:30b-a3b',
        prompt,
        stream: true,
        format: 'json',
        temperature: 0.9,
      },
    );

    let fullResponse = '';
    const responseData = response.data as unknown as string;
    const lines = responseData.split('\n');

    for (const line of lines) {
      if (!line.trim()) continue;
      const jsonData = JSON.parse(line);
      if (jsonData.response) {
        fullResponse += jsonData.response;
      }
      if (jsonData.done) {
        break;
      }
    }
    return JSON.parse(fullResponse) as IQuizData;
  }

  /**
   * 운세 생성 (기존 코드 유지)
   */
  async generateFortune(
    generateFortuneDto: GenerateFortuneDto,
  ): Promise<IFortuneData> {
    const response = await this.axiosInstance.post<IOllamaResponse>(
      '/generate',
      {
        model: 'qwen3:30b-a3b',
        prompt: generateFortuneDto.prompt,
        stream: true,
        format: 'json',
        temperature: 0,
      },
    );

    let fullResponse = '';
    const responseData = response.data as unknown as string;
    const lines = responseData.split('\n');

    for (const line of lines) {
      if (!line.trim()) continue;
      try {
        const jsonData = JSON.parse(line);
        if (jsonData.response) {
          fullResponse += jsonData.response;
        }
        if (jsonData.done) {
          break;
        }
      } catch (error) {
        console.error('JSON 파싱 오류:', error);
      }
    }

    try {
      return JSON.parse(fullResponse) as IFortuneData;
    } catch (error) {
      console.error('최종 응답 파싱 오류:', error);
      throw new Error('운세 생성에 실패했습니다.');
    }
  }
}
