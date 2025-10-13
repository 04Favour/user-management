/* eslint-disable prettier/prettier */
import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { UserModule } from 'src/user/user.module';
import { JwtModule } from '@nestjs/jwt';
import { JwtConstant } from './constants';
import { JwtStrategy } from './jwt.strategy';

@Module({
  imports:[UserModule,  JwtModule.register({
      global: true,
      secret: JwtConstant.secret || "fallBacksecret",
      signOptions: { expiresIn: '3d' },
    }),],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy],
})
export class AuthModule {}
