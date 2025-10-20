/* eslint-disable prettier/prettier */
import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { User, UserSchema } from './schema/user.schema';
import { Image, ImageSchema } from './schema/image.schema';
import { FileModule } from 'src/file/file.module';
import { FileService } from 'src/file/file.service';

@Module({
  imports: [MongooseModule.forFeature([{ name: User.name, schema: UserSchema }, {name: Image.name, schema: ImageSchema}]), FileModule],
  controllers: [UserController],
  providers: [UserService, FileService],
  exports:[MongooseModule]
})
export class UserModule {}
