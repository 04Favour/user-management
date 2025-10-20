/* eslint-disable no-useless-catch */
/* eslint-disable prettier/prettier */
import { ForbiddenException, HttpException, HttpStatus, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { v2 as cloudinary } from 'cloudinary';
import { Request } from 'express';
import { Model, Types } from 'mongoose';
import { Image } from 'src/user/schema/image.schema';
import { handleUpload } from './file.config';



@Injectable()
export class FileService {
     constructor(@InjectModel(Image.name) private userImageModel: Model<Image>){}
    async uploadFile(file: Express.Multer.File, req: Request) {
        const userId = (req.user as any)._id;
        const cloudinaryRes = await handleUpload(file);
        try {
            const uploadFile = await this.userImageModel.create({
                userId: userId,
                imageUrl: cloudinaryRes.url,
                publicId: cloudinaryRes.public_id,
            })
            return {
                success: true,
                message: "Upload successful",
                uploadFile
            }
        }catch(error){
            // if(error instanceof HttpException){
            //     throw new HttpException(error.message, HttpStatus.BAD_REQUEST)
            // }
            throw error
        }
  }

  async uploadMultipleFiles(files: Express.Multer.File[], req: Request) {
    try {
      const uploadResults: any[] = [];

      for (const file of files) {
        const cloudinaryRes = await handleUpload(file);

        const uploaded = await this.userImageModel.create({
          userId: (req.user as any)._id,
          imageUrl: cloudinaryRes.url,
          publicId: cloudinaryRes.public_id,
        });

        uploadResults.push(uploaded);
      }

      return {
        success: true,
        message: 'All files uploaded successfully',
        files: uploadResults,
      };
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
    }
  }

 async deleteFile(publicId: string, req: Request) {
    const currentUserId = req.user as {id: string}
    const deletedDocument = await this.userImageModel.findOneAndDelete({ publicId });

    if (!deletedDocument) {
      throw new NotFoundException(`Image with Public ID "${publicId}" not found in the database.`);
    }

    if(deletedDocument.userId !== currentUserId.id){
      throw new ForbiddenException(`Current user not allowed to delete ID: ${publicId}`)
    }

    try {
      const cloudinaryResult = await cloudinary.uploader.destroy(publicId);
      if (cloudinaryResult.result !== 'ok') {
        console.warn(`Cloudinary deletion failed for ID ${publicId}: ${cloudinaryResult.result}`);
      }

    } catch (e) {
      console.error(`Error deleting Cloudinary asset ${publicId}:`, e);
    }
    return {
      message: 'User image and Cloudinary asset deleted successfully',
      deletedUser: deletedDocument,
    };
  }

  async updateFile(_id:string, file: Express.Multer.File, req: Request) {
    const currentUserId = req.user as {id:string}
    const existingFile = await this.userImageModel.findById(_id).exec()
    if (!existingFile){
      throw new NotFoundException(`Image with ID ${_id} not found`)
    }

    if (existingFile.userId !== currentUserId.id){
      throw new ForbiddenException('You are not authorized to modify this file')
    }

    const existingPublicId = existingFile.publicId
    const dataURI = `data:${file.mimetype};base64,${file.buffer.toString('base64')}`

    const uploadResult = await cloudinary.uploader.upload(dataURI, {
      public_id: existingPublicId,
      overwrite: true,
      resource_type: 'auto'
    })

    existingFile.imageUrl= uploadResult.secure_url;
    return existingFile.save()
  }

}
