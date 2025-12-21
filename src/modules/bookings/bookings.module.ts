import { Module } from '@nestjs/common';
import { BookingsService } from './bookings.service';
import { BookingsController } from './bookings.controller';
import { SheetsModule } from '../sheets/sheets.module';

@Module({
  imports: [SheetsModule], // Importante: Importar SheetsModule
  controllers: [BookingsController],
  providers: [BookingsService],
})
export class BookingsModule {}