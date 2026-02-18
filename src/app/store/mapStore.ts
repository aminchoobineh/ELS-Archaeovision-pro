import { create } from 'zustand';

interface Coordinates {
  lat: number;
  lng: number;
}

interface MapStore {
  selectedPoint: Coordinates | null;
  setSelectedPoint: (point: Coordinates | null) => void;
  radius: number;
  setRadius: (radius: number) => void;
  mapLayer: 'osm' | 'satellite';
  setMapLayer: (layer: 'osm' | 'satellite') => void;
}

export const useMapStore = create<MapStore>((set) => ({
  selectedPoint: null,
  setSelectedPoint: (point) => set({ selectedPoint: point }),
  radius: 50,
  setRadius: (radius) => set({ radius }),
  mapLayer: 'osm',
  setMapLayer: (layer) => set({ mapLayer: layer }),
}));