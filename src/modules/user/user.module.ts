import { Module } from '@nestjs/common';
import { UsersController } from './users.controller';
import { UserService } from './user.service';
import { SheetsModule } from '../sheets/sheets.module'; // Importante
import { AsfalesUserController } from './asfales-user.controller';

@Module({
  imports: [SheetsModule], // Importamos el módulo que contiene el servicio de Sheets
  controllers: [UsersController, AsfalesUserController],
  providers: [UserService],
  exports: [UserService],
})
export class UserModule {}