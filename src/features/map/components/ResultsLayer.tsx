import { useEffect } from 'react';
import maplibregl from 'maplibre-gl';

interface Props {
  map: maplibregl.Map;
  report: any;
}

export const ResultsLayer: React.FC<Props> = ({ map, report }) => {
  useEffect(() => {
    if (!report) return;
    // پاکسازی لایه‌های قبلی
    ['structures', 'cavities', 'metals'].forEach((id) => {
      if (map.getLayer(id)) map.removeLayer(id);
      if (map.getSource(id)) map.removeSource(id);
    });

    // نمایش سازه‌ها به صورت پلیگون
    if (report.analysis.subsurface_structures.features.length > 0) {
      const features = report.analysis.subsurface_structures.features.map((f: any) => ({
        type: 'Feature',
        geometry: {
          type: 'Polygon',
          coordinates: [[
            [f.bounding_box[0], f.bounding_box[1]],
            [f.bounding_box[2], f.bounding_box[1]],
            [f.bounding_box[2], f.bounding_box[3]],
            [f.bounding_box[0], f.bounding_box[3]],
            [f.bounding_box[0], f.bounding_box[1]],
          ]],
        },
        properties: { type: f.type, confidence: f.confidence },
      }));

      map.addSource('structures', {
        type: 'geojson',
        data: { type: 'FeatureCollection', features },
      });
      map.addLayer({
        id: 'structures',
        type: 'fill',
        source: 'structures',
        paint: {
          'fill-color': '#8B5A2B',
          'fill-opacity': 0.3,
          'fill-outline-color': '#000',
        },
      });
    }
  }, [map, report]);

  return null;
};