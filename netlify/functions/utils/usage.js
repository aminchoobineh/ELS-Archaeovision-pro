const { getSupabase } = require('./supabase.js');

// ============================================
// ماژول مدیریت محدودیت مصرف
// توسط تیم بک‌اند و مدیریت کاربران
// ============================================

const DAILY_LIMIT = 2;

/**
 * بررسی محدودیت مصرف روزانه
 * @param {string} systemId - شناسه دستگاه
 */
exports.checkDailyLimit = async (systemId) => {
  const supabase = getSupabase();
  const today = new Date().toISOString().split('T')[0];
  
  const { data: usage, error } = await supabase
    .from('usage_stats')
    .select('analysis_count')
    .eq('system_id', systemId)
    .eq('analysis_date', today)
    .single();

  if (error && error.code !== 'PGRST116') {
    console.error('Error checking usage:', error);
    throw error;
  }

  const currentCount = usage?.analysis_count || 0;
  const remaining = Math.max(0, DAILY_LIMIT - currentCount);
  const canAnalyze = currentCount < DAILY_LIMIT;

  return {
    canAnalyze,
    currentCount,
    remaining,
    limit: DAILY_LIMIT,
    date: today
  };
};

/**
 * افزایش شمارنده تحلیل
 */
exports.incrementAnalysisCount = async (systemId) => {
  const supabase = getSupabase();
  const today = new Date().toISOString().split('T')[0];
  
  const { data: existing } = await supabase
    .from('usage_stats')
    .select('id, analysis_count')
    .eq('system_id', systemId)
    .eq('analysis_date', today)
    .single();

  if (existing) {
    const { error } = await supabase
      .from('usage_stats')
      .update({ 
        analysis_count: existing.analysis_count + 1,
        updated_at: new Date().toISOString()
      })
      .eq('id', existing.id);
      
    if (error) throw error;
  } else {
    const { error } = await supabase
      .from('usage_stats')
      .insert([{
        system_id: systemId,
        analysis_date: today,
        analysis_count: 1
      }]);
      
    if (error) throw error;
  }

  return { success: true };
};

/**
 * دریافت آمار مصرف هفتگی
 */
exports.getWeeklyStats = async (systemId) => {
  const supabase = getSupabase();
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
  
  const { data, error } = await supabase
    .from('usage_stats')
    .select('analysis_date, analysis_count')
    .eq('system_id', systemId)
    .gte('analysis_date', sevenDaysAgo.toISOString().split('T')[0])
    .order('analysis_date', { ascending: false });

  if (error) throw error;
  return data || [];
};