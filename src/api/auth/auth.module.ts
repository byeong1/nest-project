import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { UserModule } from '../user/user.module';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { JwtStrategy } from './jwt.strategy';
import { LoginStrategy } from './login.strategy';
import { jwtConfig } from '../../config/jwt.config';

@Module({
  imports: [UserModule, PassportModule, JwtModule.registerAsync(jwtConfig)],
  providers: [AuthService, JwtStrategy, LoginStrategy],
  controllers: [AuthController],
  exports: [AuthService],
})
export class AuthModule {}
