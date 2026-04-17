/**
 * Traducciones de estados del ganado de la Base de Datos (Inglés) 
 * a la Interfaz de Usuario (Español).
 */
export const LIVESTOCK_STATUS_LABELS: Record<string, string> = {
  AVAILABLE: 'Disponible',
  RESERVED: 'Reservado',
  SOLD: 'Vendido',
  IN_TRANSIT: 'En Tránsito',
};

/**
 * Colores asociados a cada estado para la UI.
 */
export const LIVESTOCK_STATUS_COLORS: Record<string, string> = {
  AVAILABLE: '#22c55e', // verde-500
  RESERVED: '#f59e0b',  // ambar-500
  SOLD: '#ef4444',      // rojo-500
  IN_TRANSIT: '#3b82f6', // azul-500
};

/**
 * Función helper para obtener el texto en español.
 */
export function getStatusLabel(status: string): string {
  return LIVESTOCK_STATUS_LABELS[status] || status;
}

/**
 * Función helper para obtener el color del estado.
 */
export function getStatusColor(status: string): string {
  return LIVESTOCK_STATUS_COLORS[status] || '#6b7280'; // gris-500 por defecto
}
