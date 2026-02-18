import React from 'react';
import { useNavigate } from 'react-router-dom';
import { getOrCreateSystemId } from '../services/systemId';

export const ExpiredPage: React.FC = () => {
  const navigate = useNavigate();
  const systemId = getOrCreateSystemId();

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-stone-100">
      {/* هدر */}
      <header className="bg-white shadow-sm border-b border-red-200">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center gap-3">
            <span className="text-3xl">🏺</span>
            <h1 className="text-xl font-bold text-amber-900">ArchaeoVision Pro</h1>
          </div>
        </div>
      </header>

      <div className="max-w-md mx-auto px-4 py-12">
        <div className="bg-white rounded-2xl shadow-xl p-8 border border-red-100 text-center">
          <div className="text-7xl mb-6 animate-pulse">⌛</div>
          <h1 className="text-2xl font-bold text-red-700 mb-3">
            اشتراک شما منقضی شده است
          </h1>
          
          <div className="bg-red-50 border border-red-200 p-4 rounded-lg mb-6">
            <p className="text-red-800">
              اعتبار ۲ ساله نرم‌افزار شما به پایان رسیده است.
            </p>
            <p className="text-sm text-red-600 mt-2">
              برای تمدید با پشتیبانی تماس بگیرید.
            </p>
          </div>

          <div className="bg-stone-50 rounded-lg p-4 mb-6 text-right">
            <p className="text-sm text-stone-600 mb-1">شناسه دستگاه شما:</p>
            <code className="block bg-white p-2 rounded border font-mono text-sm">
              {systemId}
            </code>
          </div>

          <div className="space-y-3">
            <button
              onClick={() => navigate('/activate')}
              className="w-full bg-amber-800 text-white py-3 rounded-lg font-medium hover:bg-amber-900 transition"
            >
              🎫 دریافت اشتراک جدید
            </button>
            
            <button
              onClick={() => window.location.reload()}
              className="w-full bg-stone-200 text-stone-700 py-2 rounded-lg text-sm hover:bg-stone-300 transition"
            >
              🔄 بررسی مجدد
            </button>
          </div>

          <div className="mt-6 p-4 bg-stone-100 rounded-lg text-sm text-stone-600">
            <p className="font-medium mb-2">📞 پشتیبانی:</p>
            <p>تلگرام: @archaeovision_support</p>
            <p>ایمیل: support@archaeovision.com</p>
          </div>
        </div>
      </div>
    </div>
  );
};