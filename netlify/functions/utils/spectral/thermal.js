// پردازش داده‌های حرارتی Landsat
exports.calculateLST = (band10, band11, emissivity) => {
  // روش Split-Window ساده
  const lst = [];
  for (let i = 0; i < band10.length; i++) {
    lst[i] = [];
    for (let j = 0; j < band10[i].length; j++) {
      const bt10 = band10[i][j];
      const bt11 = band11[i][j];
      const e = emissivity[i][j];
      lst[i][j] = bt10 + 1.8 * (bt10 - bt11) + 48 * (1 - e) - 75 * 0.01;
    }
  }
  return lst;
};

exports.detectThermalAnomalies = (lst, threshold = 2.5) => {
  const flat = lst.flat();
  const mean = flat.reduce((a, b) => a + b, 0) / flat.length;
  const std = Math.sqrt(flat.reduce((a, b) => a + (b - mean) ** 2, 0) / flat.length);
  
  const anomalies = [];
  for (let i = 0; i < lst.length; i++) {
    for (let j = 0; j < lst[i].length; j++) {
      if (lst[i][j] < mean - threshold * std) {
        anomalies.push({ x: j, y: i, anomaly: mean - lst[i][j] });
      }
    }
  }
  return anomalies;
};