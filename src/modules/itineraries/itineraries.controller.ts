import { Controller, Get, Post, Body, Param, Query } from '@nestjs/common';
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

  @Post()
  create(@Body() body: any) {
    return this.itinerariesService.create(body);
  }
}