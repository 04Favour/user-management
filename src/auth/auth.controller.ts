/* eslint-disable prettier/prettier */
import { Body, Controller, Get, Post, Req, Res, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterUserDto } from './dto/register-user.dto';
import { LoginDto } from './dto/login.dto';
import { JwtAuthGuard } from './auth.guard';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  register(@Body() register: RegisterUserDto) {
    return this.authService.register(register)
  }

  @Post('login')
  login(@Body() dto: LoginDto, @Res() res){
    return this.authService.login(dto, res)
  }
  
  @UseGuards(JwtAuthGuard)
  @Get('profile')
  profile(@Req() req){
    return this.authService.profile(req)
  }
}
