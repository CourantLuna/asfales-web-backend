import { Controller, Get, Param } from '@nestjs/common';
import { UserService } from './user.service';

@Controller('asfalesuser')
export class AsfalesUserController {
  constructor(private readonly userService: UserService) {}

  @Get(':userName')
  async getProfileByUserName(@Param('userName') userName: string) {
    // console.log(`🔎 Petición recibida para userName: ${userName}`);

    // 1. Guardamos el resultado en una variable haciendo AWAIT
    const profile = await this.userService.getUserProfileByUserName(userName);

    // 2. Ahora sí podemos imprimir el objeto real
    // console.log("📦 Perfil recuperado en el Controller:", profile);

    // 3. Retornamos el resultado
    return profile;
  }
}