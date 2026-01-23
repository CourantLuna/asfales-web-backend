import { Injectable, InternalServerErrorException, Logger, NotFoundException } from '@nestjs/common';
import { FavoritesRepository } from './favorites.repository';
import { SheetsService } from '../sheets/sheets.service';
import { FavoriteItem, FavoriteList, FullListData } from './favorites.types';

@Injectable()
export class FavoritesService {
constructor(
    private readonly repo: FavoritesRepository,
    private readonly sheetsService: SheetsService,
  ) {}

  
private readonly logger = new Logger(FavoritesService.name);

  async getUserLists(userId: string) {
    const lists = await this.repo.findAllListsByUser(userId);
    // Si no tiene listas, podrías crear la "Default" aquí automáticamente
    return lists;
  }

  async createNewList(userId: string, name: string, description?: string, isDefault?: boolean) {
    const newList = {
      list_id: `list_${Date.now()}`,
      user_id: userId,
      name,
      description: description || '',
      is_default: isDefault || 'FALSE',
      created_at: new Date().toISOString(),
      item_count_cache: 0,
      is_private: false
    };
    return this.repo.createList(newList);
  }

  async addResourceToFav(listId: string, resourceData: any) {
    const newItem = {
      item_id: `item_${Date.now()}`,
      list_id: listId,
      resource_id: resourceData.resourceId,
      resource_type: resourceData.resourceType,
      resource_subtype: resourceData.resourceSubtype,
      snap_title: resourceData.snapshot.title,
      snap_image: resourceData.snapshot.imageUrl,
      snap_location: resourceData.snapshot.locationLabel,
      snap_rating: resourceData.snapshot.rating,
      snap_price_amount: resourceData.snapshot.pricePreview.amount,
      snap_price_period: resourceData.snapshot.pricePreview.period,
      added_at: new Date().toISOString(),
      snap_start_date: resourceData.snapshot.startDate || '',
      snap_end_date: resourceData.snapshot.endDate || '',
      paxPerUnit: resourceData.snapshot.paxPerUnit || undefined,
    };

      // this.logger.log(`añadiendo a la lista ${listId}..., los recursos: `, newItem);
    return this.repo.addItem(newItem);
  }

  async getItemsInList(listId: string) {
    return this.repo.findItemsByList(listId);
  }

// src/modules/favorites/favorites.service.ts

async getFullListDetails(listId: string): Promise<FullListData> {
  // 1. Obtener la lista (Padre)
  const listRaw = await this.sheetsService.getById(
    this.repo.SPREADSHEET_ID,
    this.repo.LISTS_SHEET,
    listId,
    'list_id'
  );

  if (!listRaw) throw new NotFoundException("La lista no existe");

  // Mapeo de la lista a la interfaz FavoriteList
  const list: FavoriteList = {
    id: listRaw.list_id,
    userId: listRaw.user_id,
    name: listRaw.name,
    description: listRaw.description,
    isDefault: listRaw.is_default === 'TRUE',
    isPrivate: listRaw.is_private === 'TRUE',
    createdAt: listRaw.created_at,
    updatedAt: listRaw.updated_at || listRaw.created_at,
    itemCount: parseInt(listRaw.item_count_cache || '0', 10),
    coverImage: listRaw.cover_image_url
  };

  // 2. Obtener los items asociados
  const itemsRaw = await this.repo.findItemsByList(listId);

  // 3. Mapeo completo de cada item para cumplir con FavoriteItem
  const items: FavoriteItem[] = itemsRaw.map(item => ({
    id: item.item_id,
    listId: item.list_id,
    resourceId: item.resource_id,
    resourceType: item.resource_type as any,
    resourceSubtype: item.resource_subtype as any,
    addedAt: item.added_at, // Propiedad faltante que causaba el error
    notes: item.user_notes,
    snapshot: { // Objeto faltante que causaba el error
      title: item.snap_title,
      imageUrl: item.snap_image,
      locationLabel: item.snap_location,
      rating: parseFloat(item.snap_rating || '0'),
      pricePreview: {
        amount: parseFloat(item.snap_price_amount || '0'),
        currency: item.snap_currency,
        period: item.snap_price_period
      },
      startDate: item.snap_start_date || undefined,
      endDate: item.snap_end_date || undefined,
      paxPerUnit: item.paxPerUnit ? parseInt(item.paxPerUnit, 10) : undefined,
    }
  }));

  return {
    ...list,
    items
  };
}

async getAllUserListsWithItems(userId: string): Promise<FullListData[]> {
  // 1. Obtener todas las listas que pertenecen al usuario
  const allListsRaw = await this.sheetsService.listAll(
    this.repo.SPREADSHEET_ID,
    this.repo.LISTS_SHEET
  );
  
  const userListsRaw = allListsRaw.filter(l => l.user_id === userId);
  // 2. Para cada lista, obtener sus ítems y mapearlos
  let fullLists: FullListData[] = await Promise.all(
    userListsRaw.map(async (listRaw) => {
      const itemsRaw = await this.repo.findItemsByList(listRaw.list_id);
      
      const items: FavoriteItem[] = itemsRaw.map(item => ({
        id: item.item_id,
        listId: item.list_id,
        resourceId: item.resource_id,
        resourceType: item.resource_type as any,
        resourceSubtype: item.resource_subtype as any,
        addedAt: item.added_at,
        notes: item.user_notes,
        snapshot: {
          title: item.snap_title,
          imageUrl: item.snap_image,
          locationLabel: item.snap_location,
          rating: parseFloat(item.snap_rating || '0'),
          pricePreview: {
            amount: parseFloat(item.snap_price_amount || '0'),
            currency: item.snap_currency,
            period: item.snap_price_period
          },
          paxPerUnit: item.paxPerUnit ? parseInt(item.paxPerUnit, 10) : undefined,
          startDate: item.snap_start_date || undefined,
          endDate: item.snap_end_date || undefined,
        }
      }));

      return {
        id: listRaw.list_id,
        userId: listRaw.user_id,
        name: listRaw.name,
        description: listRaw.description,
        isDefault: listRaw.is_default === 'TRUE',
        isPrivate: listRaw.is_private === 'TRUE',
        createdAt: listRaw.created_at,
        updatedAt: listRaw.updated_at || listRaw.created_at,
        itemCount: items.length, // Usamos la longitud real de los ítems encontrados
        coverImage: listRaw.cover_image_url,
        items: items
      };
    })
  );
  // 2. Si el usuario es nuevo (0 listas), creamos la default automáticamente
  if (userListsRaw.length === 0) {
    this.logger.log(`Usuario nuevo detectado (${userId}). Creando lista default...`);
    
    const defaultList = await this.createNewList(
      userId, 
      "Mis Favoritos", 
      "Lista predeterminada para tus planes de viaje",
      true
    );
    if(defaultList){
    fullLists[0].userId = userId;
    fullLists[0].name = "Mis Favoritos";
    fullLists[0].description = "Lista predeterminada para tus planes de viaje";
    fullLists[0].isDefault = true
    }
    
  }


  return fullLists;
}

async updateListDetails(listId: string, updateData: { name?: string; description?: string; coverImage?: string }) {
    this.logger.log(`Actualizando lista ${listId}...`);

  // 1. Verificamos que la lista existe
  const list = await this.sheetsService.getById(
    this.repo.SPREADSHEET_ID,
    this.repo.LISTS_SHEET,
    listId,
    'list_id'
  );

  if (!list) throw new NotFoundException("La lista no existe");

  // 2. Ejecutamos la actualización en Google Sheets
  // Solo enviamos los campos que queremos cambiar
  await this.sheetsService.update(
    this.repo.SPREADSHEET_ID,
    this.repo.LISTS_SHEET,
    listId,
    {
      ...(updateData.name && { name: updateData.name }),
      ...(updateData.description !== undefined && { description: updateData.description }),
      ...(updateData.coverImage && { cover_image_url: updateData.coverImage }), // <--- Nuevo campo
      updated_at: new Date().toISOString() // Actualizamos la marca de tiempo
    },
    'list_id'
  );

  return { success: true, listId };
}

async removeResourceFromFav(itemId: string) {
  // 1. Antes de borrar, necesitamos saber a qué lista pertenece para actualizar el contador
  const itemToDelete = await this.repo.findItemsByList(''); // O un método findItemById específico
  

  if (!itemToDelete) throw new NotFoundException("El item no existe");

  const listId = itemToDelete['list_id'];

  // 2. Ejecutar el borrado físico que implementamos en SheetsService
  await this.repo.deleteItem(itemId);

  return { success: true, itemId };
}

    /**
     * Elimina una lista completa y (opcionalmente) sus items
     */
    // favorites.service.ts
    async deleteCustomList(listId: string) {
        this.logger.log(`Iniciando borrado en cascada para la lista: ${listId}`);

        try {
            // 1. Buscar todos los items asociados a esta lista
            const items = await this.repo.findItemsByList(listId);

            // 2. Borrar cada item físicamente
            if (items.length > 0) {
                this.logger.log(`Eliminando ${items.length} items huérfanos...`);
                for (const item of items) {
                    // Usamos el itemId que viene del mapeo de Sheets (item_id)
                    await this.repo.deleteItem(item.item_id);
                }
            }

            // 3. Finalmente, borrar la lista físicamente
            await this.repo.deleteList(listId);

            return {
                success: true,
                message: `Lista ${listId} y sus ${items.length} items han sido eliminados.`
            };
        } catch (error) {
            this.logger.error(`Fallo al eliminar la lista ${listId} en cascada`, error.stack);
            throw new InternalServerErrorException("No se pudo completar el borrado de la lista");
        }
    }


}