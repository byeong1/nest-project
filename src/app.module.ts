import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './prisma/prisma.module';
import { ApiModule } from './api/index.module';

@Module({
  imports: [ConfigModule.forRoot({ isGlobal: true }), ApiModule, PrismaModule],
  controllers: [],
  providers: [],
})
export class AppModule {}
