import { Module } from '@nestjs/common';
import { LlmService } from './llm.service';
import { LlmController } from './llm.controller';
import { PrismaModule } from '../../prisma/prisma.module';
import { QdrantService } from './qdrant.service';

@Module({
  imports: [PrismaModule],
  controllers: [LlmController],
  providers: [LlmService, QdrantService],
})
export class LlmModule {}
