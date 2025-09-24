'use client';

import React, { createContext, useContext, useState, useCallback } from 'react';

interface AreaSummary {
  coordinates: {
    lat: number;
    lon: number;
  };
  radius: number;
  location_context: {
    city: string;
    neighborhood: string;
    formatted_address: string;
  };
  places: Array<{
    place_id: string;
    name: string;
    types: string[];
    rating?: number;
    user_ratings_total?: number;
    price_level?: number;
    vicinity?: string;
    geometry?: { lat: number; lng: number };
    business_status?: string;
    opening_hours?: any;
  }>;
  busyness: {
    level: string;
    description: string;
    metrics?: {
      total_places: number;
      avg_ratings_count: number;
      busy_places_ratio: number;
    };
  };
  ai_summary: {
    full_summary: string;
    location_name: string;
    error?: string;
  };
  recommendations: Array<{
    name: string;
    types: string[];
    rating?: number;
    ratings_count?: number;
    price_level?: number;
    vicinity?: string;
    recommendation_reason: string;
  }>;
  area_characteristics: {
    primary_characteristics: string[];
    area_vibe: string;
    place_type_distribution: { [key: string]: number };
  };
}

interface AreaSummaryContextType {
  // State
  areaSummary: AreaSummary | null;
  isLoading: boolean;
  error: string | null;
  isVisible: boolean;
  currentRadius: number;
  
  // Actions
  fetchAreaSummary: (lat: number, lon: number, radius?: number) => Promise<void>;
  clearAreaSummary: () => void;
  setVisible: (visible: boolean) => void;
  toggleVisibility: () => void;
  setRadius: (radius: number) => void;
}

const AreaSummaryContext = createContext<AreaSummaryContextType | undefined>(undefined);

interface AreaSummaryProviderProps {
  children: React.ReactNode;
}

export function AreaSummaryProvider({ children }: AreaSummaryProviderProps) {
  const [areaSummary, setAreaSummary] = useState<AreaSummary | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [currentRadius, setCurrentRadius] = useState(2000);

  const fetchAreaSummary = useCallback(async (lat: number, lon: number, radius?: number) => {
    const searchRadius = radius || currentRadius;
    setIsLoading(true);
    setError(null);
    
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
      const response = await fetch(`${apiUrl}/api/area-summary/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          lat,
          lon,
          radius: searchRadius
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail || `HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      if (data.error) {
        throw new Error(data.error);
      }
      
      setAreaSummary(data);
      setIsVisible(true); // Show the panel when data is loaded
      
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      console.error('[Area Summary] Error fetching area summary:', errorMessage);
      setError(errorMessage);
      setAreaSummary(null);
    } finally {
      setIsLoading(false);
    }
  }, [currentRadius]);

  const clearAreaSummary = useCallback(() => {
    setAreaSummary(null);
    setError(null);
    setIsVisible(false);
  }, []);

  const setVisible = useCallback((visible: boolean) => {
    setIsVisible(visible);
  }, []);

  const toggleVisibility = useCallback(() => {
    setIsVisible(prev => !prev);
  }, []);

  const setRadius = useCallback((radius: number) => {
    setCurrentRadius(radius);
  }, []);

  const value: AreaSummaryContextType = {
    areaSummary,
    isLoading,
    error,
    isVisible,
    currentRadius,
    fetchAreaSummary,
    clearAreaSummary,
    setVisible,
    toggleVisibility,
    setRadius,
  };

  return (
    <AreaSummaryContext.Provider value={value}>
      {children}
    </AreaSummaryContext.Provider>
  );
}

export function useAreaSummary() {
  const context = useContext(AreaSummaryContext);
  if (context === undefined) {
    throw new Error('useAreaSummary must be used within an AreaSummaryProvider');
  }
  return context;
}