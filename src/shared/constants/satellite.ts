export const SATELLITES = {
  SENTINEL1: { name: 'Sentinel-1', type: 'SAR', resolution: 10 },
  SENTINEL2: { name: 'Sentinel-2', type: 'Optical', resolution: 10 },
  LANDSAT9: { name: 'Landsat-9', type: 'Thermal', resolution: 30 },
  ALOS: { name: 'ALOS PALSAR', type: 'DEM', resolution: 12.5 },
};

export const SPECTRAL_INDICES = [
  'NDVI', 'Iron Oxide', 'Clay Minerals', 'LST'
];