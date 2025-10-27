/* eslint-disable prettier/prettier */
import { BadRequestException, Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { isValidObjectId, Model } from 'mongoose';
import { User } from './schema/user.schema';
import { Request, Response } from 'express';
import { UpdateUser } from './dto/update.dto';
import axios from 'axios';
import { error } from 'console';

@Injectable()
export class UserService {
    model : string;
    api_key :string;
    base_url: string
constructor(@InjectModel(User.name) private userModel: Model<User>){
    this.model = process.env.MODEL || ''
    this.api_key= process.env.API_KEY || ''
    this.base_url= process.env.BASE_URL || ''
}
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

  async askGemini(prompt: string): Promise<{
    response: string;
    sources: string[]
  }>{
    try{
        const url = `${this.base_url}/models/${this.model}:generateContent`
        const response = await axios.post(url,{
            model: this.model,
            contents: [{
               role: 'user',
               parts: [{text: prompt}] 
            }],
            tools: [{googleSearch: {}}]
        },
        {
            headers: {
                'Content-Type': 'application/json',
                'x-goog-api-key': this.api_key
            },
            timeout: 20000
        },
    )
    const candidate = response.data?.candidates?.[0];
    const text = candidate?.content?.parts?.[0]?.text ?? '';
    const groundingMetadata = candidate?.groundingMetadata ?? {};
    const chunks = groundingMetadata?.groundingChunks ?? [];
    const supports = groundingMetadata?.groundingSupports ?? [];

    if(!text){
        throw new NotFoundException('No valid response from gemini API')
    }

    let citedText = text;
    const sources: string[] = [];

    chunks.forEach((chunk:any, index: number)=>{
        const citationNum = index + 1;
        sources.push(`${citationNum}. ${chunk.web?.uri || 'Unknown Source'}`)

        if(supports[index]){
            citedText += ` [${citationNum}]`
        }
    })
        return {
            response: citedText,
            sources
        }
    }catch(e){
        throw new error('Failed to generate response from gemini API', e)
    }
  }
}
