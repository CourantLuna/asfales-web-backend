
/**
 * 3. FAVORITE ITEM
 * Representa un item individual guardado dentro de una lista.
 * Incluye un "snapshot" (resumen) para poder pintar la tarjeta en la UI
 * sin tener que consultar la base de datos de Lodging/Transport cada vez.
 */
export interface FavoriteItem {
  id: string;             // ID único del favorito (generado por la DB/Firebase)
  listId: string;         // ID de la lista a la que pertenece
  
  // Referencias al recurso original
  resourceId: string;     // El ID del Lodging o TransportTrip
  resourceType: string;
  resourceSubtype?: string; 

  // Metadatos de guardado
  addedAt: string;        // ISO Date
  notes?: string;         // "Este me gusta por la piscina"

  // Snapshot de datos para renderizar la tarjeta (Card) en la lista de favoritos
  // sin hacer una petición extra al backend por cada item.
  snapshot: {
    title: string;
    imageUrl: string;
    locationLabel: string; // Ciudad, País o Ruta
    rating?: number;
    pricePreview?: {
      amount: number;
      currency: string;
      period?: string; // 'night' | 'trip'
    };
  };
}
export interface FullListData extends FavoriteList {
  items: FavoriteItem[];
}

/**
 * 4. FAVORITE LIST
 * Agrupador de favoritos (ej: "Mis vacaciones 2026").
 * Se asocia directamente al UID de Firebase.
 */
export interface FavoriteList {
  id: string;             // ID de la lista
  userId: string;         // Firebase UID del dueño
  
  name: string;           // "General", "Luna de Miel", "Escapada fin de semana"
  description?: string;
  
  isDefault: boolean;     // La lista por defecto ("Me gusta" rápido)
  isPrivate: boolean;     // Para futuro: ¿Se puede compartir la lista?
  
  createdAt: string;
  updatedAt?: string;

  // Metadatos para mostrar en la portada de la carpeta
  itemCount: number;
  coverImage?: string;    // URL de la imagen del último item agregado
}
