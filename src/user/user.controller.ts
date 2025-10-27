/* eslint-disable prettier/prettier */
import { BadRequestException, Body, Controller, Delete, Get, HttpCode, HttpStatus, Param, ParseFilePipeBuilder, Patch, Post, Query, Req, Res, UploadedFile, UploadedFiles, UseGuards, UseInterceptors } from '@nestjs/common';
import { UserService } from './user.service';
import { JwtAuthGuard } from 'src/auth/auth.guard';
import { UpdateUser } from './dto/update.dto';
import { FileService } from 'src/file/file.service';
import { FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';
import { Request } from 'express';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService, private readonly fileService: FileService,) {}

  @UseGuards(JwtAuthGuard)
  @Patch(':_id')
  @HttpCode(HttpStatus.OK)
  updateUser(@Body() dto: UpdateUser,@Req() req, @Param('_id') _id?: string){
    return this.userService.updateUser(dto, req, _id)
  }

  @UseGuards(JwtAuthGuard)
  @Get('logout')
  @HttpCode(HttpStatus.OK)
  logout(@Req() req, @Res() res){
    return this.userService.logout(req, res)
  }


  @UseGuards(JwtAuthGuard)
  @Post('upload')
  @HttpCode(HttpStatus.CREATED)
  @UseInterceptors(FileInterceptor('file'))
  async uploadImage(@UploadedFile(
    new ParseFilePipeBuilder()
    .addFileTypeValidator({
      fileType: '.(png|jpeg|jpg)',
    })
    .addMaxSizeValidator({
      maxSize: 5000000,
      message: 'Image cannot be more than 5MB',
    })
    .build({
      errorHttpStatusCode: HttpStatus.UNPROCESSABLE_ENTITY
    })
  ) file: Express.Multer.File, @Req() req) {
   return this.fileService.uploadFile(file, req)
  }

  @UseGuards(JwtAuthGuard)
  @Post('upload/multiple')
  @HttpCode(HttpStatus.CREATED)
  @UseInterceptors(FilesInterceptor('files', 5)) 
  async uploadMultipleImages(
    @UploadedFiles(
          new ParseFilePipeBuilder()
    .addFileTypeValidator({
      fileType: '.(png|jpeg|jpg|psd|pdf)',
    })
    .addMaxSizeValidator({
      maxSize: 5000000,
      message: 'Image cannot be more than 5MB',
    })
    .build({
      errorHttpStatusCode: HttpStatus.UNPROCESSABLE_ENTITY
    })
    )files: Express.Multer.File[],
    @Req() req,
  ) {
    return this.fileService.uploadMultipleFiles(files, req);
  }

  @UseGuards(JwtAuthGuard)
  @Delete('delete')
  @HttpCode(HttpStatus.NO_CONTENT)
  deleteFileFromCloudinary(@Query('id') id: string, @Req() req){
    return this.fileService.deleteFile(id, req)
  }

  @Patch('upload/:id')
  @UseInterceptors(FileInterceptor('file'))
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard)
  updateFile(@Param('id') id: string, @UploadedFile() file: Express.Multer.File, @Req() req){
    if (!file){
      throw new BadRequestException('A file is required for update')
    }
    return this.fileService.updateFile(id, file, req)
  }

  @Post('ask-gemini')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard)
  async promptGemini(@Body('prompt') prompt: string){
    const answer = await this.userService.askGemini(prompt)
    return {prompt, answer}
  }
}
