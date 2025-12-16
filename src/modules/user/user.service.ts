import { Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { SheetsService } from '../sheets/sheets.service';
import { admin } from 'src/firebase/firebase-admin';

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

  // 👇 NUEVO MÉTODO: Crear perfil inicial
  async createInitialProfile(uid: string, email?: string, displayName?: string, phone?: string) {
    try {
      // 1. Definir valores por defecto para los JSONs complejos
      const defaultLoyalty = {
        tier: 'Blue',
        pointsBalance: 0,
        tierPoints: 0,
        creditsBalance: 0,
        joinedAt: new Date().toISOString()
      };

      const defaultNotifs = {
        "booking-confirmations": { enabled: true, method: "email" },
        "payment-receipts": { enabled: true, method: "email" },
        "trip-updates": { enabled: true, method: "email" },
        "promotions": { enabled: false, method: "email" }
      };

      const defaultAddress = { street: "", city: "", state: "", zipCode: "", country: "" };
      const defaultTravelIdentity = { passportNumber: "", homeAirport: "" };

      // 2. Construir el objeto plano que coincide con tus columnas del Excel
      const newProfile = {
        uid: uid,
        displayName: displayName,
        email: email,
        gender: 'prefer_not_to_say', // Default
        bio: '',
        id_card: '',
        birth_date: '',
        phone: phone ? `${phone}` : '', // Agregamos la comilla para evitar fórmulas si hay teléfono
        
        // Serializamos los objetos a String para el Excel
        address_json: JSON.stringify(defaultAddress),
        travel_identity_json: JSON.stringify(defaultTravelIdentity),
        loyalty_json: JSON.stringify(defaultLoyalty),
        payment_methods_json: '[]', // Array vacío
        companions_json: '[]',      // Array vacío
        notif_prefs: JSON.stringify(defaultNotifs)
      };

      // 3. Guardar en Google Sheets usando tu servicio genérico
      await this.sheetsService.create(
        this.SPREADSHEET_ID,
        this.PROFILE_SHEET_NAME,
        newProfile
      );

      return newProfile;
    } catch (error) {
      console.error('Error creando perfil en Sheet:', error);
      // No lanzamos error fatal para no bloquear el registro de Firebase, 
      // pero idealmente deberías manejar esto (cola de reintento, log crítico, etc.)
      throw new InternalServerErrorException('Error inicializando perfil de usuario');
    }
  }

  async updateAvatar(uid: string, photoURL: string) {
  try {
    // Actualizamos directamente en Firebase Auth
    await admin.auth().updateUser(uid, { photoURL });
    return { success: true, photoURL };
  } catch (error) {
    throw new Error(`Error actualizando avatar: ${error.message}`);
  }
}
  
}