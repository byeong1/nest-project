import { IsNotEmpty, IsString } from 'class-validator';

export class GenerateQuizDto {
  @IsString()
  @IsNotEmpty()
  prompt: string;
}
