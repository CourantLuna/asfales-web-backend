// src/modules/sheets/sheets.module.ts
import { Module } from "@nestjs/common";
import { SheetsController } from "./sheets.controller";
import { SheetsService } from "./sheets.service";
import { SheetsRepository } from "./sheets.repository";

@Module({
  controllers: [SheetsController],
  providers: [SheetsService, SheetsRepository],
  exports: [SheetsService],
})
export class SheetsModule {}
