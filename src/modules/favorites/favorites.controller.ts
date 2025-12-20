import { Controller, Get, Post, Delete, Param, Body, Query, InternalServerErrorException, NotFoundException, Patch } from '@nestjs/common';
import { FavoritesService } from './favorites.service';

@Controller('favorites')
export class FavoritesController {
  constructor(private readonly service: FavoritesService) {}

  // Obtener todas las listas de un usuario
  @Get('user/:uid')
  getLists(@Param('uid') uid: string) {
    return this.service.getUserLists(uid);
  }

  // Crear una nueva lista
  @Post('list')
  createList(@Body() body: { userId: string; name: string; description?: string }) {
    return this.service.createNewList(body.userId, body.name, body.description);
  }

  // Obtener items de una lista específica
  @Get('list/:listId/items')
  getItems(@Param('listId') listId: string) {
    return this.service.getItemsInList(listId);
  }

  // Agregar item a una lista
  @Post('item')
  addItem(@Body() body: { listId: string; resourceData: any }) {
    return this.service.addResourceToFav(body.listId, body.resourceData);
  }


@Get('list/:listId/full')
async getFullList(@Param('listId') listId: string) {
  try {
    return await this.service.getFullListDetails(listId);
  } catch (error) {
    if (error instanceof NotFoundException) throw error;
    throw new InternalServerErrorException("Error al obtener el detalle completo de la lista");
  }
}


@Get('user/:userId/all-with-items')
async getAllWithItems(@Param('userId') userId: string) {
  try {
    return await this.service.getAllUserListsWithItems(userId);
  } catch (error) {
    throw new InternalServerErrorException("Error al obtener todas las listas con ítems");
  }
}

@Patch('list/:listId')
async updateList(
  @Param('listId') listId: string,
  @Body() body: { name?: string; description?: string }
) {
  try {
    return await this.service.updateListDetails(listId, body);
  } catch (error) {
    if (error instanceof NotFoundException) throw error;
    throw new InternalServerErrorException("No se pudo actualizar la lista");
  }
}

  /**
   * Endpoint para eliminar un item específico
   * DELETE /favorites/item/:itemId
   */
  @Delete('item/:itemId')
  async removeItem(@Param('itemId') itemId: string) {
    try {
      return await this.service.removeResourceFromFav(itemId);
    } catch (error) {
      throw new InternalServerErrorException("No se pudo eliminar el favorito");
    }
  }

  /**
   * Endpoint para eliminar una lista completa
   * DELETE /favorites/list/:listId
   */
  @Delete('list/:listId')
  async removeList(@Param('listId') listId: string) {
    return this.service.deleteCustomList(listId);
  }
}