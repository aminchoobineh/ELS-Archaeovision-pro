// ============================================
// ماژول تحلیل خاک‌شناسی
// توسط تیم زمین‌شناسی
// ============================================

/**
 * تحلیل نوع خاک بر اساس شاخص‌های طیفی
 */
exports.analyzeSoilType = (spectralData) => {
  const { B2, B3, B4, B8, B11, B12 } = spectralData;
  
  // شاخص‌های خاک
  const clayIndex = B11.map((row, y) => 
    row.map((val, x) => val / (B12[y][x] + 0.01))
  );
  
  const ironIndex = B4.map((row, y) => 
    row.map((val, x) => val / (B2[y][x] + 0.01))
  );
  
  const carbonateIndex = B11.map((row, y) => 
    row.map((val, x) => val / (B8[y][x] + 0.01))
  );
  
  // میانگین‌گیری
  const avgClay = clayIndex.flat().reduce((a, b) => a + b, 0) / clayIndex.flat().length;
  const avgIron = ironIndex.flat().reduce((a, b) => a + b, 0) / ironIndex.flat().length;
  const avgCarbonate = carbonateIndex.flat().reduce((a, b) => a + b, 0) / carbonateIndex.flat().length;
  
  // تعیین نوع خاک
  let soilType = 'خاک معمولی';
  let description = '';
  
  if (avgClay > 1.2) {
    soilType = 'خاک رسی';
    description = 'مناسب برای حفظ آثار آلی';
  } else if (avgIron > 1.5) {
    soilType = 'خاک غنی از اکسید آهن';
    description = 'مناسب برای حفظ فلزات';
  } else if (avgCarbonate > 1.3) {
    soilType = 'خاک آهکی';
    description = 'مناسب برای حفظ استخوان و صدف';
  }
  
  return {
    soilType,
    description,
    indices: {
      clay: avgClay,
      iron: avgIron,
      carbonate: avgCarbonate
    }
  };
};