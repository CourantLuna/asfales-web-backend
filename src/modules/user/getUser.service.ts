import { Injectable, NotFoundException } from '@nestjs/common';
import { SheetsService } from '../sheets/sheets.service';

@Injectable()
export class GetUserService {
  // Configuración "hardcodeada" o traída de variables de entorno
  private readonly SPREADSHEET_ID = '1T4Vtp2QAE30iNh4vc4DkzV0TRmHio0FcORpqx59G2E0';
  private readonly PROFILE_SHEET_NAME = 'perfil';

    constructor(private readonly sheetsService: SheetsService) {}

    async getUserProfile(uid: string) {
        try {
            const profile = await this.sheetsService.getById(
                this.SPREADSHEET_ID,
                this.PROFILE_SHEET_NAME,
                uid,
                'uid'
            );

            if (!profile) {
                throw new NotFoundException(`Perfil para el UID ${uid} no encontrado`);
            }

            return profile;
        } catch (error) {
            throw error;
        }
    }

      async updateUserProfile(uid: string, changes: Record<string, any>) {
    try {
      // Llamamos al método genérico update del SheetsService
      const updated = await this.sheetsService.update(
        this.SPREADSHEET_ID,     // ID de la hoja
        this.PROFILE_SHEET_NAME, // Nombre de la pestaña ('perfil')
        uid,                     // Valor del ID a buscar
        changes,                 // Objeto con los cambios { bio: "...", phone: "..." }
        "uid"                    // ⚠️ IMPORTANTE: Le decimos que busque en la columna "uid"
      );

      return updated;
    } catch (error) {
      throw error;
    }
  }
}