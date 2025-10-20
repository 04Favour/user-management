/* eslint-disable prettier/prettier */
import { Module } from '@nestjs/common';
import { FileService } from './file.service';
import { FileController } from './file.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Image, ImageSchema } from 'src/user/schema/image.schema';

@Module({
  imports: [MongooseModule.forFeature([{ name: Image.name, schema: ImageSchema } ])],
  controllers: [FileController],
  providers: [FileService],
  exports: [FileService]
})
export class FileModule {}
