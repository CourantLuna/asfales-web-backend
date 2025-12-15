import { Injectable, NotFoundException } from '@nestjs/common';
import { SheetsService } from '../sheets/sheets.service';

@Injectable()
export class UserService {
  // Configuración "hardcodeada" o traída de variables de entorno
  private readonly SPREADSHEET_ID = '1T4Vtp2QAE30iNh4vc4DkzV0TRmHio0FcORpqx59G2E0';
  private readonly PROFILE_SHEET_NAME = 'perfil';

  constructor(private sheetsService: SheetsService) {}

  async getUserProfile(uid: string) {
    try {
      // Delegamos la lectura al servicio genérico de Sheets
      const profile = await this.sheetsService.getById(
        this.SPREADSHEET_ID,
        this.PROFILE_SHEET_NAME,
        uid, "uid"
      );
      
      if (!profile) {
        throw new NotFoundException(`Perfil para el UID ${uid} no encontrado`);
      }

      return profile;
    } catch (error) {
      // Puedes manejar errores específicos aquí si lo deseas
      throw error;
    }
  }
}