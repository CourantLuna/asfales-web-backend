import { Controller, Get, Post, Body, Param, Query, Patch, Put } from '@nestjs/common';
import { ItinerariesService } from './itineraries.service';

@Controller('itineraries')
export class ItinerariesController {
  constructor(private readonly itinerariesService: ItinerariesService) {}

  @Get()
  getAll() {
    return this.itinerariesService.findAll();
  }

  @Get('owner/:uid')
  getByOwner(@Param('uid') uid: string) {
    return this.itinerariesService.findByOwner(uid);
  }

  @Get(':id')
  getById(@Param('id') id: string) {
    return this.itinerariesService.findById(id);
  }

  @Post()
  create(@Body() body: any) {
    return this.itinerariesService.create(body);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateData: Record<string, any>) {
    return this.itinerariesService.update(id, updateData);
  }
}