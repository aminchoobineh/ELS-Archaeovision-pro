import React from 'react';

interface AboutTabProps {
  onClose?: () => void;
}

export const AboutTab: React.FC<AboutTabProps> = ({ onClose }) => {
  return (
    <div className="bg-white rounded-xl shadow-lg p-5 border border-amber-200 max-w-2xl mx-auto">
      {/* هدر با دکمه بستن */}
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center gap-2">
          <span className="text-2xl">🏺</span>
          <h2 className="text-lg font-bold text-amber-900">درباره ArchaeoVision Pro</h2>
        </div>
        {onClose && (
          <button onClick={onClose} className="text-stone-400 hover:text-stone-600">
            ✕
          </button>
        )}
      </div>

      {/* معرفی */}
      <p className="text-sm text-stone-700 mb-4">
        <span className="font-bold text-amber-800">ArchaeoVision Pro</span> یک سامانه تخصصی شناسایی هوشمند محوطه‌های باستانی است که با همکاری تیمی از متخصصین باستان‌شناسی، زمین‌شناسی و سنجش از دور توسعه یافته است.
      </p>

      {/* مزایا */}
      <div className="grid grid-cols-2 gap-2 mb-4">
        <div className="bg-amber-50 p-2 rounded text-center">
          <span className="text-lg block">⚡</span>
          <span className="text-xs font-bold text-amber-900">۹۰٪ سریع‌تر</span>
        </div>
        <div className="bg-amber-50 p-2 rounded text-center">
          <span className="text-lg block">💰</span>
          <span className="text-xs font-bold text-amber-900">کاهش هزینه</span>
        </div>
        <div className="bg-amber-50 p-2 rounded text-center">
          <span className="text-lg block">🎯</span>
          <span className="text-xs font-bold text-amber-900">دقت تا ۸۵٪</span>
        </div>
        <div className="bg-amber-50 p-2 rounded text-center">
          <span className="text-lg block">📊</span>
          <span className="text-xs font-bold text-amber-900">گزارش علمی</span>
        </div>
      </div>

      {/* داده‌های ماهواره‌ای */}
      <div className="bg-stone-50 p-3 rounded-lg mb-4">
        <p className="text-xs font-bold text-amber-800 mb-2">🛰️ داده‌های ماهواره‌ای:</p>
        <div className="grid grid-cols-2 gap-2 text-xs">
          <div className="flex items-center gap-1">
            <span className="text-amber-600">•</span>
            <span>Sentinel-1 (راداری)</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="text-amber-600">•</span>
            <span>Sentinel-2 (طیفی)</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="text-amber-600">•</span>
            <span>Landsat-9 (حرارتی)</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="text-amber-600">•</span>
            <span>ALOS (ارتفاعی)</span>
          </div>
        </div>
      </div>

      {/* سلب مسئولیت حقوقی (کوتاه و قوی) */}
      <div className="bg-red-50 border-r-4 border-red-600 p-3 rounded-lg text-xs mb-4">
        <div className="flex items-start gap-2">
          <span className="text-red-600 text-base">⚠️</span>
          <div>
            <p className="font-bold text-red-800 mb-1">سلب مسئولیت قانونی مهم:</p>
            <p className="text-red-700 leading-relaxed">
              این نرم‌افزار <span className="font-bold">صرفاً یک ابزار تحقیقاتی</span> است و نتایج آن بر اساس داده‌های ماهواره‌ای 
              (با محدودیت‌های پوشش ابر، رطوبت و پوشش گیاهی) و مدل‌های آماری تولید می‌شود. 
              <span className="font-bold"> هیچ‌گونه قطعیت ۱۰۰٪ وجود ندارد.</span>
            </p>
            <p className="text-red-700 mt-2 font-bold">
              هرگونه حفاری یا کاوش نیازمند مجوز رسمی از پژوهشگاه میراث فرهنگی است. 
              حفاری غیرمجاز جرم کیفری بوده و مجازات حبس دارد.
            </p>
            <p className="text-red-700 mt-2">
              تیم ArchaeoVision هیچ مسئولیتی در قبال اقدامات غیرقانونی کاربران ندارد.
            </p>
          </div>
        </div>
      </div>

      {/* پشتیبانی تلگرام */}
      <div className="flex items-center justify-between bg-blue-50 p-3 rounded-lg border border-blue-200">
        <div className="flex items-center gap-2">
          <span className="text-blue-600">📱</span>
          <span className="text-xs font-bold text-blue-800">پشتیبانی:</span>
        </div>
        <div className="bg-white px-3 py-1 rounded border border-blue-300">
          <span className="text-xs font-mono text-blue-800">@archaeovision_support</span>
        </div>
      </div>

      {/* تاریخ */}
      <div className="mt-3 text-[10px] text-stone-400 text-center">
        نسخه ۳.۰ | بهمن ۱۴۰۴
      </div>
    </div>
  );
};