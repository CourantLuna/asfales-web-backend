import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { UserService } from './user.service';
import { FirebaseAuthGuard } from 'src/auth/firebase-auth.guard';

@Controller('perfil') // Esto define la ruta base: http://localhost:3001/perfil
export class UsersController {
  constructor(private readonly userService: UserService) {}

    // @UseGuards(FirebaseAuthGuard)
  @Get(':uid') // Esto completa la ruta: /perfil/:uid
  async getProfile(@Param('uid') uid: string) {
    return this.userService.getUserProfile(uid);
  }
}