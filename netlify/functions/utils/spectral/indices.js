// محاسبه شاخص‌های طیفی از داده‌های Sentinel-2
exports.calculateNDVI = (nir, red) => {
  const ndvi = [];
  for (let i = 0; i < nir.length; i++) {
    ndvi[i] = [];
    for (let j = 0; j < nir[i].length; j++) {
      const sum = nir[i][j] + red[i][j];
      ndvi[i][j] = sum === 0 ? 0 : (nir[i][j] - red[i][j]) / sum;
    }
  }
  return ndvi;
};

exports.calculateIronOxide = (red, blue) => {
  const iron = [];
  for (let i = 0; i < red.length; i++) {
    iron[i] = [];
    for (let j = 0; j < red[i].length; j++) {
      iron[i][j] = red[i][j] / (blue[i][j] + 0.01);
    }
  }
  return iron;
};

exports.calculateClayIndex = (swir1, swir2, nir) => {
  const clay = [];
  for (let i = 0; i < swir1.length; i++) {
    clay[i] = [];
    for (let j = 0; j < swir1[i].length; j++) {
      clay[i][j] = (swir1[i][j] * swir2[i][j]) / (nir[i][j] + 0.01);
    }
  }
  return clay;
};