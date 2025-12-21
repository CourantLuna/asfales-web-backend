import { IsString, IsNotEmpty, IsNumber, IsOptional, IsObject } from 'class-validator';

export class CreateBookingDto {
  @IsString()
  @IsNotEmpty()
  userId: string;

  @IsString()
  @IsNotEmpty()
  type: 'LODGING' | 'TRANSPORT' | 'EXPERIENCE' | 'ITINERARY';
  subtype: string;


  @IsString()
  @IsNotEmpty()
  itemId: string;

  @IsString()
  @IsNotEmpty()
  startDate: string; // ISO Date YYYY-MM-DD

  @IsString()
  @IsNotEmpty()
  endDate: string; // ISO Date YYYY-MM-DD

  @IsNumber()
  totalAmount: number;

  @IsString()
  currency: string;

  // Datos para el Snapshot visual
  @IsString()
  snapshotTitle: string;

  @IsString()
  @IsOptional()
  snapshotImage?: string;

  @IsString()
  @IsOptional()
  snapshotLocation?: string;

  @IsString()
  @IsOptional()
  paymentMethodId?: string;

  // Aquí recibimos el objeto complejo, el servicio lo convertirá a string
  @IsObject()
  details: Record<string, any>;
}