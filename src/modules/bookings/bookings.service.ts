import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { SheetsService } from '../sheets/sheets.service';
import { CreateBookingDto } from './dto/create-booking.dto';

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
        receipt_data: JSON.stringify(createBookingDto.ReceiptData),
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
   * Actualiza una reserva existente (Para cancelar, editar, etc.)
   */
  async update(id: string, changes: Record<string, any>) {
    // 1. Preparamos el payload con la fecha de actualización
    const payload: Record<string, any> = { 
      ...changes, 
      updated_at: new Date().toISOString() 
    };
    
    // 2. Si vienen detalles complejos, hay que volver a stringificarlos
    // Esto es vital para que no se rompa el JSON en el Sheet
    if (payload.details) {
      payload.details_json = JSON.stringify(payload.details);
      delete payload.details; // Eliminamos el objeto para no guardarlo como [Object object]
    }

    if (payload.ReceiptData) {
      payload.receipt_data = JSON.stringify(payload.ReceiptData);
      delete payload.ReceiptData;
    }

    // 3. Usamos el servicio de sheets para actualizar la fila
    // Le decimos que busque por la columna 'id'
    const updated = await this.sheetsService.update(
      this.SPREADSHEET_ID,
      this.SHEET_NAME,
      id,
      payload,
      'id'
    );
    
    // 4. Retornamos el objeto mapeado bonito
    return this.mapRowToBooking(updated);
  }

  /**
   * Helper para transformar la fila plana de Sheets a un objeto con JSON parseado
   */
  private mapRowToBooking(row: any) {
    let details = {};
    let receiptData = {};
    try {
      if (row.details_json) {
        details = JSON.parse(row.details_json);
      }
      if (row.receipt_data) {
        receiptData = JSON.parse(row.receipt_data);
      }
    } catch (e) {
      console.warn(`Error parseando JSON para booking ${row.id}`, e);
    }

    return {
      ...row,
      details, // Reemplazamos el string con el objeto
      receiptData

    };
  }
}