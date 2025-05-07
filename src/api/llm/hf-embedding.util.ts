import axios from 'axios';

export const getEmbedding = async (text: string): Promise<number[]> => {
  try {
    // Ollama의 nomic-embed-text 모델을 사용하여 임베딩 추출
    const response = await axios.post('http://localhost:11434/api/embeddings', {
      model: 'nomic-embed-text',
      prompt: text,
    });

    // Ollama 응답 구조에 맞게 파싱
    if (response.data && Array.isArray(response.data.embedding)) {
      return response.data.embedding;
    }

    console.error('임베딩 응답 구조:', response.data);
    throw new Error('임베딩 추출에 실패했습니다: 잘못된 응답 구조');
  } catch (error) {
    console.error('임베딩 추출 중 오류:', error);
    throw new Error('임베딩 추출에 실패했습니다.');
  }
};
