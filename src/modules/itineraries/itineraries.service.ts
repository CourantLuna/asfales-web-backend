import { Injectable } from '@nestjs/common';
import { SheetsService } from '../sheets/sheets.service';

@Injectable()
export class ItinerariesService {
  // Constantes de configuración de la hoja
  private readonly SPREADSHEET_ID = '1vgLbAfzE6dWEp_lvtEYl3lZPpyFiHY7MCsQYccwAv64';
  private readonly SHEET_NAME = 'itinerariesData';

  constructor(private sheetsService: SheetsService) {}

  // Obtener todos los itinerarios
  async findAll() {
    const data = await this.sheetsService.listAll(
      this.SPREADSHEET_ID,
      this.SHEET_NAME,
    );
    // Transformación opcional: si quieres parsear los JSONs en el backend
    // o enviarlos como strings al frontend. Lo dejaremos raw por ahora.
    return data;
  }

  // Obtener por Owner UID
  async findByOwner(uid: string) {
    const allItineraries = await this.findAll();
    
    // Filtramos en memoria. 
    // Asegúrate de que en tu Google Sheet exista la columna 'ownerUid' o 'ownerId'
    return allItineraries.filter((item) => {
      // Verificamos ambas posibilidades por si acaso
      return item['ownerId'] === uid;
    });
  }

  // Crear un nuevo itinerario
  async create(itineraryData: any) {
    // Aquí podrías agregar lógica para serializar objetos complejos a JSON strings
    // antes de guardarlos si vienen como objetos desde el frontend
    return this.sheetsService.create(
      this.SPREADSHEET_ID,
      this.SHEET_NAME,
      itineraryData
    );
  }
}