import { Injectable } from '@nestjs/common';
import { getSheetsClient } from './common/sheets.client';

@Injectable()
export class AppService {
  getHello(): string {
    return 'Hello World!';
  }

  async testSheet() {

  const sheets = getSheetsClient();

  const res = await sheets.spreadsheets.values.get({
    spreadsheetId: "1qcdbiCekt3GKoaQJGrYbigcL987PNEIklocKq6CuMzA",
    range: "A1:K6",
  });
    console.log(res.data);


  return res;

} 
}
