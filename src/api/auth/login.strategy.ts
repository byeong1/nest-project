import { Strategy } from 'passport-local';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { AuthService } from './auth.service';

@Injectable()
export class LoginStrategy extends PassportStrategy(Strategy, 'login') {
  constructor(private authService: AuthService) {
    super({
      usernameField: 'accountId',
      passwordField: 'password',
    });
  }

  async validate(accountId: string, password: string): Promise<any> {
    const user = await this.authService.findByUser({ accountId, password });
    if (!user) {
      throw new UnauthorizedException(
        '아이디 또는 비밀번호가 일치하지 않습니다.',
      );
    }
    return user;
  }
}
