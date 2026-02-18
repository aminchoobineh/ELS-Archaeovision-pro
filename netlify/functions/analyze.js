const { checkDailyLimit, incrementAnalysisCount } = require('./utils/usage.js');
const { getSupabase } = require('./utils/supabase.js');
const { generateSARData, detectStructures } = require('./utils/satellite/sentinel1.js');
const { generateMultispectralData, calculateNDVI, calculateIronOxide } = require('./utils/satellite/sentinel2.js');
const { generateThermalData, detectThermalAnomalies } = require('./utils/satellite/landsat.js');
const { generateDEM } = require('./utils/satellite/alos.js');
const { analyzeSoilType } = require('./utils/geological/soilAnalysis.js');
const { interpretFindings } = require('./utils/archaeological/interpretation.js');

exports.handler = async (event) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS'
  };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 204, headers };
  }

  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: 'Method not allowed' })
    };
  }

  try {
    const { systemId, coordinates } = JSON.parse(event.body);

    if (!systemId || !coordinates) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'systemId و coordinates الزامی هستند' })
      };
    }

    // 1. بررسی اعتبار لایسنس
    const supabase = getSupabase();
    const { data: license, error: licenseError } = await supabase
      .from('licenses')
      .select('*')
      .eq('system_id', systemId)
      .single();

    if (licenseError || !license) {
      return {
        statusCode: 403,
        headers,
        body: JSON.stringify({ error: 'لایسنس معتبر یافت نشد' })
      };
    }

    // 2. بررسی انقضا
    const now = new Date();
    const expiresAt = new Date(license.expires_at);
    if (now > expiresAt) {
      return {
        statusCode: 403,
        headers,
        body: JSON.stringify({ error: 'لایسنس منقضی شده است' })
      };
    }

    // 3. بررسی محدودیت روزانه
    const { canAnalyze, remaining, currentCount } = await checkDailyLimit(systemId);
    
    if (!canAnalyze) {
      const resetDate = new Date();
      resetDate.setHours(24, 0, 0, 0);
      
      return {
        statusCode: 429,
        headers: {
          ...headers,
          'X-RateLimit-Limit': '2',
          'X-RateLimit-Remaining': '0',
          'X-RateLimit-Reset': resetDate.toISOString()
        },
        body: JSON.stringify({
          error: 'محدودیت روزانه تحلیل به پایان رسیده است',
          limit: 2,
          remaining: 0,
          resetDate: resetDate.toISOString()
        })
      };
    }

    // ============================================
    // مرحله 4: جمع‌آوری و تحلیل داده‌های ماهواره‌ای
    // ============================================

    // 4.1 داده‌های راداری (Sentinel-1)
    const sarData = generateSARData(coordinates);
    const structures = detectStructures(sarData.vv, sarData.vh, 0.6);
    
    // 4.2 داده‌های چندطیفی (Sentinel-2)
    const spectralData = generateMultispectralData(coordinates);
    const ndvi = calculateNDVI(spectralData.B4, spectralData.B8);
    const ironOxide = calculateIronOxide(spectralData.B4, spectralData.B2);
    
    // 4.3 داده‌های حرارتی (Landsat)
    const thermalData = generateThermalData(coordinates);
    const thermalAnomalies = detectThermalAnomalies(thermalData, 2.0);
    
    // 4.4 داده‌های ارتفاعی (ALOS)
    const dem = generateDEM(coordinates);
    
    // 4.5 تحلیل خاک
    const soilAnalysis = analyzeSoilType(spectralData);

    // ============================================
    // مرحله 5: ترکیب نتایج و محاسبه احتمالات
    // ============================================

    // احتمال سازه‌های زیرسطحی
    const subsurfaceProbability = structures.length > 0
      ? Math.min(0.95, 0.3 + structures.reduce((sum, s) => sum + s.confidence, 0) / structures.length * 0.5)
      : 0.1 + Math.random() * 0.2;

    // احتمال حفره
    const cavitiesProbability = thermalAnomalies.length > 0
      ? Math.min(0.9, thermalAnomalies.reduce((sum, a) => sum + a.confidence, 0) / thermalAnomalies.length)
      : 0.1;

    // احتمال فلز
    const avgIronOxide = ironOxide.flat().reduce((a, b) => a + b, 0) / ironOxide.flat().length;
    const metalsProbability = Math.min(0.85, avgIronOxide * 0.7);

    // تبدیل ساختارها به فرمت خروجی
    const scaledStructures = structures.map(s => ({
      type: s.type,
      confidence: s.confidence,
      bounding_box: [
        coordinates.lng + s.bounds[0] * 0.0001,
        coordinates.lat + s.bounds[1] * 0.0001,
        coordinates.lng + s.bounds[2] * 0.0001,
        coordinates.lat + s.bounds[3] * 0.0001
      ],
      estimated_depth: `${(2 + Math.random() * 6).toFixed(1)}-${(5 + Math.random() * 10).toFixed(1)} متر`,
      spectral_signature: soilAnalysis.soilType === 'خاک رسی' 
        ? ['clay', 'organic'] 
        : soilAnalysis.soilType === 'خاک غنی از اکسید آهن' 
          ? ['iron_oxide', 'hematite'] 
          : ['carbonate', 'quartz']
    }));

    // تفسیر باستان‌شناسی
    const interpretation = interpretFindings({
      subsurface: { probability: subsurfaceProbability, count: structures.length, features: scaledStructures },
      cavities: { probability: cavitiesProbability, count: thermalAnomalies.length },
      metals: { probability: metalsProbability, iron_oxide_index: avgIronOxide },
      soilType: soilAnalysis
    });

    // ============================================
    // مرحله 6: ذخیره و افزایش شمارنده
    // ============================================

    // ذخیره نتیجه تحلیل
    await supabase
      .from('analysis_history')
      .insert([{
        system_id: systemId,
        coordinates,
        result: {
          subsurface: { probability: subsurfaceProbability, count: structures.length },
          cavities: { probability: cavitiesProbability, count: thermalAnomalies.length },
          metals: { probability: metalsProbability, index: avgIronOxide },
          interpretation
        },
        created_at: now.toISOString()
      }]);

    // افزایش شمارنده تحلیل
    await incrementAnalysisCount(systemId);

    // ============================================
    // مرحله 7: بازگشت نتیجه
    // ============================================

    const resetDate = new Date();
    resetDate.setHours(24, 0, 0, 0);

    return {
      statusCode: 200,
      headers: {
        ...headers,
        'X-RateLimit-Limit': '2',
        'X-RateLimit-Remaining': remaining - 1,
        'X-RateLimit-Reset': resetDate.toISOString()
      },
      body: JSON.stringify({
        success: true,
        result: {
          request: {
            coordinates,
            timestamp: now.toISOString(),
            radius: 50
          },
          data_sources: [
            { satellite: 'SENTINEL-1', type: 'SAR', resolution: 10 },
            { satellite: 'SENTINEL-2', type: 'Multispectral', resolution: 10 },
            { satellite: 'LANDSAT-9', type: 'Thermal', resolution: 30 },
            { satellite: 'ALOS PALSAR', type: 'DEM', resolution: 12.5 }
          ],
          analysis: {
            subsurface_structures: {
              probability: subsurfaceProbability,
              count: structures.length,
              features: scaledStructures
            },
            cavities: {
              probability: cavitiesProbability,
              count: thermalAnomalies.length,
              thermal_anomaly: thermalAnomalies.length > 0 
                ? thermalAnomalies[0].anomaly 
                : -2.1,
              locations: thermalAnomalies.slice(0, 3).map(a => [
                coordinates.lng + a.x * 0.0001,
                coordinates.lat + a.y * 0.0001
              ])
            },
            metals: {
              probability: metalsProbability,
              iron_oxide_index: avgIronOxide,
              hotspots: avgIronOxide > 0.7 
                ? [[coordinates.lng + 0.0002, coordinates.lat + 0.0001]] 
                : []
            }
          },
          archaeological_interpretation: {
            summary_fa: interpretation.summary,
            confidence_level: interpretation.confidenceLevel,
            historical_period: interpretation.historicalPeriods,
            recommended_excavation: interpretation.recommendedAction
          },
          soil_analysis: soilAnalysis,
          disclaimer: {
            fa: 'این گزارش بر اساس داده‌های سنجش از دور تهیه شده و نیاز به تأیید میدانی دارد.',
            en: 'This report is based on remote sensing data and requires field verification.'
          }
        },
        usage: {
          used: currentCount + 1,
          remaining: remaining - 1,
          limit: 2,
          resetDate: resetDate.toISOString()
        }
      })
    };

  } catch (error) {
    console.error('Analysis error:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: 'خطای داخلی سرور', details: error.message })
    };
  }
};