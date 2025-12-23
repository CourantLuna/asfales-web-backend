import { Body, Controller, Delete, Get, Param, Post, Put } from '@nestjs/common';
import { ExperiencesService } from './experiences.service';
import { Experience } from './experiences.types';

@Controller('experiences')
export class ExperiencesController {
  constructor(private readonly experiencesService: ExperiencesService) {}

  // IMPORTANTE: Rutas específicas primero
  @Get('host/:hostId')
  findByHost(@Param('hostId') hostId: string) {
    return this.experiencesService.findByHost(hostId);
  }

  @Get()
  findAll() {
    return this.experiencesService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.experiencesService.findOne(id);
  }

  @Post()
  create(@Body() body: Partial<Experience>) {
    return this.experiencesService.create(body);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() body: Partial<Experience>) {
    return this.experiencesService.update(id, body);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.experiencesService.remove(id);
  }
}