import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateUserDto } from './dto/user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { JwtService } from '@nestjs/jwt';

export interface User {
  accountId: string;
  password: string;
}

@Injectable()
export class UserService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
  ) {}

  async findByUserId(dto: any) {
    return this.prisma.user.findUnique({
      where: dto,
    });
  }

  async createUser(dto: CreateUserDto) {
    const user = await this.findByUserId({ accountId: dto.accountId });

    if (user) {
      throw new BadRequestException('이미 존재하는 아이디입니다.');
    }
    /* 실제 서비스에서는 비밀번호 해싱이 필요합니다. */
    const createdUser = await this.prisma.user.create({
      data: {
        accountId: dto.accountId,
        password: dto.password,
        userName: dto.userName,
        grade: dto.grade,
        stage: dto.stage,
      },
    });

    // access_token 생성
    const payload = {
      userId: createdUser.id,
      accountId: createdUser.accountId,
    };
    const access_token = this.jwtService.sign(payload);

    return { access_token };
  }

  async getUserWithLearningQuizs(userId: number) {
    return this.prisma.user.findUnique({
      where: { id: userId },
      include: {
        learningQuizs: {
          where: {
            deletedAt: null,
          },
        },
      },
    });
  }

  async updateUser(userId: number, updateUserDto: UpdateUserDto) {
    /* 현재 사용자 정보 조회 */
    const currentUser = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!currentUser) {
      throw new NotFoundException('존재하지 않는 유저입니다.');
    }

    /* stage나 grade가 변경되는 경우 */
    const isStageChanged =
      updateUserDto.stage && updateUserDto.stage !== currentUser.stage;
    const isGradeChanged =
      updateUserDto.grade && updateUserDto.grade !== currentUser.grade;

    /* 트랜잭션을 사용하여 원자적 작업 수행 */
    return await this.prisma.$transaction(async (prisma) => {
      /* stage나 grade가 변경되는 경우 learning-quiz 데이터 소프트 딜리트 */
      if (isStageChanged || isGradeChanged) {
        await prisma.learningQuiz.updateMany({
          where: {
            userId,
            deletedAt: null,
          },
          data: {
            deletedAt: new Date(),
          },
        });
      }

      /* 사용자 정보 업데이트 */
      return prisma.user.update({
        where: { id: userId },
        data: {
          userName: updateUserDto.userName,
          grade: updateUserDto.grade,
          stage: updateUserDto.stage,
        },
      });
    });
  }
}
