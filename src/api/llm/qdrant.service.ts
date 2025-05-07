import { Injectable, OnModuleInit } from '@nestjs/common';
import { QdrantClient } from '@qdrant/js-client-rest';

@Injectable()
export class QdrantService implements OnModuleInit {
  private qdrant: QdrantClient;
  private readonly COLLECTION_NAME = 'quiz-collection';
  private readonly VECTOR_SIZE = 768; // nomic-embed-text 기준

  constructor() {
    this.qdrant = new QdrantClient({ url: 'http://localhost:6333' });
  }

  async onModuleInit() {
    // 컬렉션이 없으면 생성 (최초 1회)
    const collections = await this.qdrant.getCollections();

    const collectionNames = collections.collections.map(
      (col: { name: string }) => col.name,
    );
    if (!collectionNames.includes(this.COLLECTION_NAME)) {
      await this.qdrant.createCollection(this.COLLECTION_NAME, {
        vectors: {
          size: this.VECTOR_SIZE,
          distance: 'Cosine',
        },
      });
    }
  }

  async saveEmbedding(id: string, embedding: number[], metadata: any) {
    await this.qdrant.upsert(this.COLLECTION_NAME, {
      points: [
        {
          id,
          vector: embedding,
          payload: metadata,
        },
      ],
    });
  }

  async searchSimilar(embedding: number[], topK: number) {
    return await this.qdrant.search(this.COLLECTION_NAME, {
      vector: embedding,
      limit: topK,
      with_payload: true,
    });
  }
}
