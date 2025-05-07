import { IsString, IsNotEmpty } from 'class-validator';

export class GenerateFortuneDto {
  @IsString()
  @IsNotEmpty()
  prompt: string;
}
