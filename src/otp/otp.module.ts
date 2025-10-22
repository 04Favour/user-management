/* eslint-disable prettier/prettier */
import { Module } from "@nestjs/common";
import { OtpService } from "./otp.service";
import { MongooseModule } from "@nestjs/mongoose";
import { OTP, OtpSchema } from "./schema/otp.schema";
import { JwtModule } from "@nestjs/jwt";
import { ConfigModule } from "@nestjs/config";

@Module({
    imports: [MongooseModule.forFeature([{ name: OTP.name, schema: OtpSchema }]), JwtModule, ConfigModule],
    controllers: [],
    providers: [OtpService],
    exports: [OtpService]
})
export class OtpModule {}