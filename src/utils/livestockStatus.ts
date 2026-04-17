/** Valores que envía/recibe la API (Prisma `LivestockStatus`). */
export type LivestockStatusApi = 'AVAILABLE' | 'RESERVED' | 'SOLD' | 'IN_TRANSIT';

export const LIVESTOCK_STATUS_OPTIONS: { value: LivestockStatusApi; label: string }[] = [
  { value: 'AVAILABLE', label: 'Disponible' },
  { value: 'SOLD', label: 'Vendido' },
  { value: 'RESERVED', label: 'Reservado' },
  { value: 'IN_TRANSIT', label: 'En tránsito' },
];

export function livestockStatusLabelEs(status: string | undefined | null): string {
  const map: Record<string, string> = {
    AVAILABLE: 'Disponible',
    RESERVED: 'Reservado',
    SOLD: 'Vendido',
    IN_TRANSIT: 'En tránsito',
  };
  if (!status) return 'Sin estado';
  const key = String(status).toUpperCase();
  return map[key] ?? status;
}

export function livestockStatusBadgeColors(status: string | undefined | null): {
  backgroundColor: string;
  color: string;
} {
  const key = String(status ?? '').toUpperCase();
  switch (key) {
    case 'AVAILABLE':
      return { backgroundColor: '#e8f5e9', color: '#2e7d32' };
    case 'SOLD':
      return { backgroundColor: '#fce4ec', color: '#c62828' };
    case 'RESERVED':
      return { backgroundColor: '#fff3e0', color: '#e65100' };
    case 'IN_TRANSIT':
      return { backgroundColor: '#e3f2fd', color: '#1565c0' };
    default:
      return { backgroundColor: '#f1f5f9', color: '#64748b' };
  }
}
