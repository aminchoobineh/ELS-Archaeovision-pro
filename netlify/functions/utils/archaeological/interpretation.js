// ============================================
// ماژول تفسیر باستان‌شناسی
// توسط تیم باستان‌شناسی
// ============================================

/**
 * تفسیر یافته‌ها بر اساس الگوهای شناسایی شده
 */
exports.interpretFindings = (analysis, nearestSite = null) => {
  const { subsurface, cavities, metals, soilType } = analysis;
  
  let interpretation = '';
  let confidenceLevel = 'low';
  let historicalPeriods = [];
  
  // تحلیل بر اساس نوع ساختار
  if (subsurface.count > 2) {
    interpretation += 'تعداد قابل توجهی ساختار مستطیلی شکل شناسایی شد. ';
    if (subsurface.features.some(f => f.type === 'foundation')) {
      interpretation += 'وجود فنداسیون‌های منظم احتمال یک استقرار دائمی را افزایش می‌دهد. ';
    }
  }
  
  // تحلیل بر اساس حفره‌ها
  if (cavities.count > 1) {
    interpretation += 'چندین حفره با آنومالی دمایی منفی شناسایی شد که می‌تواند نشان‌دهنده فضاهای خالی زیرزمینی باشد. ';
  }
  
  // تحلیل بر اساس فلزات
  if (metals.probability > 0.5) {
    interpretation += 'غلظت بالای اکسید آهن در منطقه، احتمال وجود اشیاء فلزی را افزایش می‌دهد. ';
    if (metals.iron_oxide_index > 0.8) {
      interpretation += 'این غلظت با الگوهای فلزکاری در دوره‌های تاریخی همخوانی دارد. ';
    }
  }
  
  // تحلیل بر اساس خاک
  if (soilType.soilType === 'خاک رسی') {
    interpretation += 'خاک رسی منطقه برای حفظ آثار باستانی بسیار مناسب است. ';
  }
  
  // تخمین دوره تاریخی
  if (nearestSite) {
    interpretation += `این منطقه در ${nearestSite.distance} کیلومتری محوطه ${nearestSite.name} (دوره ${nearestSite.period}) قرار دارد. `;
    historicalPeriods.push(nearestSite.period);
    confidenceLevel = 'medium';
  }
  
  // سطح اطمینان نهایی
  const avgProbability = (subsurface.probability + cavities.probability + metals.probability) / 3;
  
  if (avgProbability > 0.7) {
    confidenceLevel = 'high';
  } else if (avgProbability > 0.4) {
    confidenceLevel = 'medium';
  }
  
  return {
    summary: interpretation,
    confidenceLevel,
    historicalPeriods: historicalPeriods.length > 0 ? historicalPeriods : ['نامشخص'],
    recommendedAction: confidenceLevel === 'high' 
      ? 'توصیه می‌شود حفاری آزمایشی در مختصات شناسایی شده انجام شود.'
      : 'نیاز به بررسی تکمیلی با روش‌های ژئوفیزیکی دارد.'
  };
};