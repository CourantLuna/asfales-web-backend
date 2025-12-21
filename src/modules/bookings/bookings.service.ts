import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { SheetsService } from '../sheets/sheets.service';
import { CreateBookingDto } from './dto/create-booking.dto';
import { v4 as uuidv4 } from 'uuid'; // Asegúrate de tener uuid instalado o usa Date.now()

@Injectable()
export class BookingsService {
  // Configuración específica para este módulo
  private readonly SPREADSHEET_ID = '1T4Vtp2QAE30iNh4vc4DkzV0TRmHio0FcORpqx59G2E0';
  private readonly SHEET_NAME = 'bookings';

  constructor(private sheetsService: SheetsService) {}

  /**
   * Crea una nueva reserva
   */
  async create(createBookingDto: CreateBookingDto) {
    try {
      // 1. Preparamos el payload plano para Google Sheets
      const rowData = {
        id: `bk_${Date.now()}`, // Generamos un ID único simple
        user_id: createBookingDto.userId,
        type: createBookingDto.type,
        subtype: createBookingDto.subtype,
        item_id: createBookingDto.itemId,
        status: 'CONFIRMED', // Estado inicial por defecto
        payment_status: 'PAID', // Asumimos pago exitoso por ahora
        start_date: createBookingDto.startDate,
        end_date: createBookingDto.endDate,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        total_amount: createBookingDto.totalAmount,
        currency: createBookingDto.currency,
        snapshot_title: createBookingDto.snapshotTitle,
        snapshot_image: createBookingDto.snapshotImage || '',
        snapshot_location: createBookingDto.snapshotLocation || '',
        payment_method_id: createBookingDto.paymentMethodId || '',
        // 2. Serializamos el objeto details a JSON String
        details_json: JSON.stringify(createBookingDto.details),
      };

      // 3. Guardamos usando el servicio genérico
      await this.sheetsService.create(
        this.SPREADSHEET_ID,
        this.SHEET_NAME,
        rowData
      );

      return rowData;
    } catch (error) {
      console.error('Error creating booking:', error);
      throw new InternalServerErrorException('No se pudo crear la reserva');
    }
  }

  /**
   * Obtiene todas las reservas, opcionalmente filtradas por usuario
   */
  async findAll(userId?: string) {
    // 1. Obtenemos todo (Sheets no tiene filtrado nativo eficiente en la API simple)
    const bookings = await this.sheetsService.listAll(
      this.SPREADSHEET_ID,
      this.SHEET_NAME
    );

    // 2. Filtramos en memoria y parseamos el JSON
    const filtered = userId 
      ? bookings.filter(b => b['user_id'] === userId)
      : bookings;

    return filtered.map(this.mapRowToBooking);
  }

  /**
   * Obtiene una reserva por ID
   */
  async findOne(id: string) {
    const booking = await this.sheetsService.getById(
      this.SPREADSHEET_ID,
      this.SHEET_NAME,
      id,
      'id'
    );
    return this.mapRowToBooking(booking);
  }

  /**
   * Helper para transformar la fila plana de Sheets a un objeto con JSON parseado
   */
  private mapRowToBooking(row: any) {
    let details = {};
    try {
      if (row.details_json) {
        details = JSON.parse(row.details_json);
      }
    } catch (e) {
      console.warn(`Error parseando JSON para booking ${row.id}`, e);
    }

    return {
      ...row,
      details, // Reemplazamos el string con el objeto
    };
  }
}