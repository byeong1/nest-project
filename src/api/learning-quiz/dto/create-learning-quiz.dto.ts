import { IsNotEmpty, IsString } from 'class-validator';

export class CreateLearningQuizDto {
  @IsNotEmpty()
  @IsString()
  quiz: string;
}
