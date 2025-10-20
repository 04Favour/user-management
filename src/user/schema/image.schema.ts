/* eslint-disable prettier/prettier */
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { User } from './user.schema';

@Schema({ timestamps: true })
export class Image extends Document {
  @Prop({ required: true })
  userId: string;

  @Prop({ required: true })
  imageUrl: string;

  @Prop({ required: true })
  publicId: string;
}

export const ImageSchema = SchemaFactory.createForClass(Image);
