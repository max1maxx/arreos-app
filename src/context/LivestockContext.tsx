import React, { createContext, useState, useContext, useCallback } from 'react';
import { api, getApiErrorMessage } from '../api/client';
import { parseLivestockListResponse } from '../utils/parseLivestockListResponse';

interface LivestockContextType {
  listings: any[];
  myListings: any[];
  isLoading: boolean;
  refreshListings: () => Promise<void>;
  refreshMyListings: (userId: string) => Promise<void>;
  deleteListing: (id: string) => Promise<void>;
  addListing: (newListing: any) => void;
  updateListingInState: (updatedListing: any) => void;
}

const LivestockContext = createContext<LivestockContextType | undefined>(undefined);

export const LivestockProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [listings, setListings] = useState<any[]>([]);
  const [myListings, setMyListings] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const refreshListings = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await api.get('/api/livestock');
      const data = parseLivestockListResponse(response.data);
      setListings(data);
    } catch (error) {
      console.error('[LIVESTOCK_REFRESH_ERROR]', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const refreshMyListings = useCallback(async (userId: string) => {
    if (!userId) return;
    try {
      const response = await api.get(`/api/livestock/user/${userId}`);
      setMyListings(parseLivestockListResponse(response.data));
    } catch (error) {
      console.error('[MY_LIVESTOCK_REFRESH_ERROR]', error);
    }
  }, []);

  const deleteListing = useCallback(async (id: string) => {
    try {
      await api.delete(`/api/livestock/${id}`);
      setListings(prev => prev.filter(item => item.id !== id));
      setMyListings(prev => prev.filter(item => item.id !== id));
    } catch (error) {
      throw new Error(getApiErrorMessage(error));
    }
  }, []);

  const addListing = useCallback((newListing: any) => {
    setListings(prev => [newListing, ...prev]);
    setMyListings(prev => [newListing, ...prev]);
  }, []);

  const updateListingInState = useCallback((updatedListing: any) => {
    const mapper = (item: any) => item.id === updatedListing.id ? { ...item, ...updatedListing } : item;
    setListings(prev => prev.map(mapper));
    setMyListings(prev => prev.map(mapper));
  }, []);

  return (
    <LivestockContext.Provider value={{ 
      listings, 
      myListings, 
      isLoading, 
      refreshListings, 
      refreshMyListings,
      deleteListing,
      addListing,
      updateListingInState
    }}>
      {children}
    </LivestockContext.Provider>
  );
};

export const useLivestock = () => {
  const context = useContext(LivestockContext);
  if (context === undefined) {
    throw new Error('useLivestock must be used within a LivestockProvider');
  }
  return context;
};
