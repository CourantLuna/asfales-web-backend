export type ExperienceCategory = 
  | 'adventure' | 'camping' | 'hiking' | 'trekking' 
  | 'cultural' | 'beach' | 'watersports' | 'gastronomy' 
  | 'concerts' | 'festivals' | 'comedy' | 'photography' 
  | 'shopping' | 'nightlife' | 'sports' | 'spa';

export type AvailabilityMode = 'fixed' | 'recurring' | 'onRequest';

export interface ExperienceAvailability {
  mode: AvailabilityMode;
  startDate?: string; // ISO YYYY-MM-DD
  endDate?: string;
  frequency?: string; // Ej: "Lunes y Viernes"
  maxCapacity: number;
  bookedCount: number;
}

export interface ExperienceHost {
  id: string;
  name: string;
  avatarUrl: string;
}

export interface ItineraryItem {
  time?: string;
  title: string;
  description?: string;
}

export interface FAQItem {
  question: string;
  answer: string;
}

export interface KeyDetail {
  iconName: string;
  label: string;
  value: string;
}

export interface LocationData {
  label: string;       // Ej: "Punta Cana, RD" (Para mostrar en UI)
  cityName: string;    // Ej: "Punta Cana"
  cityCode: string;    // Ej: "PUJ" (IATA o interno)
  countryCode: string; // Ej: "DO"
}


export interface Experience {
  id: string;
  title: string;
  shortDescription: string;
  longDescription: string;
  category: ExperienceCategory;
  price: number;
  currency: 'USD' | 'DOP';
  
  host: ExperienceHost; // <--- Objeto completo
  
  availability: ExperienceAvailability; // <--- Nuevo objeto complejo

  location: LocationData;
  coordinates: {
    lat: number;
    lng: number;
  };

  mainImage: string;
  gallery: string[];

  keyDetails: KeyDetail[];
  itinerary: ItineraryItem[];
  faqs: FAQItem[];
  policies: {
    cancellation: string;
    rules: string[];
  };

  rating: {
    score: number;
    count: number;
  };
  
  isAvailable?: boolean;

  ExperienceTags: string[];

}