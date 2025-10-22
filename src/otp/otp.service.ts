/* eslint-disable prettier/prettier */
import { BadRequestException, Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { OTP } from "./schema/otp.schema";
import { Model } from "mongoose";
import { User } from "src/user/schema/user.schema";
import { OTPEnum } from "./enum/otp.enum";
import * as crypto from "crypto"
import * as bcrypt from "bcrypt"; 
import { JwtService } from "@nestjs/jwt";
import { ConfigService } from "@nestjs/config";

@Injectable()
export class OtpService {
    constructor(@InjectModel(OTP.name) private readonly otpSchema: Model<OTP>, private readonly jwtService: JwtService, private readonly configService: ConfigService){}
    // generate OTP
    async generateOTP(user: User, type: OTPEnum){
        if(type === OTPEnum.OTP){
            const otp = crypto.randomInt(100000, 999999).toString()
            const hashedOtp = await bcrypt.hash(otp, 10)
            const existingOtp = await this.otpSchema.findOne({
                user: user._id,
                type: type
            })
            if(existingOtp){
                existingOtp.token = hashedOtp
                await existingOtp.save()
            }
            const otpSchema = await this.otpSchema.create({
                user,
                type,
                token: hashedOtp
            })
            if (!otpSchema){
                throw new BadRequestException('Something went wrong')
            }
            await otpSchema.save()
            return otp
        }
        else {
            const resetToken = this.jwtService.sign({id: user._id, email: user.email}, {
                secret: process.env.RESET_LINK,
                expiresIn: '30m'
            })
            return resetToken
        }

    }

    async validateOTP(id: string, token: string): Promise<boolean>{
        const validToken = await this.otpSchema.findOne({
            _id: id,
        })
        if(!validToken){
            throw new BadRequestException('Invalid or expired OTP code')
        }
        const isMatch = await bcrypt.compare(token, validToken.token)
        if(!isMatch){
            throw new BadRequestException('Invalid Otp, try again')
        }

        return true
    }

   async validateResetPassword(token: string): Promise<{ id: string; email: string }> {
  try {
    const payload = await this.jwtService.verifyAsync(token, {
      secret: this.configService.get<string>('RESET_LINK'),
    });
    return payload;
  } catch (error) {
    if (error?.name === 'TokenExpiredError') {
      throw new BadRequestException('The reset link has expired. Please request another one.');
    }
    throw new BadRequestException('Invalid or expired reset link');
  }
}


}
