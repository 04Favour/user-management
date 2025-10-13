/* eslint-disable prettier/prettier */

import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtConstant} from './constants';
import { Request } from 'express';
import { Model, Types } from 'mongoose';
import { User } from 'src/user/schema/user.schema';
import { InjectModel } from '@nestjs/mongoose';

interface JwtPayload {
    sub: string;
    username: string;
}
@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(@InjectModel(User.name) private userModel: Model<User> ) {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        (req: Request) => {
          return req?.cookies?.token || null;
        },
      ]),
      ignoreExpiration: false,
      secretOrKey: JwtConstant.secret,
    });
  }

  async validate(payload: JwtPayload) {
    try {
        if (!Types.ObjectId.isValid(payload.sub)) {
            return null;
        }

        const user = await this.userModel.findById(payload.sub);
        return user;
    } catch (error) {
        throw new UnauthorizedException("User not found");
    }
  }
}
