// src/modules/sheets/sheets.service.ts
import { BadRequestException, Injectable, NotFoundException } from "@nestjs/common";
import { SheetsRepository } from "./sheets.repository";
import { getSheetsClient } from "src/common/sheets.client";

@Injectable()
export class SheetsService {
  constructor(private repo: SheetsRepository) {}

  async listAll(spreadsheetId: string, sheetName: string) {
    const { headers, rows } = await this.repo.read(spreadsheetId, sheetName);
    return rows.map(r => this.rowToObject(headers, r));
  }
  
  async create(
    spreadsheetId: string,
    sheetName: string,
    payload: Record<string, any>
  ) {
    const { headers } = await this.repo.read(spreadsheetId, sheetName);
    const row = this.objectToRow(headers, payload);
    await this.repo.append(spreadsheetId, sheetName, row);
    return payload;
  }

  // --- GET BY ID MEJORADO ---
  async getById(
    spreadsheetId: string, 
    sheetName: string, 
    id: string, 
    keyColumn: string = 'id' // Valor por defecto
  ) {
    console.log(`🔍 Buscando en Sheet: "${sheetName}" | Columna Clave: "${keyColumn}" | Valor: "${id}"`);

    const { headers, rows } = await this.repo.read(spreadsheetId, sheetName);
    
    // 1. Normalizamos headers y keyColumn para evitar errores de mayúsculas/espacios
    // Ejemplo: Excel tiene "UID ", nosotros buscamos "uid" -> Ahora harán match.
    const cleanHeaders = headers.map(h => h.trim().toLowerCase());
    const searchKey = keyColumn.trim().toLowerCase();

    // 2. Buscamos el índice
    const idx = cleanHeaders.indexOf(searchKey);

    if (idx === -1) {
      console.error(`❌ Columnas disponibles: [${headers.join(', ')}]`);
      throw new BadRequestException(`La columna '${keyColumn}' no existe en la hoja (se buscó '${searchKey}')`);
    }

    // 3. Buscamos la fila
    const row = rows.find(r => r[idx] === id);
    
    if (!row) {
      throw new NotFoundException(`Registro con ${keyColumn}=${id} no encontrado`);
    }
    
    return this.rowToObject(headers, row);
  }

  // --- UPDATE ---
  async update(
    spreadsheetId: string,
    sheetName: string,
    id: string,
    payload: Record<string, any>,
    keyColumn: string = 'id'
  ) {
    const { headers, rows } = await this.repo.read(spreadsheetId, sheetName);
    
    // Normalización
    const cleanHeaders = headers.map(h => h.trim().toLowerCase());
    const searchKey = keyColumn.trim().toLowerCase();
    
    const idIndex = cleanHeaders.indexOf(searchKey);

    if (idIndex === -1) throw new BadRequestException(`La columna '${keyColumn}' no existe en la hoja`);

    const rowIndex = rows.findIndex(r => r[idIndex] === id);
    if (rowIndex === -1) throw new NotFoundException(`Registro con ${keyColumn}=${id} no encontrado`);

    const existing = this.rowToObject(headers, rows[rowIndex]);
    const updated = { ...existing, ...payload };
    const row = this.objectToRow(headers, updated);

    await this.repo.update(
      spreadsheetId,
      sheetName,
      rowIndex + 2,
      row,
      headers.length
    );

    return updated;
  }

/**
   * ELIMINACIÓN FÍSICA ACTUALIZADA
   */
  async delete(spreadsheetId: string, sheetName: string, id: string, keyColumn: string = 'id') {
    // 1. Obtener datos para localizar la fila
    const { headers, rows } = await this.repo.read(spreadsheetId, sheetName);
    const cleanHeaders = headers.map(h => h.trim().toLowerCase());
    const idIndex = cleanHeaders.indexOf(keyColumn.toLowerCase());

    if (idIndex === -1) throw new BadRequestException(`La columna '${keyColumn}' no existe`);

    // 2. Encontrar el índice (sumamos 1 porque la API de Sheets cuenta desde la fila de headers)
    const rowIndex = rows.findIndex(r => r[idIndex] === id);
    if (rowIndex === -1) throw new NotFoundException(`Registro con ${keyColumn}=${id} no encontrado para eliminar`);

    // 3. Obtener el sheetId (ID numérico de la pestaña)
    const sheetId = await this.getSheetIdByName(spreadsheetId, sheetName);

    // 4. Llamar al repositorio para eliminar la dimensión (fila)
    // Se usa rowIndex + 1 porque los datos en 'rows' no incluyen el header (que es la fila 0)
    await this.repo.deleteRow(spreadsheetId, sheetId, rowIndex + 1);

    return { success: true, deletedId: id, message: "Fila eliminada permanentemente" };
  }

  /**
   * Helper para obtener el GID (sheetId) de la pestaña por su nombre
   */
  private async getSheetIdByName(spreadsheetId: string, sheetName: string): Promise<number> {
    const client = getSheetsClient();
    const spreadsheet = await client.spreadsheets.get({ spreadsheetId });
    const sheet = spreadsheet.data.sheets?.find(s => s.properties?.title === sheetName);
    
    if (!sheet) throw new NotFoundException(`No se encontró la pestaña llamada '${sheetName}'`);
    
    return sheet.properties?.sheetId || 0;
  }

  
  
  //deshabilitar item/registro
  async disable(spreadsheetId: string, sheetName: string, id: string, keyColumn: string = 'id') {
    return this.update(spreadsheetId, sheetName, id, { active: "false" }, keyColumn);
  }

  // Helpers
  private rowToObject(headers: string[], row: string[]) {
    const obj: Record<string, string> = {};
    headers.forEach((h, i) => (obj[h] = row[i] ?? "")); // Usa headers originales para el objeto final
    return obj;
  }

  private objectToRow(headers: string[], obj: Record<string, any>) {
    return headers.map(h => String(obj[h] ?? ""));
  }
}