import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getOrCreateSystemId } from '../services/systemId';
import { api } from '../services/api';

export const ActivationPage: React.FC = () => {
  const [systemId, setSystemId] = useState('');
  const [activationCode, setActivationCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    setSystemId(getOrCreateSystemId());
  }, []);

  const handleActivate = async () => {
    if (!activationCode.trim()) {
      setError('لطفاً کد فعال‌سازی را وارد کنید');
      return;
    }

    setLoading(true);
    setError('');

    try {
      await api.activate(systemId, activationCode.toUpperCase());
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.message || 'خطا در فعال‌سازی');
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(systemId);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Copy failed:', err);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 to-stone-100">
      {/* هدر */}
      <header className="bg-white shadow-sm border-b border-amber-200">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center gap-3">
            <span className="text-3xl">🏺</span>
            <h1 className="text-xl font-bold text-amber-900">ArchaeoVision Pro</h1>
            <span className="bg-amber-100 text-amber-800 text-xs px-2 py-1 rounded-full">
              نسخه ۳.۰
            </span>
          </div>
        </div>
      </header>

      <div className="max-w-md mx-auto px-4 py-12">
        <div className="bg-white rounded-2xl shadow-xl p-8 border border-amber-100">
          <div className="text-center mb-8">
            <div className="text-6xl mb-4">🏛️</div>
            <h2 className="text-2xl font-bold text-amber-900">فعال‌سازی نرم‌افزار</h2>
            <p className="text-amber-700 mt-2 text-sm">
              لایسنس ۲ ساله با قابلیت ۲ تحلیل روزانه
            </p>
          </div>

          {/* شناسه دستگاه */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-stone-700 mb-2">
              شناسه دستگاه (ثابت):
            </label>
            <div className="flex gap-2">
              <code className="flex-1 bg-stone-50 p-3 rounded-lg font-mono text-sm border border-stone-200 text-center">
                {systemId}
              </code>
              <button
                onClick={copyToClipboard}
                className={`px-4 py-2 rounded-lg transition-all ${
                  copied 
                    ? 'bg-green-600 text-white' 
                    : 'bg-amber-700 text-white hover:bg-amber-800'
                }`}
              >
                {copied ? '✅' : '📋'}
              </button>
            </div>
            <p className="text-xs text-stone-500 mt-2 text-center">
              این کد را برای پشتیبانی ارسال کنید
            </p>
          </div>

          {/* کد فعال‌سازی */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-stone-700 mb-2">
              کد فعال‌سازی ۲ ساله:
            </label>
            <input
              type="text"
              className="w-full p-3 border-2 border-stone-200 rounded-lg font-mono text-lg text-center uppercase tracking-wider focus:border-amber-500 focus:ring-2 focus:ring-amber-200 outline-none transition"
              placeholder="M2A7C6"
              value={activationCode}
              onChange={(e) => setActivationCode(e.target.value.toUpperCase())}
              maxLength={6}
              autoComplete="off"
            />
          </div>

          {/* خطا */}
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm flex items-center gap-2">
              <span>❌</span>
              <span>{error}</span>
            </div>
          )}

          {/* دکمه فعال‌سازی */}
          <button
            onClick={handleActivate}
            disabled={loading || activationCode.length !== 6}
            className={`w-full py-4 rounded-xl font-bold text-lg shadow-lg transition-all ${
              loading || activationCode.length !== 6
                ? 'bg-stone-400 cursor-not-allowed opacity-50'
                : 'bg-gradient-to-r from-amber-800 to-stone-800 text-white hover:shadow-xl hover:-translate-y-0.5'
            }`}
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <span className="animate-spin">⚙️</span>
                <span>در حال فعال‌سازی...</span>
              </span>
            ) : (
              '✅ فعال‌سازی با اعتبار ۲ سال'
            )}
          </button>

          {/* راهنما */}
          <div className="mt-6 p-4 bg-amber-50 rounded-lg border border-amber-200 text-sm">
            <p className="font-bold text-amber-900 mb-3 flex items-center gap-2">
              <span>📌</span>
              <span>مشخصات لایسنس:</span>
            </p>
            <ul className="space-y-2 text-stone-700">
              <li className="flex items-start gap-2">
                <span className="text-amber-600">✓</span>
                <span>مدت اعتبار: ۲ سال کامل</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-amber-600">✓</span>
                <span>تحلیل روزانه: ۲ بار در روز</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-amber-600">✓</span>
                <span>پشتیبانی: ۷ روز هفته</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-amber-600">✓</span>
                <span>قابل نصب روی موبایل و دسکتاپ</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};