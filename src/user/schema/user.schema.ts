/* eslint-disable prettier/prettier */

import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { Role } from 'src/enum/role.enum';

// export type UserDocument = HydratedDocument<User>;
// export type RoleType = 'user' | 'admin'

@Schema({
    timestamps: true
})
export class User extends Document {
  @Prop({required: true})
  fullName: string;

  @Prop({required: true, unique: true, index: true})
  email:string;

  @Prop({required: true, select: false})
  password: string;

  @Prop({required: false})
  phoneNumber?: string;

  @Prop({required: true, enum: Role, default: 'user'})
  role: Role;


}

export const UserSchema = SchemaFactory.createForClass(User);
