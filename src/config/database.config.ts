/* eslint-disable prettier/prettier */
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule, ConfigService } from '@nestjs/config';
import mongoose from 'mongoose';

export const DatabaseConfig = [
  ConfigModule.forRoot({
    isGlobal: true, // makes .env variables available everywhere
  }),
  MongooseModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        uri: configService.get<string>('MONGO_URI'),
      }),
    }),
];
