import { useEffect } from 'react';
import maplibregl from 'maplibre-gl';

interface Props {
  map: maplibregl.Map;
  onPointSelect: (coords: { lat: number; lng: number }) => void;
  selectedPoint?: { lat: number; lng: number } | null;
}

export const PointSelector: React.FC<Props> = ({ map, onPointSelect, selectedPoint }) => {
  useEffect(() => {
    const handleClick = (e: maplibregl.MapMouseEvent) => {
      onPointSelect({ lat: e.lngLat.lat, lng: e.lngLat.lng });
    };
    map.on('click', handleClick);
    return () => { map.off('click', handleClick); };
  }, [map, onPointSelect]);

  useEffect(() => {
    if (!selectedPoint) return;
    const id = 'selected-point';
    if (map.getLayer(id)) map.removeLayer(id);
    if (map.getSource(id)) map.removeSource(id);

    map.addSource(id, {
      type: 'geojson',
      data: {
        type: 'Feature',
        geometry: { type: 'Point', coordinates: [selectedPoint.lng, selectedPoint.lat] },
        properties: {},
      },
    });
    map.addLayer({
      id,
      type: 'circle',
      source: id,
      paint: {
        'circle-radius': 8,
        'circle-color': '#8B5A2B',
        'circle-stroke-width': 2,
        'circle-stroke-color': '#FFF',
      },
    });
  }, [map, selectedPoint]);

  return null;
};