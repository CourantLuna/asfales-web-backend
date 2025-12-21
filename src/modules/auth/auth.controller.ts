import { Controller, Post, Body, UseGuards, Get, Req, Patch } from '@nestjs/common';
import { AuthService } from './auth.service';
import { FirebaseAuthGuard } from '../../guards/firebase-auth.guard';
import { RegisterUserDto } from '../../dto/register-user.dto';
import { ChangePasswordDto } from '../../dto/change-password.dto';
import { ApiOperation, ApiResponse } from '@nestjs/swagger';
import { LoginUserDto } from './dto/login-user.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  // 👇 NUEVO ENDPOINT LOGIN
  @Post('login')
  @ApiOperation({ summary: 'Iniciar sesión (Obtener Token JWT)' })
  @ApiResponse({ status: 200, description: 'Login exitoso, devuelve idToken.' })
  @ApiResponse({ status: 401, description: 'Credenciales inválidas.' })
  async login(@Body() loginDto: LoginUserDto) {
    return this.authService.login(loginDto);
  }

  @Post('register')
  async register(@Body() body: RegisterUserDto) {
    return this.authService.registerUser(body);
  }

  @UseGuards(FirebaseAuthGuard)
  @Get('profile')
  async getProfile(@Req() req) {
    return this.authService.getUser(req.user.uid);
  }

  @UseGuards(FirebaseAuthGuard)
  @Patch('change-password')
  async changePassword(@Req() req, @Body() body: ChangePasswordDto) {
    // req.user.uid viene del FirebaseAuthGuard cuando valida el token
    return this.authService.changePassword(req.user.uid, body.newPassword);
  }
}
