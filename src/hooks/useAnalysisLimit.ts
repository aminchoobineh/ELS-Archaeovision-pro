import { useState, useEffect, useCallback } from 'react';
import { api } from '../services/api';
import { getOrCreateSystemId } from '../services/systemId';

interface UsageStats {
  today: number;
  remaining: number;
  limit: number;
  resetDate: string;
  weekly: Array<{ analysis_date: string; analysis_count: number }>;
  history: Array<{ created_at: string; coordinates: { lat: number; lng: number } }>;
}

export const useAnalysisLimit = () => {
  const [usage, setUsage] = useState<UsageStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchUsage = useCallback(async () => {
    try {
      setLoading(true);
      const systemId = getOrCreateSystemId();
      const stats = await api.getUsageStats(systemId);
      setUsage(stats);
      setError(null);
    } catch (err) {
      setError('خطا در دریافت آمار مصرف');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUsage();
    const interval = setInterval(fetchUsage, 60000);
    return () => clearInterval(interval);
  }, [fetchUsage]);

  const canAnalyze = usage ? usage.remaining > 0 : false;

  const getResetTime = useCallback(() => {
    if (!usage?.resetDate) return null;
    const reset = new Date(usage.resetDate);
    const now = new Date();
    const diff = reset.getTime() - now.getTime();
    if (diff <= 0) return null;
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    return { hours, minutes };
  }, [usage?.resetDate]);

  return { usage, loading, error, canAnalyze, getResetTime, refresh: fetchUsage };
};