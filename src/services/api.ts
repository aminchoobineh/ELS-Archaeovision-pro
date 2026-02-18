const API_BASE = '/api';

export interface Coordinates {
  lat: number;
  lng: number;
}

export interface AnalysisResult {
  request: {
    coordinates: Coordinates;
    timestamp: string;
    radius: number;
  };
  data_sources: Array<{
    satellite: string;
    type: string;
    resolution: number;
  }>;
  analysis: {
    subsurface_structures: {
      probability: number;
      count: number;
      features: Array<{
        type: string;
        confidence: number;
        bounding_box: [number, number, number, number];
        estimated_depth: string;
        spectral_signature: string[];
      }>;
    };
    cavities: {
      probability: number;
      count: number;
      thermal_anomaly: number;
      locations: Array<[number, number]>;
    };
    metals: {
      probability: number;
      iron_oxide_index: number;
      hotspots: Array<[number, number]>;
    };
  };
  archaeological_interpretation: {
    summary_fa: string;
    confidence_level: string;
    historical_period: string[];
    recommended_excavation: string;
  };
  soil_analysis: {
    soilType: string;
    description: string;
    indices: {
      clay: number;
      iron: number;
      carbonate: number;
    };
  };
  disclaimer: {
    fa: string;
    en: string;
  };
}

export interface UsageInfo {
  used: number;
  remaining: number;
  limit: number;
  resetDate: string;
}

export interface ApiResponse<T = any> {
  success?: boolean;
  error?: string;
  result?: T;
  usage?: UsageInfo;
  status?: string;
  expiresAt?: string;
  daysLeft?: number;
}

class ApiService {
  private async request<T>(endpoint: string, options?: RequestInit): Promise<T> {
    const response = await fetch(`${API_BASE}${endpoint}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers,
      },
    });

    const data = await response.json();

    if (!response.ok) {
      if (response.status === 429 && data.usage) {
        throw {
          status: 429,
          message: data.error || 'محدودیت روزانه',
          usage: data.usage,
          resetDate: data.resetDate,
        };
      }
      throw new Error(data.error || 'خطا در ارتباط با سرور');
    }

    return data;
  }

  async activate(systemId: string, activationCode: string): Promise<{ success: boolean; expiresAt: string }> {
    return this.request('/activate', {
      method: 'POST',
      body: JSON.stringify({ systemId, activationCode }),
    });
  }

  async verifySession(systemId: string): Promise<{
    status: 'active' | 'expired' | 'not_activated' | 'invalid';
    expiresAt?: string;
    daysLeft?: number;
  }> {
    return this.request('/verify-session', {
      method: 'POST',
      body: JSON.stringify({ systemId }),
    });
  }

  async analyze(systemId: string, coordinates: Coordinates): Promise<{
    success: boolean;
    result: AnalysisResult;
    usage: UsageInfo;
  }> {
    return this.request('/analyze', {
      method: 'POST',
      body: JSON.stringify({ systemId, coordinates }),
    });
  }

  async getUsageStats(systemId: string): Promise<{
    today: number;
    remaining: number;
    limit: number;
    resetDate: string;
    weekly: Array<{ analysis_date: string; analysis_count: number }>;
    history: Array<{ created_at: string; coordinates: Coordinates }>;
  }> {
    return this.request(`/usage-stats?systemId=${encodeURIComponent(systemId)}`);
  }
}

export const api = new ApiService();