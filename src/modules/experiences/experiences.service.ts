import { Injectable } from '@nestjs/common';
import { SheetsService } from '../sheets/sheets.service';
import { Experience } from './experiences.types';
import { v4 as uuidv4 } from 'uuid'; 

@Injectable()
export class ExperiencesService {
  private readonly SPREADSHEET_ID = '1hphDHh7NSZJh7YzoGNNQd9BOBCm9JSRQbqY6rUsDxlI'; 
  private readonly SHEET_NAME = 'experiences';

  constructor(private sheetsService: SheetsService) {}

  async findAll(): Promise<Experience[]> {
    const rows = await this.sheetsService.listAll(this.SPREADSHEET_ID, this.SHEET_NAME);
    return rows.map((row) => this.mapRowToEntity(row));
  }

  async findByHost(hostId: string): Promise<Experience[]> {
    const all = await this.findAll();
    // Filtramos en memoria verificando el ID dentro del objeto host
    return all.filter(exp => exp.host.id === hostId);
  }

  async findOne(id: string): Promise<Experience> {
    const row = await this.sheetsService.getById(this.SPREADSHEET_ID, this.SHEET_NAME, id);
    return this.mapRowToEntity(row);
  }

  async create(data: Partial<Experience>) {
    const newExperience = {
      ...data,
      id: data.id || `exp-${uuidv4().split('-')[0]}`,
      // Asegurar valores por defecto si faltan
      host: data.host || { id: 'unknown', name: 'Anónimo', avatarUrl: '' },
      availability: data.availability || { mode: 'onRequest', maxCapacity: 0, bookedCount: 0 }
    } as Experience;

    const payload = this.mapEntityToRow(newExperience);
    await this.sheetsService.create(this.SPREADSHEET_ID, this.SHEET_NAME, payload);
    return newExperience;
  }

  async update(id: string, data: Partial<Experience>) {
    const current = await this.findOne(id);
    const merged = { ...current, ...data }; // Merge simple
    const payload = this.mapEntityToRow(merged);
    await this.sheetsService.update(this.SPREADSHEET_ID, this.SHEET_NAME, id, payload);
    return merged;
  }

  async remove(id: string) {
    return this.sheetsService.delete(this.SPREADSHEET_ID, this.SHEET_NAME, id);
  }

  // --- MAPPERS ---

  private mapRowToEntity(row: any): Experience {
    return {
      id: row.id,
      title: row.title,
      category: row.category as any,
      price: Number(row.price || 0),
      currency: row.currency as 'USD' | 'DOP',
      
      // 1. Construcción del Objeto Host desde columnas planas
      host: {
        id: row.host_id,
        name: row.host_name || 'Anfitrión',
        avatarUrl: row.host_avatar || ''
      },

      // 2. Construcción del Objeto Availability
      availability: {
        mode: row.avail_mode as any || 'onRequest',
        startDate: row.avail_start || undefined,
        endDate: row.avail_end || undefined,
        frequency: row.avail_freq || undefined,
        maxCapacity: Number(row.avail_max || 0),
        bookedCount: Number(row.avail_booked || 0),
      },

      // CAMBIO AQUÍ: Parsear el JSON de location
      location: this.safeJsonParse(row.location_data_json, {
        label: 'Ubicación Desconocida',
        cityName: '',
        cityCode: '',
        countryCode: ''
      }),
      coordinates: {
        lat: Number(row.lat || 0),
        lng: Number(row.lng || 0),
      },
      shortDescription: row.short_desc,
      longDescription: row.long_desc,
      mainImage: row.main_image,
      
      // JSON Parsers
      gallery: this.safeJsonParse(row.gallery_urls, []),
      keyDetails: this.safeJsonParse(row.key_details_json, []),
      itinerary: this.safeJsonParse(row.itinerary_json, []),
      faqs: this.safeJsonParse(row.faqs_json, []),
      policies: {
        cancellation: row.policy_cancellation,
        rules: this.safeJsonParse(row.policy_rules_json, []),
      },
        ExperienceTags:  this.safeJsonParse(row.tags, []),
      
      
      rating: {
        score: Number(row.rating_score || 0),
        count: Number(row.rating_count || 0),
      },
      isAvailable: true
    };
  }

  private mapEntityToRow(entity: Experience): Record<string, any> {
    return {
      id: entity.id,
      title: entity.title,
      category: entity.category,
      price: entity.price,
      currency: entity.currency,
      
      // Flatten Host
      host_id: entity.host.id,
      host_name: entity.host.name,
      host_avatar: entity.host.avatarUrl,

      // Flatten Availability
      avail_mode: entity.availability.mode,
      avail_start: entity.availability.startDate,
      avail_end: entity.availability.endDate,
      avail_freq: entity.availability.frequency,
      avail_max: entity.availability.maxCapacity,
      avail_booked: entity.availability.bookedCount,

      location_data_json: JSON.stringify(entity.location),      lat: entity.coordinates?.lat,
      lng: entity.coordinates?.lng,
      short_desc: entity.shortDescription,
      long_desc: entity.longDescription,
      main_image: entity.mainImage,
      
      gallery_urls: JSON.stringify(entity.gallery || []),
      key_details_json: JSON.stringify(entity.keyDetails || []),
      itinerary_json: JSON.stringify(entity.itinerary || []),
      faqs_json: JSON.stringify(entity.faqs || []),
      policy_cancellation: entity.policies?.cancellation,
      policy_rules_json: JSON.stringify(entity.policies?.rules || []),
      rating_score: entity.rating?.score,
      rating_count: entity.rating?.count,
    };
  }

  private safeJsonParse(jsonString: string, fallback: any) {
    try {
      if (!jsonString) return fallback;
      return JSON.parse(jsonString);
    } catch (e) {
      return fallback;
    }
  }
}