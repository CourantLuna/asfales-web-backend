import { BadRequestException, Body, Controller, Get, Param, Patch, Put, Req, UseGuards } from '@nestjs/common';
import { UserService } from './user.service';
import { FirebaseAuthGuard } from '../../guards/firebase-auth.guard';
import { Post } from '@nestjs/common';

@Controller('perfil') // Esto define la ruta base.
export class UsersController {
  constructor(private readonly userService: UserService) {}

    // @UseGuards(FirebaseAuthGuard)
  @Get(':uid') // Esto completa la ruta: /perfil/:uid
  async getProfile(@Param('uid') uid: string) {
    return this.userService.getUserProfile(uid);
  }

  @Post('create-initial')
  // @UseGuards(FirebaseAuthGuard) // Descomenta si usas guardias de Firebase
  async createInitial(@Body() data: { 
    uid: string; 
    email?: string; 
    displayName?: string; 
    phone?: string; 
  }) {
    console.log(`🚀 Creando perfil inicial para UID: ${data.uid}`);
    
    return await this.userService.createInitialProfile(
      data.uid,
      data.email,
      data.displayName,
      data.phone,
    );
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

// 👇 Mantenemos tu estilo: UID como parámetro de ruta
  @Patch(':uid/recharge') 
  async rechargeBalance(
    @Param('uid') uid: string, 
    @Body() body: { amount: number; paymentMethodId: string }
  ) {
    if (!uid) throw new BadRequestException('El UID es requerido en la URL');
    if (!body.amount || body.amount <= 0) throw new BadRequestException('El monto debe ser mayor a 0');

    return this.userService.rechargeBalance(uid, body.amount, body.paymentMethodId);
  }

  
}