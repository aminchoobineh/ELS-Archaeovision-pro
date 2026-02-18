// تشخیص دوره‌های تاریخی بر اساس موقعیت جغرافیایی و الگوها
exports.detectHistoricalPeriod = (lat, lng, structures) => {
  const knownSites = [
    { name: 'تخت جمشید', lat: 29.9355, lng: 52.8915, period: 'هخامنشی' },
    { name: 'پاسارگاد', lat: 30.2000, lng: 53.1794, period: 'هخامنشی' },
    { name: 'شوش', lat: 32.1892, lng: 48.2578, period: 'عیلامی' },
    { name: 'چغازنبیل', lat: 32.0081, lng: 48.5211, period: 'عیلامی' },
    { name: 'بیستون', lat: 34.3900, lng: 47.4361, period: 'ساسانی' },
  ];

  let minDist = Infinity;
  let closestPeriod = 'نامشخص';
  
  for (const site of knownSites) {
    const dist = Math.sqrt((lat - site.lat) ** 2 + (lng - site.lng) ** 2) * 111; // کیلومتر
    if (dist < minDist) {
      minDist = dist;
      closestPeriod = site.period;
    }
  }

  // تحلیل ساختارها برای تأیید دوره
  if (structures.length > 2 && minDist < 200) {
    return closestPeriod;
  }
  return 'نامشخص';
};