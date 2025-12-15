// src/modules/sheets/sheets.controller.ts
import { Controller, Get, Post, Put, Delete, Param, Body, Query } from "@nestjs/common";
import { SheetsService } from "./sheets.service";

@Controller("sheets")
export class SheetsController {
  constructor(private service: SheetsService) {}

  @Get(":spreadsheetId/:sheetName")
  list(@Param() params) {
    return this.service.listAll(params.spreadsheetId, params.sheetName);
  }

  @Post(":spreadsheetId/:sheetName")
  create(@Param() params, @Body() body: any) {
    return this.service.create(params.spreadsheetId, params.sheetName, body);
  }
  @Get(":spreadsheetId/:sheetName/:id")
  get(
    @Param() params,
    @Query('key') key: string // <--- Leemos ?key=uid
  ) {
    return this.service.getById(
      params.spreadsheetId,
      params.sheetName,
      params.id,
      key || 'id' // Si no envían nada, usa 'id' por defecto
    );
  }

  @Put(":spreadsheetId/:sheetName/:id")
  update(
    @Param() params, 
    @Body() body: any,
    @Query('key') key: string
  ) {
    return this.service.update(
      params.spreadsheetId,
      params.sheetName,
      params.id,
      body,
      key || 'id'
    );
  }

  @Delete(":spreadsheetId/:sheetName/:id")
  remove(
    @Param() params,
    @Query('key') key: string
  ) {
    return this.service.delete(
      params.spreadsheetId,
      params.sheetName,
      params.id,
      key || 'id'
    );
  }
}
