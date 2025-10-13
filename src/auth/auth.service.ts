/* eslint-disable prettier/prettier */
import { BadRequestException, Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User } from 'src/user/schema/user.schema';
import { RegisterUserDto } from './dto/register-user.dto';
import * as bcrypt from 'bcrypt';
import { LoginDto } from './dto/login.dto';
import { JwtService } from '@nestjs/jwt';
import { JwtConstant } from './constants';
import { Response, Request} from 'express';

@Injectable()
export class AuthService {
    constructor(@InjectModel(User.name) private userModel: Model<User>, private jwtService: JwtService){}

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







    hashPassword = async (password:string): Promise<string>=> {
        const saltOrRounds = JwtConstant.saltRounds;
        const hash = await bcrypt.hash(password, saltOrRounds)
        return hash
    }

    findEmail = async <T extends {email: string}> (dto: T) => {
        const getUser = await this.userModel.findOne({email: dto.email}).select('+password')
        return getUser
    }

    // isMatch = async (args:{password: string, hash:string}) => {
    //     return await bcrypt.compare(args.password, args.hash)
    // }
}
