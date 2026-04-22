import apiClient from './client';

/**
 * Livestock API Service
 * Decouples API logic from UI Components
 */

export interface LivestockListing {
  id: string;
  category: string;
  breed?: string;
  weight: number;
  quantity: number;
  price_per_lb: number;
  total_price?: number;
  listingLatitude?: number;
  listingLongitude?: number;
  province?: string;
  city?: string;
  images_url: string[];
}

const livestockService = {
  /**
   * Fetches the marketplace listings
   */
  getListings: async (): Promise<LivestockListing[]> => {
    const response = await apiClient.get<LivestockListing[]>('/api/livestock');
    return response.data;
  },

  /**
   * Fetches a specific listing details
   */
  getById: async (id: string): Promise<LivestockListing> => {
    const response = await apiClient.get<LivestockListing>(`/api/livestock/${id}`);
    return response.data;
  },

  /**
   * Creates a new listing with Multi-part data support for images
   */
  create: async (formData: FormData): Promise<LivestockListing> => {
    const response = await apiClient.post<LivestockListing>('/api/livestock', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },
};

export default livestockService;
