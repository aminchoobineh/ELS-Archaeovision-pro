// ============================================
// ماژول پردازش داده‌های Sentinel-1 (SAR)
// توسط تیم سنجش از دور و رادار
// ============================================

/**
 * شبیه‌سازی داده‌های راداری برای منطقه
 * @param {Object} coords - مختصات جغرافیایی
 * @param {number} width - عرض تصویر
 * @param {number} height - ارتفاع تصویر
 */
exports.generateSARData = (coords, width = 20, height = 20) => {
  // تولید داده‌های مصنوعی بر اساس مختصات
  const seed = (coords.lat * 1000 + coords.lng * 1000) % 100;
  
  const vv = Array(height).fill(0).map((_, y) => 
    Array(width).fill(0).map((_, x) => {
      // بازپراکندگی پایه
      let base = 0.5 + Math.sin(x * 0.5 + seed) * 0.2 + Math.cos(y * 0.5 + seed) * 0.2;
      
      // اضافه کردن نویز Speckle
      base *= 1 + (Math.random() - 0.5) * 0.3;
      
      // شبیه‌سازی سازه‌های مستطیلی
      if (x > 5 && x < 12 && y > 4 && y < 9) base += 0.8;
      if (x > 13 && x < 18 && y > 12 && y < 16) base += 1.2;
      
      return Math.min(2.5, base);
    })
  );
  
  const vh = vv.map(row => row.map(val => val * (0.3 + Math.random() * 0.2)));
  
  return { vv, vh, metadata: { satellite: 'SENTINEL-1', mode: 'IW', polarization: 'DV' } };
};

/**
 * تشخیص ساختارهای مستطیلی از داده‌های SAR
 */
exports.detectStructures = (vv, vh, threshold = 0.65) => {
  const structures = [];
  const height = vv.length;
  const width = vv[0].length;
  
  // میانگین‌گیری از دو باند
  const combined = vv.map((row, y) => 
    row.map((val, x) => (val + vh[y][x]) / 2)
  );
  
  // آستانه‌گذاری
  const binary = combined.map(row => 
    row.map(val => val > threshold ? 1 : 0)
  );
  
  // تشخیص مؤلفه‌های همبند (الگوریتم ساده)
  const visited = Array(height).fill(false).map(() => Array(width).fill(false));
  
  const dfs = (y, x, component) => {
    if (y < 0 || y >= height || x < 0 || x >= width) return;
    if (visited[y][x] || binary[y][x] === 0) return;
    
    visited[y][x] = true;
    component.pixels.push([y, x]);
    
    dfs(y + 1, x, component);
    dfs(y - 1, x, component);
    dfs(y, x + 1, component);
    dfs(y, x - 1, component);
  };
  
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      if (binary[y][x] === 1 && !visited[y][x]) {
        const component = { pixels: [] };
        dfs(y, x, component);
        
        if (component.pixels.length > 4) {
          // محاسبه bounding box
          const xs = component.pixels.map(p => p[1]);
          const ys = component.pixels.map(p => p[0]);
          const minX = Math.min(...xs);
          const maxX = Math.max(...xs);
          const minY = Math.min(...ys);
          const maxY = Math.max(...ys);
          
          const width_bbox = maxX - minX + 1;
          const height_bbox = maxY - minY + 1;
          const fillRatio = component.pixels.length / (width_bbox * height_bbox);
          
          if (fillRatio > 0.6) {
            structures.push({
              type: fillRatio > 0.8 ? 'foundation' : 'wall',
              bounds: [minX, minY, maxX, maxY],
              confidence: Math.min(0.95, fillRatio * 0.9 + 0.1),
              pixelArea: component.pixels.length
            });
          }
        }
      }
    }
  }
  
  return structures;
};