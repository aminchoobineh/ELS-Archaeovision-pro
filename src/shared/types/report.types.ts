import { Coordinates } from './satellite.types';

export interface Feature {
  type: string;
  confidence: number;
  bounding_box: [number, number, number, number];
  estimated_depth: string;
}

export interface Analysis {
  subsurface_structures: {
    probability: number;
    count: number;
    features: Feature[];
  };
  cavities: {
    probability: number;
    count: number;
    thermal_anomaly: number;
  };
  metals: {
    probability: number;
    iron_oxide_index: number;
  };
}

export interface Interpretation {
  summary_fa: string;
  confidence_level: string;
}

export interface ScientificReport {
  request: {
    coordinates: Coordinates;
    timestamp: string;
  };
  analysis: Analysis;
  archaeological_interpretation: Interpretation;
}