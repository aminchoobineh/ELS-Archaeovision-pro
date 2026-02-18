export const MAP_COLORS = {
  radiusFill: 'rgba(139, 90, 43, 0.2)',
  radiusStroke: '#8B5A2B',
  selectedPoint: '#8B5A2B',
};

export const PROBABILITY_COLORS = {
  very_low: '#EF4444',
  low: '#F97316',
  medium: '#EAB308',
  high: '#22C55E',
  very_high: '#3B82F6',
};

export const getConfidenceColor = (confidence: number): string => {
  if (confidence < 0.2) return PROBABILITY_COLORS.very_low;
  if (confidence < 0.4) return PROBABILITY_COLORS.low;
  if (confidence < 0.6) return PROBABILITY_COLORS.medium;
  if (confidence < 0.8) return PROBABILITY_COLORS.high;
  return PROBABILITY_COLORS.very_high;
};