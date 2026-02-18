import React, { useState } from 'react';
import { useMapStore } from '../app/store/mapStore';
import { api } from '../services/api';
import { useAnalysisLimit } from '../hooks/useAnalysisLimit';
import { getOrCreateSystemId } from '../services/systemId';
import { UsageStatus } from '../components/UsageStatus';
import { ScientificReport } from '../components/ScientificReport';
import { ArchaeoMap } from '../features/map/components/ArchaeoMap';
import { PointSelector } from '../features/map/components/PointSelector';
import { RadiusCircle } from '../features/map/components/RadiusCircle';
import { ResultsLayer } from '../features/map/components/ResultsLayer';
import type { AnalysisResult } from '../services/api';

export const AnalysisPage: React.FC = () => {
  const { selectedPoint, setSelectedPoint, radius } = useMapStore();
  const { canAnalyze, usage, refresh: refreshUsage } = useAnalysisLimit();
  const [analyzing, setAnalyzing] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [map, setMap] = useState<any>(null);

  const handleAnalyze = async () => {
    if (!selectedPoint) {
      setError('لطفاً ابتدا یک نقطه روی نقشه انتخاب کنید');
      return;
    }

    if (!canAnalyze) {
      setError('محدودیت روزانه شما به پایان رسیده است');
      return;
    }

    setAnalyzing(true);
    setError(null);

    try {
      const systemId = getOrCreateSystemId();
      const data = await api.analyze(systemId, selectedPoint);
      setResult(data.result);
      await refreshUsage();
    } catch (err: any) {
      if (err.status === 429) {
        setError('محدودیت روزانه به پایان رسیده است');
      } else {
        setError(err.message || 'خطا در تحلیل');
      }
      console.error(err);
    } finally {
      setAnalyzing(false);
    }
  };

  return (
    <div className="h-screen flex flex-col">
      {/* هدر */}
      <header className="bg-white shadow-sm border-b border-amber-200 px-6 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-2xl">🏺</span>
            <h1 className="text-xl font-bold text-amber-900">تحلیل پیشرفته</h1>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-stone-600">
              {usage && (
                <>
                  <span className="font-medium">{usage.remaining}</span> از{' '}
                  <span className="font-medium">{usage.limit}</span> تحلیل باقی‌مانده
                </>
              )}
            </span>
          </div>
        </div>
      </header>

      {/* محتوای اصلی */}
      <div className="flex-1 flex">
        {/* سایدبار سمت چپ */}
        <div className="w-80 bg-white border-l border-stone-200 p-4 overflow-y-auto">
          <UsageStatus />

          <div className="mt-4 bg-amber-50 p-4 rounded-lg">
            <h3 className="font-medium text-amber-900 mb-2 flex items-center gap-2">
              <span>🎯</span>
              <span>نقطه انتخابی</span>
            </h3>
            
            {selectedPoint ? (
              <div className="bg-white p-3 rounded border border-amber-200 font-mono text-sm">
                <div>عرض: {selectedPoint.lat.toFixed(6)}°</div>
                <div>طول: {selectedPoint.lng.toFixed(6)}°</div>
                <div className="text-xs text-stone-500 mt-1">
                  شعاع: {radius} متر
                </div>
              </div>
            ) : (
              <p className="text-sm text-stone-500">
                روی نقشه کلیک کنید تا نقطه انتخاب شود
              </p>
            )}

            <button
              onClick={handleAnalyze}
              disabled={analyzing || !selectedPoint || !canAnalyze}
              className={`w-full mt-4 py-3 rounded-lg font-medium text-white transition ${
                analyzing || !selectedPoint || !canAnalyze
                  ? 'bg-stone-400 cursor-not-allowed'
                  : 'bg-amber-800 hover:bg-amber-900'
              }`}
            >
              {analyzing ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="animate-spin">⚙️</span>
                  <span>در حال تحلیل...</span>
                </span>
              ) : (
                '🚀 شروع تحلیل'
              )}
            </button>
          </div>

          {error && (
            <div className="mt-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
              ❌ {error}
            </div>
          )}
        </div>

        {/* نقشه */}
        <div className="flex-1 relative">
          <ArchaeoMap onLoad={setMap} />
          {map && (
            <>
              <PointSelector
                map={map}
                onPointSelect={setSelectedPoint}
                selectedPoint={selectedPoint}
              />
              {selectedPoint && (
                <RadiusCircle map={map} center={selectedPoint} radius={radius} />
              )}
              {result && <ResultsLayer map={map} report={result} />}
            </>
          )}
        </div>

        {/* سایدبار سمت راست - نتایج */}
        {result && (
          <div className="w-96 bg-white border-r border-stone-200 overflow-y-auto p-4">
            <ScientificReport report={result} />
          </div>
        )}
      </div>
    </div>
  );
};