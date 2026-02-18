import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AboutTab } from '../components/AboutTab';
import { ArchaeoMap } from '../features/map/components/ArchaeoMap';
import { PointSelector } from '../features/map/components/PointSelector';
import { RadiusCircle } from '../features/map/components/RadiusCircle';
import { ResultsLayer } from '../features/map/components/ResultsLayer';
import { useMapStore } from '../app/store/mapStore';
import { useLicenseCheck } from '../hooks/useLicenseCheck';
import { useAnalysisLimit } from '../hooks/useAnalysisLimit';
import { ScientificReport } from '../components/ScientificReport';
import { api, AnalysisResult } from '../services/api';
import { getOrCreateSystemId } from '../services/systemId';

export default function Dashboard() {
  const navigate = useNavigate();
  const [showAbout, setShowAbout] = useState(false);
  const [map, setMap] = useState<any>(null);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [manualLat, setManualLat] = useState('');
  const [manualLng, setManualLng] = useState('');

  const { selectedPoint, setSelectedPoint, radius } = useMapStore();
  const { usage, loading: usageLoading, canAnalyze, refresh: refreshUsage } = useAnalysisLimit();
  const { status } = useLicenseCheck();

  // هدایت به صفحات لایسنس در صورت لزوم
  useEffect(() => {
    if (status === 'not_activated') {
      navigate('/activate');
    } else if (status === 'expired') {
      navigate('/expired');
    }
  }, [status, navigate]);

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
      const response = await api.analyze(systemId, selectedPoint);
      setResult(response.result);
      await refreshUsage();
    } catch (err: any) {
      setError(err.message || 'خطا در انجام تحلیل');
    } finally {
      setAnalyzing(false);
    }
  };

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const lat = parseFloat(manualLat);
    const lng = parseFloat(manualLng);
    if (isNaN(lat) || isNaN(lng) || lat < -90 || lat > 90 || lng < -180 || lng > 180) {
      alert('مختصات نامعتبر است');
      return;
    }
    setSelectedPoint({ lat, lng });
    if (map) {
      map.flyTo({ center: [lng, lat], zoom: 16 });
    }
  };

  return (
    <div className="h-screen flex flex-col">
      {/* هدر */}
      <header className="bg-white shadow-sm px-6 py-3 flex justify-between items-center">
        <div className="flex items-center gap-3">
          <span className="text-2xl">🏺</span>
          <h1 className="text-xl font-bold text-amber-900">ArchaeoVision Pro</h1>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-sm text-stone-600">
            {status === 'active' ? '✅ فعال' : '⚠️ غیرفعال'}
          </span>
          <button
            onClick={() => setShowAbout(!showAbout)}
            className="flex items-center gap-2 bg-amber-100 text-amber-800 px-4 py-2 rounded-lg text-sm hover:bg-amber-200 transition"
          >
            <span>ℹ️</span> <span>درباره ما</span>
          </button>
        </div>
      </header>

      {/* محتوای اصلی */}
      <main className="flex-1 relative">
        {/* نقشه (حالت ماهواره پیش‌فرض) */}
        <div className="absolute inset-0">
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

        {/* پنل سمت چپ */}
        <div className="absolute top-4 left-4 z-40 w-80 space-y-4">
          {/* فرم ورود دستی مختصات */}
          <div className="bg-white rounded-lg shadow p-4 border border-amber-200">
            <p className="text-sm font-medium text-amber-900 mb-2">📍 ورود دستی مختصات</p>
            <form onSubmit={handleManualSubmit} className="space-y-2">
              <input
                type="text"
                placeholder="عرض جغرافیایی (lat)"
                value={manualLat}
                onChange={(e) => setManualLat(e.target.value)}
                className="w-full p-2 border rounded text-sm"
              />
              <input
                type="text"
                placeholder="طول جغرافیایی (lng)"
                value={manualLng}
                onChange={(e) => setManualLng(e.target.value)}
                className="w-full p-2 border rounded text-sm"
              />
              <button
                type="submit"
                className="w-full bg-amber-600 text-white py-2 rounded-lg text-sm hover:bg-amber-700"
              >
                رفتن به نقطه
              </button>
            </form>
          </div>

          {/* نقطه انتخابی و دکمه تحلیل */}
          {selectedPoint && (
            <div className="bg-white rounded-lg shadow p-4 border border-amber-200">
              <p className="text-sm font-medium text-amber-900 mb-2">📍 نقطه انتخابی</p>
              <p className="text-xs font-mono">
                {selectedPoint.lat.toFixed(6)}°, {selectedPoint.lng.toFixed(6)}°
              </p>
              <button
                onClick={handleAnalyze}
                disabled={analyzing || !canAnalyze}
                className={`w-full mt-3 py-2 rounded-lg text-sm font-medium text-white ${
                  analyzing || !canAnalyze
                    ? 'bg-stone-400 cursor-not-allowed'
                    : 'bg-amber-800 hover:bg-amber-900'
                }`}
              >
                {analyzing ? '⏳ در حال تحلیل...' : '🚀 شروع تحلیل'}
              </button>
              {error && <p className="text-xs text-red-600 mt-2">{error}</p>}
            </div>
          )}

          {/* نمایش آمار مصرف با لودر */}
          {usageLoading ? (
            <div className="bg-white rounded-lg shadow p-4 border border-amber-100">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-amber-900">تحلیل امروز</span>
                <span className="text-xs bg-amber-100 px-2 py-1 rounded">در حال دریافت...</span>
              </div>
              <div className="w-full bg-stone-200 h-2 rounded-full mt-2">
                <div className="h-2 rounded-full bg-amber-600" style={{ width: '0%' }} />
              </div>
            </div>
          ) : (
            usage && (
              <div className="bg-white rounded-lg shadow p-4 border border-amber-100">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-amber-900">تحلیل امروز</span>
                  <span className="text-xs bg-amber-100 px-2 py-1 rounded">
                    {usage.remaining} / {usage.limit} باقی‌مانده
                  </span>
                </div>
                <div className="w-full bg-stone-200 h-2 rounded-full mt-2">
                  <div
                    className="h-2 rounded-full bg-amber-600"
                    style={{ width: `${((usage.limit - usage.remaining) / usage.limit) * 100}%` }}
                  />
                </div>
              </div>
            )
          )}
        </div>

        {/* تب درباره ما */}
        {showAbout && (
          <div className="absolute top-4 left-4 z-50 w-96 max-w-full">
            <AboutTab onClose={() => setShowAbout(false)} />
          </div>
        )}

        {/* پنل نتیجه تحلیل */}
        {result && (
          <div className="absolute top-4 right-4 z-40 w-96 bg-white rounded-lg shadow-lg p-4 max-h-[calc(100vh-8rem)] overflow-y-auto">
            <div className="flex justify-between items-center mb-3">
              <h3 className="font-bold text-amber-900">📋 گزارش تحلیل</h3>
              <button
                onClick={() => setResult(null)}
                className="text-stone-400 hover:text-stone-600"
              >
                ✕
              </button>
            </div>
            <ScientificReport report={result} />
          </div>
        )}
      </main>
    </div>
  );
}