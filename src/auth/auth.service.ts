/* eslint-disable prettier/prettier */
import { BadRequestException, ForbiddenException, Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { User } from 'src/user/schema/user.schema';
import { RegisterUserDto } from './dto/register-user.dto';
import * as bcrypt from 'bcrypt';
import { LoginDto } from './dto/login.dto';
import { JwtService } from '@nestjs/jwt';
import { JwtConstant } from './constants';
import { Response, Request} from 'express';
import { OtpService } from 'src/otp/otp.service';
import { OTPEnum } from 'src/otp/enum/otp.enum';
import { sendEmailDto } from 'src/services/dto/email.dto';
import { EmailService } from 'src/services/email.service';
import { RequestTokenDto } from './dto/requestToken.dto';
import { OTP } from 'src/otp/schema/otp.schema';


@Injectable()
export class AuthService {
    constructor(@InjectModel(User.name) private userModel: Model<User>, private jwtService: JwtService, private readonly otpService: OtpService, private readonly emailService: EmailService, @InjectModel(OTP.name) private readonly otpSchema: Model<OTP>){}

    async register(register: RegisterUserDto): Promise<{success: boolean, message: string, user}>{
        const user = await this.findEmail(register)
        if (user){
            throw new BadRequestException({
                success: false,
                message: "Sorry, user already exists.",
                error: 400
            })
        }
        const getPassword = register.password;
        const password = await this.hashPassword(getPassword)
        const newUser: RegisterUserDto = { ...register, password };
        const createUser = await this.userModel.create(newUser)
        if (!createUser){
            throw new BadRequestException({
                success: true,
                message: "User has not been registered",
                error: 400
            })
        }
        // Remove password from createUser object before returning
        const { password: _, ...userWithoutPassword } = createUser.toObject();
        return {
            success: true,
            message: 'User created successfully',
            user: userWithoutPassword
        };
    }

    async login(dto: LoginDto, res: Response) {
        const {password} = dto
        const user = await this.findEmail(dto)
        if (!user) {
            throw new BadRequestException({
                success: false,
                message: "Invalid credentials",
                error: 400
            })
        }
        const comparePassword = await bcrypt.compare(password, user.password)
        if(comparePassword === false){
            throw new UnauthorizedException({
                success: false,
                message: "Invalid credentials",
                error: 401
            })
        }
        const payload = {sub: user._id, username: user.fullName}
        const token = await this.jwtService.signAsync(payload)
        res.cookie('token', token)

        return res.send({
            success: true,
            message: "User logged in",
            code: 200,
        })
    }

    profile(req: Request) {
    const decodedUser = req.user 
        return {
            success: true,
            message: "User profile fetched successfully",
            decodedUser
        };

    }

    async emailVerification(user: User, otpType: OTPEnum): Promise<boolean>{
        const token = await this.otpService.generateOTP(user, otpType)
        if(otpType === OTPEnum.OTP){
            const emailDto = {
            recipients: [user.email],
            subject: "OTP Verification",
            html: `Your otp code is: <strong>${token}</strong>.
            <br />Provide this otp to verify your account `
            }
            return await this.emailService.sendEmail(emailDto)
        }
        else {
            const resetLink = `${process.env.RESET_PASSWORD_URL}?token=${token}`
            const emailDto = {
            recipients: [user.email],
            subject: "Password Reset Link",
            html: `Click the given link to reset your password: 
            <p><a href="${resetLink}">Reset Password</a></p> `
            }
            return await this.emailService.sendEmail(emailDto)
        }
        

        
    }

    async forgotPassword(forgotDto: RequestTokenDto){
        const {email} = forgotDto
        const user = await this.userModel.findOne({email})
        if (!user){
            throw new NotFoundException('User not found')
        }
        await this.emailVerification(user, OTPEnum.RESET_LINK)
        return {
            message: "Password reset link has been sent to your email"
        }
    }

    async resetPassword(token: string, password: string) {
        const payload = await this.otpService.validateResetPassword(token)
        const user = await this.userModel.findById(payload.id)
        if(!user) {
            throw new BadRequestException('User not found')
        }
        user.password = await bcrypt.hash(password, 10)
        await user.save()
        return {
            message: "Password reset successfully"
        }

    }

    async forgotPasswordOTP(email: string, res: Response){
        const user = await this.userModel.findOne({email})
        if(!user){
            throw new NotFoundException('User not found')
        }
        const sendToken= await this.emailVerification(user, OTPEnum.OTP)
        if(!sendToken){
            throw new BadRequestException('Sorry, token could not be generated')
        }
        const payload = this.jwtService.sign({id: user._id, email: user.email}, {
            secret: process.env.JWT_SECRET
        })
        if(!payload){
            throw new BadRequestException('Payload failed')
        }
        res.cookie('token', payload)
        res.send({
            success: true,
            message: "Otp has been sent to your mail. Kindly check to update password",
        })
    }

    async reset(otp: string, newPassword: string, req: Request){
        const token = req.cookies?.token
        if(!token){
            throw new NotFoundException('Not found')
        }
        const decodedUser = await this.jwtService.verify(token, {
            secret: process.env.JWT_SECRET
        })
        if (!decodedUser) {
            throw new UnauthorizedException('Not allowed')
        }
        const decodedUserId = decodedUser.id
        if(!decodedUserId) throw new BadRequestException('Invalid token payload')
        const user = await this.otpSchema.findOne({user: new Types.ObjectId(decodedUserId)})
        if (!user) throw new NotFoundException('sorry, not found')
        const id = (user.user).toString()
        const validateToken = await this.otpService.validateOTP(id, otp)
        if(!validateToken){
            throw new BadRequestException("Token does not exist")
        }
        const newUser = await this.userModel.findOne({
            _id: id
        })
        if (!newUser){
            throw new NotFoundException('User not found')
        }
        const hashPassword = await bcrypt.hash(newPassword, 10)
        newUser.password = hashPassword
        await newUser.save()
        return {
            message: "Password has been changed successfully"
        }
    }






    hashPassword = async (password:string): Promise<string>=> {
        const saltOrRounds = JwtConstant.saltRounds;
        const hash = await bcrypt.hash(password, saltOrRounds)
        return hash
    }

    findEmail = async <T extends {email: string}> (dto: T) => {
        const getUser = await this.userModel.findOne({email: dto.email}).select('+password')
        return getUser
    }
}
