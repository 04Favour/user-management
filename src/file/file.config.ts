/* eslint-disable no-useless-catch */
/* eslint-disable prettier/prettier */
import { v2 as cloudinary } from 'cloudinary';
import * as dotenv from 'dotenv';
import * as crypto from 'crypto';
import { ConflictException } from '@nestjs/common';

dotenv.config();


cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export const handleUpload = async (file:Express.Multer.File) => {
    const hash = crypto.createHash('md5').update(file.buffer).digest('hex');
    const dataURI = `data:${file.mimetype};base64,${file.buffer.toString('base64')}`;
    try {
    const res = await cloudinary.uploader.upload(dataURI, {
      folder: 'upload',
      public_id: hash,
      overwrite: false,
      resource_type: 'auto'})
    if (res.existing){
      throw new ConflictException(`Duplicate file detected. File hash: ${hash}`);
    }
    return res;
  } catch(error) {
    throw error
  }

}
