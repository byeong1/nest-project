import {
  Controller,
  Get,
  Req,
  UseGuards,
  NotFoundException,
  Patch,
  Body,
} from '@nestjs/common';
import { UserService } from './user.service';
import { AuthGuard } from '@nestjs/passport';
import { Request } from 'express';
import { UpdateUserDto } from './dto/update-user.dto';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @UseGuards(AuthGuard('jwt'))
  @Get('info')
  async getMyInfo(@Req() req: Request) {
    const { userId } = req.user as any;

    const user = await this.userService.getUserWithLearningQuizs(userId);

    if (!user) {
      throw new NotFoundException('존재하지 않는 유저입니다.');
    }
    return user;
  }

  @UseGuards(AuthGuard('jwt'))
  @Patch('info')
  async updateMyInfo(
    @Req() req: Request,
    @Body() updateUserDto: UpdateUserDto,
  ) {
    const { userId } = req.user as any;
    return this.userService.updateUser(userId, updateUserDto);
  }
}
