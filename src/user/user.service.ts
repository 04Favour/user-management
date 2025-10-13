/* eslint-disable prettier/prettier */
import { BadRequestException, Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { isValidObjectId, Model } from 'mongoose';
import { User } from './schema/user.schema';
import { Request, Response } from 'express';
import { UpdateUser } from './dto/update.dto';

@Injectable()
export class UserService {
constructor(@InjectModel(User.name) private userModel: Model<User>){}
    async updateUser(dto: UpdateUser, req: Request, _id?: string) {
        const decodedUser = req.user as { id: string; email: string };

        try {
            // 🧩 If _id is provided (admin-like case)
            if (_id) {
            // ✅ 1. Check if _id is a valid ObjectId
            if (!isValidObjectId(_id)) {
                throw new BadRequestException('Invalid user ID format');
            }

            // ✅ 2. Find user by that ID
            const user = await this.userModel.findById(_id);
            if (!user) {
                throw new UnauthorizedException('User not found');
            }

            // ✅ 3. Check if logged-in user's email matches the found user’s
            if (user.email !== decodedUser.email) {
                throw new UnauthorizedException('Unauthorized to update this user');
            }

            // ✅ 4. Perform update
            const updatedUser = await this.userModel.findByIdAndUpdate(
                _id,
                {
                $set: {
                    fullName: dto.fullName,
                    phoneNumber: dto.phoneNumber,
                },
                },
                { new: true },
            );

            return {
                success: true,
                message: 'Successfully updated',
                user: updatedUser,
            };
            }

            // 🧩 If _id is NOT provided (self-update case)
            const updatedUser = await this.userModel.findByIdAndUpdate(
            decodedUser.id,
            {
                $set: {
                fullName: dto.fullName,
                phoneNumber: dto.phoneNumber,
                },
            },
            { new: true },
            );

            if (!updatedUser) {
            throw new UnauthorizedException('User not found');
            }

            return {
            success: true,
            message: 'Successfully updated',
            user: updatedUser,
            };
        } catch (error) {
            // 🧩 Catch CastError (invalid ObjectId)
            if (error.name === 'CastError') {
            throw new BadRequestException('Invalid ID format');
            }

            // 🧩 For other unexpected issues
            console.error('Update user error:', error);
            throw error;}
            
    }





  logout(req: Request, res: Response){
    const decodedUser = req.user
    if(decodedUser){
        res.clearCookie('token')
        return res.send({
            message: "Logged out successfully"
        })
    }
    else {
        throw new UnauthorizedException('Unauthorized to access this route')
    }

  }
}
