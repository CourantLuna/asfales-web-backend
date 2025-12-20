import { Injectable } from '@nestjs/common';
import { SheetsService } from '../sheets/sheets.service';

@Injectable()
export class FavoritesRepository {
  // Configuración de la Hoja (Asegúrate de crear estas pestañas en tu Spreadsheet)
   readonly SPREADSHEET_ID = '1T4Vtp2QAE30iNh4vc4DkzV0TRmHio0FcORpqx59G2E0'; 
   readonly LISTS_SHEET = 'favorite_lists';
   readonly ITEMS_SHEET = 'favorite_items';

  constructor(private readonly sheetsService: SheetsService) {}

  // --- Operaciones para LISTAS ---
  async findAllListsByUser(userId: string) {
    // Usamos listAll y filtramos (o podrías mejorar SheetsService para filtrar en el repo)
    const allLists = await this.sheetsService.listAll(this.SPREADSHEET_ID, this.LISTS_SHEET);
    return allLists.filter(list => list.user_id === userId);
  }

  async createList(data: any) {
    return this.sheetsService.create(this.SPREADSHEET_ID, this.LISTS_SHEET, data);
  }

  // --- Operaciones para ITEMS ---
  async findItemsByList(listId: string) {
    const allItems = await this.sheetsService.listAll(this.SPREADSHEET_ID, this.ITEMS_SHEET);
    return allItems.filter(item => item.list_id === listId);
  }

  async addItem(data: any) {
    return this.sheetsService.create(this.SPREADSHEET_ID, this.ITEMS_SHEET, data);
  }

  async disableItem(itemId: string) {
    // Usamos tu método delete que marca como active: "false" o podrías implementar borrado físico
    return this.sheetsService.delete(this.SPREADSHEET_ID, this.ITEMS_SHEET, itemId, 'item_id');
  }

  // Elimina físicamente un item guardado
  async deleteItem(itemId: string) {
    return this.sheetsService.delete(
      this.SPREADSHEET_ID,
      this.ITEMS_SHEET,
      itemId,
      'item_id' // Nombre de la columna clave en tu Excel
    );
  }

  // Elimina físicamente una lista completa
  async deleteList(listId: string) {
    return this.sheetsService.delete(
      this.SPREADSHEET_ID,
      this.LISTS_SHEET,
      listId,
      'list_id'
    );
  }
}