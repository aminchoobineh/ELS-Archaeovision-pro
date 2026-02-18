// ============================================
// ماژول تشخیص ساختارهای زمین‌شناسی
// توسط تیم زمین‌شناسی و ژئوفیزیک
// ============================================

/**
 * تشخیص خطواره‌ها و گسل‌ها
 */
exports.detectLineaments = (dem, threshold = 5) => {
  const height = dem.length;
  const width = dem[0].length;
  const lineaments = [];
  
  // تشخیص لبه‌ها با فیلتر Sobel
  for (let y = 1; y < height - 1; y++) {
    for (let x = 1; x < width - 1; x++) {
      const gx = (dem[y-1][x+1] + 2*dem[y][x+1] + dem[y+1][x+1]) -
                 (dem[y-1][x-1] + 2*dem[y][x-1] + dem[y+1][x-1]);
      
      const gy = (dem[y+1][x-1] + 2*dem[y+1][x] + dem[y+1][x+1]) -
                 (dem[y-1][x-1] + 2*dem[y-1][x] + dem[y-1][x+1]);
      
      const gradient = Math.sqrt(gx * gx + gy * gy);
      
      if (gradient > threshold) {
        lineaments.push({
          x, y,
          gradient,
          direction: Math.atan2(gy, gx) * 180 / Math.PI
        });
      }
    }
  }
  
  return lineaments;
};