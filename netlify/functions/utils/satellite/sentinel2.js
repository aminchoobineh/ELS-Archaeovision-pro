// ============================================
// ماژول پردازش داده‌های Sentinel-2 (اپتیکال)
// توسط تیم سنجش از دور و طیف‌سنجی
// ============================================

/**
 * شبیه‌سازی داده‌های چندطیفی
 */
exports.generateMultispectralData = (coords, width = 20, height = 20) => {
  const seed = (coords.lat * 100 + coords.lng * 200) % 50;
  
  // باندهای Sentinel-2
  const bands = {
    B2: [], // آبی
    B3: [], // سبز
    B4: [], // قرمز
    B8: [], // فروسرخ نزدیک
    B11: [], // فروسرخ موج کوتاه 1
    B12: [] // فروسرخ موج کوتاه 2
  };
  
  for (let y = 0; y < height; y++) {
    bands.B2[y] = [];
    bands.B3[y] = [];
    bands.B4[y] = [];
    bands.B8[y] = [];
    bands.B11[y] = [];
    bands.B12[y] = [];
    
    for (let x = 0; x < width; x++) {
      // شبیه‌سازی پوشش گیاهی
      const veg = Math.sin(x * 0.3 + seed) * Math.cos(y * 0.3 + seed) * 0.3 + 0.5;
      
      bands.B2[y][x] = 0.2 + Math.random() * 0.1; // آبی
      bands.B3[y][x] = 0.3 + Math.random() * 0.2; // سبز
      bands.B4[y][x] = 0.2 + veg * 0.3; // قرمز (گیاهان کم)
      bands.B8[y][x] = 0.4 + veg * 0.5; // NIR (گیاهان زیاد)
      bands.B11[y][x] = 0.3 + (1 - veg) * 0.3; // SWIR1
      bands.B12[y][x] = 0.2 + (1 - veg) * 0.2; // SWIR2
      
      // شبیه‌سازی خاک غنی از اکسید آهن
      if (x > 8 && x < 15 && y > 7 && y < 12) {
        bands.B4[y][x] *= 1.5; // قرمز بیشتر
        bands.B2[y][x] *= 0.7; // آبی کمتر
      }
      
      // شبیه‌سازی رطوبت (حفره)
      if (x > 12 && x < 14 && y > 10 && y < 12) {
        bands.B11[y][x] *= 0.6; // SWIR کمتر (رطوبت بیشتر)
      }
    }
  }
  
  return bands;
};

/**
 * محاسبه شاخص NDVI (پوشش گیاهی)
 */
exports.calculateNDVI = (B4, B8) => {
  const height = B4.length;
  const width = B4[0].length;
  const ndvi = [];
  
  for (let y = 0; y < height; y++) {
    ndvi[y] = [];
    for (let x = 0; x < width; x++) {
      const nir = B8[y][x];
      const red = B4[y][x];
      const sum = nir + red;
      ndvi[y][x] = sum === 0 ? 0 : (nir - red) / sum;
    }
  }
  
  return ndvi;
};

/**
 * محاسبه شاخص اکسید آهن
 */
exports.calculateIronOxide = (B4, B2) => {
  const height = B4.length;
  const width = B4[0].length;
  const iron = [];
  
  for (let y = 0; y < height; y++) {
    iron[y] = [];
    for (let x = 0; x < width; x++) {
      iron[y][x] = B4[y][x] / (B2[y][x] + 0.01);
    }
  }
  
  return iron;
};