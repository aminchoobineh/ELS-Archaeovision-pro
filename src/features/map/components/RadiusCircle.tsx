import { useEffect } from 'react';
import maplibregl from 'maplibre-gl';

interface Props {
  map: maplibregl.Map;
  center: { lat: number; lng: number };
  radius: number;
}

export const RadiusCircle: React.FC<Props> = ({ map, center, radius }) => {
  useEffect(() => {
    const id = 'radius-circle';
    if (map.getLayer(id)) map.removeLayer(id);
    if (map.getSource(id)) map.removeSource(id);

    map.addSource(id, {
      type: 'geojson',
      data: {
        type: 'Feature',
        geometry: { type: 'Point', coordinates: [center.lng, center.lat] },
        properties: {},
      },
    });

    map.addLayer({
      id,
      type: 'circle',
      source: id,
      paint: {
        'circle-radius': radius / 0.075,
        'circle-color': 'rgba(139, 90, 43, 0.2)',
        'circle-stroke-width': 2,
        'circle-stroke-color': '#8B5A2B',
      },
    });

    return () => {
      if (map.getLayer(id)) map.removeLayer(id);
      if (map.getSource(id)) map.removeSource(id);
    };
  }, [map, center, radius]);

  return null;
};