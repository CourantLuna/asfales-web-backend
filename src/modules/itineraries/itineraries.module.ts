import { Module } from '@nestjs/common';
import { ItinerariesController } from './itineraries.controller';
import { ItinerariesService } from './itineraries.service';
import { SheetsModule } from '../sheets/sheets.module';

@Module({
  imports: [SheetsModule], // Importante: Importar SheetsModule
  controllers: [ItinerariesController],
  providers: [ItinerariesService],
})
export class ItinerariesModule {}