/* eslint-disable prettier/prettier */
import { Injectable, OnModuleInit } from '@nestjs/common';
import mongoose from 'mongoose';

@Injectable()
export class DatabaseService implements OnModuleInit {
  onModuleInit() {
    mongoose.connection.on('connected', () => {
      console.log('✅ Database connected successfully');
    });

    mongoose.connection.on('error', (err) => {
      console.error('❌ Database connection error:', err);
    });

    mongoose.connection.on('disconnected', () => {
      console.warn('⚠️ Database disconnected');
    });
  }
}
