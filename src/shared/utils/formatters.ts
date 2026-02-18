export const toPersianDate = (timestamp: number | string | Date): string => {
  return new Intl.DateTimeFormat('fa-IR').format(new Date(timestamp));
};

export const formatNumber = (num: number): string => {
  return num.toLocaleString('fa-IR');
};

export const formatPercent = (value: number): string => {
  return `${Math.round(value * 100)}%`;
};

export const formatDistance = (meters: number): string => {
  if (meters < 1000) return `${Math.round(meters)} متر`;
  return `${(meters / 1000).toFixed(1)} کیلومتر`;
};

export const formatCoordinates = (lat: number, lng: number): string => {
  return `${lat.toFixed(6)}°, ${lng.toFixed(6)}°`;
};