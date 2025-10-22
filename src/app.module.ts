/* eslint-disable prettier/prettier */
import { Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { UserModule } from './user/user.module';
import { DatabaseConfig } from './config/database.config';
import { DatabaseService } from './config/database.service';
import { FileModule } from './file/file.module';
import { FileService } from './file/file.service';
import { OtpModule } from './otp/otp.module';
import { EmailModule } from './services/email.module';

@Module({
  imports: [...DatabaseConfig, AuthModule, UserModule, FileModule, OtpModule, EmailModule],
  controllers: [],
  providers: [DatabaseService, FileService],
})
export class AppModule {}
