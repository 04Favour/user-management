/* eslint-disable prettier/prettier */
import { IsString } from "class-validator";

export class ImageDto {
    @IsString()
    userId: string;
    @IsString()
    imageUrl: string;
    @IsString()
    publicId: string;
}