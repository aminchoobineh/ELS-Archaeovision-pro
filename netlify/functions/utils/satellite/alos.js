// ============================================
// ماژول پردازش داده‌های ارتفاعی ALOS PALSAR
// توسط تیم زمین‌شناسی و ژئومورفولوژی
// ============================================

/**
 * شبیه‌سازی مدل رقومی ارتفاع
 */
exports.generateDEM = (coords, width = 20, height = 20) => {
  const baseElevation = 800 + (coords.lat % 20) * 20;
  const seed = coords.lng % 15;
  
  const dem = [];
  
  for (let y = 0; y < height; y++) {
    dem[y] = [];
    for (let x = 0; x < width; x++) {
      // توپوگرافی پایه
      let elevation = baseElevation + 
                      Math.sin(x * 0.4 + seed) * 15 + 
                      Math.cos(y * 0.4) * 15 +
                      Math.sin(x * 0.1) * 5 + Math.cos(y * 0.1) * 5;
      
      // شبیه‌سازی ساختارهای مصنوعی (تپه‌های باستانی)
      if (x > 5 && x < 10 && y > 6 && y < 11) {
        elevation += 8;
      }
      
      dem[y][x] = elevation;
    }
  }
  
  return dem;
};

/**
 * محاسبه شیب زمین
 */
exports.calculateSlope = (dem) => {
  const height = dem.length;
  const width = dem[0].length;
  const slope = [];
  
  for (let y = 1; y < height - 1; y++) {
    slope[y] = [];
    for (let x = 1; x < width - 1; x++) {
      const dzdx = (dem[y][x+1] - dem[y][x-1]) / 2;
      const dzdy = (dem[y+1][x] - dem[y-1][x]) / 2;
      slope[y][x] = Math.sqrt(dzdx ** 2 + dzdy ** 2);
    }
  }
  
  return slope;
};