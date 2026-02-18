// ============================================
// ماژول پردازش داده‌های حرارتی Landsat
// توسط تیم سنجش از دور و تحلیل حرارتی
// ============================================

/**
 * شبیه‌سازی داده‌های حرارتی
 */
exports.generateThermalData = (coords, width = 20, height = 20) => {
  const baseTemp = 290 + (coords.lat % 10) * 2; // کلوین
  const seed = coords.lng % 10;
  
  const thermal = [];
  
  for (let y = 0; y < height; y++) {
    thermal[y] = [];
    for (let x = 0; x < width; x++) {
      // دمای پایه با تغییرات طبیعی
      let temp = baseTemp + Math.sin(x * 0.3 + seed) * 5 + Math.cos(y * 0.3) * 5;
      
      // شبیه‌سازی حفره (دمای کمتر)
      if (x > 8 && x < 12 && y > 8 && y < 12) {
        temp -= 8;
      }
      
      thermal[y][x] = temp;
    }
  }
  
  return thermal;
};

/**
 * تشخیص آنومالی دمایی (حفره)
 */
exports.detectThermalAnomalies = (thermalData, threshold = 2.5) => {
  const flat = thermalData.flat();
  const mean = flat.reduce((a, b) => a + b, 0) / flat.length;
  const std = Math.sqrt(flat.reduce((a, b) => a + (b - mean) ** 2, 0) / flat.length);
  
  const anomalies = [];
  
  for (let y = 0; y < thermalData.length; y++) {
    for (let x = 0; x < thermalData[y].length; x++) {
      const anomaly = mean - thermalData[y][x];
      if (anomaly > threshold * std) {
        anomalies.push({
          x, y,
          temperature: thermalData[y][x],
          anomaly: anomaly,
          confidence: Math.min(0.95, anomaly / (3 * std))
        });
      }
    }
  }
  
  return anomalies;
};