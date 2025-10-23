/* eslint-disable prettier/prettier */
import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import mongoose, { Document, Types } from "mongoose";
import { User } from "src/user/schema/user.schema";
import { OTPEnum } from "../enum/otp.enum";

@Schema({timestamps:true})
export class OTP extends Document {
    @Prop({type: mongoose.Schema.Types.ObjectId, ref: User.name, required: true})
    user: string;

    @Prop({required: true})
    token: string;

    @Prop({type: 'string', enum: Object.values(OTPEnum)})
    type: OTPEnum;

    @Prop({default: Date.now, expires: 60 * 50 })
    createdAt: Date;

    @Prop()
    updatedAt: Date;
}
export const OtpSchema = SchemaFactory.createForClass(OTP)



