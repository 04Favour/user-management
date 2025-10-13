/* eslint-disable prettier/prettier */
import { Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { UserModule } from './user/user.module';
import { DatabaseConfig } from './config/database.config';
import { DatabaseService } from './config/database.service';

@Module({
  imports: [...DatabaseConfig, AuthModule, UserModule,],
  controllers: [],
  providers: [DatabaseService],
})
export class AppModule {}
