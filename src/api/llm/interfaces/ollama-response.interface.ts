export interface IOllamaResponse {
  response?: string;
  context?: number[];
  done?: boolean;
}

export interface IQuizData {
  quiz: string;
  hint: string;
  answer: string;
  topic: string;
  difficulty: string;
}

export interface IFortuneData {
  overall: string;
  money: string;
  health: string;
  relationship: string;
  advice: string;
}
