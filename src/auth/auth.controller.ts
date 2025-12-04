import { Controller, Post, Body, UseGuards, Get, Req } from '@nestjs/common';
import { AuthService } from './auth.service';
import { FirebaseAuthGuard } from './firebase-auth.guard';
import { RegisterUserDto } from '../dto/register-user.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  async register(@Body() body: RegisterUserDto) {
    return this.authService.registerUser(body);
  }

  @UseGuards(FirebaseAuthGuard)
  @Get('profile')
  async getProfile(@Req() req) {
    return this.authService.getUser(req.user.uid);
  }
}
