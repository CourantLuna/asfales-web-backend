// src/modules/sheets/sheets.repository.ts
import { Injectable, InternalServerErrorException } from "@nestjs/common";
import { getSheetsClient } from "../../common/sheets.client";

@Injectable()
export class SheetsRepository {
  private sheets = getSheetsClient();

  async read(spreadsheetId: string, sheetName: string) {
    try {
      const range = `${sheetName}!A1:Z`;
      const resp = await this.sheets.spreadsheets.values.get({
        spreadsheetId,
        range,
      });

      const rows = resp.data.values || [];
      if (rows.length === 0) return { headers: [], rows: [] };

      return {
        headers: rows[0],
        rows: rows.slice(1),
      };
    } catch (err) {
      throw new InternalServerErrorException("Error leyendo Google Sheet");
    }
  }

  async append(spreadsheetId: string, sheetName: string, data: any[]) {
    await this.sheets.spreadsheets.values.append({
      spreadsheetId,
      range: `${sheetName}!A:A`,
      valueInputOption: "USER_ENTERED",
      requestBody: { values: [data] },
    });
  }

  async update(
    spreadsheetId: string,
    sheetName: string,
    rowNumber: number,
    data: any[],
    headersLength: number
  ) {
    const lastCol = String.fromCharCode(64 + headersLength);
    const writeRange = `${sheetName}!A${rowNumber}:${lastCol}${rowNumber}`;

    await this.sheets.spreadsheets.values.update({
      spreadsheetId,
      range: writeRange,
      valueInputOption: "USER_ENTERED",
      requestBody: { values: [data] },
    });
  }
}
