/**
 * El backend puede devolver un array plano o un objeto con la lista en otra clave.
 */
export function parseLivestockListResponse(data: unknown): any[] {
  if (Array.isArray(data)) return data;
  if (data && typeof data === 'object') {
    const o = data as Record<string, unknown>;
    for (const key of ['listings', 'items', 'data', 'results', 'livestock']) {
      const v = o[key];
      if (Array.isArray(v)) return v;
    }
  }
  return [];
}
