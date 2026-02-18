import React, { useEffect, useRef, useState } from 'react';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';

interface Props {
  onLoad?: (map: maplibregl.Map) => void;
}

export const ArchaeoMap: React.FC<Props> = ({ onLoad }) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<maplibregl.Map | null>(null);
  const [layer, setLayer] = useState<'osm' | 'satellite'>('osm'); // پیش‌فرض OSM برای اطمینان

  // تابع تغییر لایه
  const toggleLayer = () => {
    if (!map.current) return;
    const newLayer = layer === 'osm' ? 'satellite' : 'osm';
    setLayer(newLayer);
    if (newLayer === 'osm') {
      map.current.setLayoutProperty('osm', 'visibility', 'visible');
      map.current.setLayoutProperty('satellite', 'visibility', 'none');
    } else {
      map.current.setLayoutProperty('osm', 'visibility', 'none');
      map.current.setLayoutProperty('satellite', 'visibility', 'visible');
    }
  };

  useEffect(() => {
    if (!mapContainer.current || map.current) return;

    map.current = new maplibregl.Map({
      container: mapContainer.current,
      style: {
        version: 8,
        sources: {
          osm: {
            type: 'raster',
            tiles: ['https://a.tile.openstreetmap.org/{z}/{x}/{y}.png'],
            tileSize: 256,
            attribution: '© OpenStreetMap',
          },
          satellite: {
            type: 'raster',
            tiles: [
              'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
            ],
            tileSize: 256,
            attribution: '© Esri',
          },
        },
        layers: [
          { id: 'osm', type: 'raster', source: 'osm', layout: { visibility: 'visible' } },
          { id: 'satellite', type: 'raster', source: 'satellite', layout: { visibility: 'none' } },
        ],
      },
      center: [51.3890, 35.6892],
      zoom: 6,
    });

    map.current.addControl(new maplibregl.NavigationControl(), 'top-right');
    map.current.on('load', () => onLoad?.(map.current!));

    return () => map.current?.remove();
  }, [onLoad]);

  return (
    <>
      <div ref={mapContainer} className="w-full h-full" />
      <button
        onClick={toggleLayer}
        className="absolute top-20 left-4 z-50 bg-white px-3 py-2 rounded shadow text-sm"
      >
        {layer === 'osm' ? '🌍 ماهواره' : '🗺️ نقشه'}
      </button>
    </>
  );
};