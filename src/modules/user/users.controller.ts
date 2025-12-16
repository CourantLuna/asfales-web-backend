import { Body, Controller, Get, Param, Patch, Put, UseGuards } from '@nestjs/common';
import { UserService } from './user.service';
import { FirebaseAuthGuard } from '../../guards/firebase-auth.guard';

@Controller('perfil') // Esto define la ruta base: http://localhost:3001/perfil
export class UsersController {
  constructor(private readonly userService: UserService) {}

    // @UseGuards(FirebaseAuthGuard)
  @Get(':uid') // Esto completa la ruta: /perfil/:uid
  async getProfile(@Param('uid') uid: string) {
    return this.userService.getUserProfile(uid);
  }

  @Put(':uid') 
  async updateProfile(
    @Param('uid') uid: string, 
    @Body() body: any // Recibe el JSON con los campos a cambiar
  ) {
    // Delegamos al servicio
    return this.userService.updateUserProfile(uid, body);
  }

  // ... imports
@Patch(':uid/avatar')
async updateAvatar(
  @Param('uid') uid: string, 
  @Body() body: { photoURL: string }
) {
  return this.userService.updateAvatar(uid, body.photoURL);
}
}