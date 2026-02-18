import React from 'react';
import { useAnalysisLimit } from '../hooks/useAnalysisLimit';

export const UsageStatus: React.FC = () => {
  const { usage, loading, canAnalyze, getResetTime } = useAnalysisLimit();

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow p-4 border border-amber-100">
        <div className="animate-pulse flex space-x-4">
          <div className="flex-1 space-y-2">
            <div className="h-4 bg-stone-200 rounded w-3/4"></div>
            <div className="h-2 bg-stone-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!usage) return null;

  const percentage = ((usage.limit - usage.remaining) / usage.limit) * 100;
  const resetTime = getResetTime();

  return (
    <div className="bg-white rounded-lg shadow p-4 border border-amber-100">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-medium text-amber-900 flex items-center gap-2">
          <span className="text-lg">📊</span>
          <span>تحلیل‌های امروز</span>
        </h3>
        <span className={`text-sm font-medium px-2 py-1 rounded-full ${
          !canAnalyze 
            ? 'bg-red-100 text-red-700' 
            : 'bg-green-100 text-green-700'
        }`}>
          {usage.remaining} از {usage.limit} باقی‌مانده
        </span>
      </div>
      
      <div className="relative pt-1">
        <div className="flex mb-2 items-center justify-between">
          <div>
            <span className="text-xs font-semibold inline-block text-amber-600">
              مصرف امروز
            </span>
          </div>
          <div className="text-right">
            <span className="text-xs font-semibold inline-block text-amber-600">
              {usage.today} / {usage.limit}
            </span>
          </div>
        </div>
        <div className="overflow-hidden h-2 mb-4 text-xs flex rounded bg-stone-200">
          <div
            style={{ width: `${percentage}%` }}
            className={`shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center ${
              !canAnalyze ? 'bg-red-500' : 'bg-amber-600'
            }`}
          />
        </div>
      </div>

      {!canAnalyze ? (
        <div className="bg-red-50 border border-red-200 rounded-lg p-3 mt-2">
          <p className="text-sm text-red-700 flex items-center gap-2">
            <span>⚠️</span>
            <span>محدودیت امروز به پایان رسیده است</span>
          </p>
          {resetTime && (
            <p className="text-xs text-red-600 mt-1">
              بازنشانی در {resetTime.hours} ساعت و {resetTime.minutes} دقیقه دیگر
            </p>
          )}
        </div>
      ) : (
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 mt-2">
          <p className="text-sm text-amber-800 flex items-center gap-2">
            <span>⏳</span>
            <span>{usage.remaining} تحلیل دیگر می‌توانید انجام دهید</span>
          </p>
        </div>
      )}
    </div>
  );
};