/* eslint-disable prettier/prettier */
import { Body, Controller, Get, Param, Patch, Req, Res, UseGuards } from '@nestjs/common';
import { UserService } from './user.service';
import { JwtAuthGuard } from 'src/auth/auth.guard';
import { UpdateUser } from './dto/update.dto';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @UseGuards(JwtAuthGuard)
  @Patch(':_id')
  updateUser(@Body() dto: UpdateUser,@Req() req, @Param('_id') _id?: string){
    return this.userService.updateUser(dto, req, _id)
  }

  @UseGuards(JwtAuthGuard)
  @Get('logout')
  logout(@Req() req, @Res() res){
    return this.userService.logout(req, res)
  }
}
