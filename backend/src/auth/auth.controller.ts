import { Body, Controller, Post, Req } from '@nestjs/common';
import type { Request } from 'express';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  register(@Body() body: RegisterDto, @Req() req: Request) {
    return this.authService.register(body, req);
  }

  @Post('login')
  login(@Body() body: LoginDto, @Req() req: Request) {
    return this.authService.login(body, req);
  }
}
