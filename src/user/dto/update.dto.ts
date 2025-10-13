/* eslint-disable prettier/prettier */
import { IsNotEmpty, IsOptional, IsString } from "class-validator";

export class UpdateUser {
    @IsNotEmpty()
    @IsString()
    fullName: string;

    @IsOptional()
    @IsString()
    phoneNumber?: string;
}