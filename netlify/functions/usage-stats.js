const { getWeeklyStats } = require('./utils/usage.js');
const { getSupabase } = require('./utils/supabase.js');

exports.handler = async (event) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'GET, OPTIONS'
  };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 204, headers };
  }

  if (event.httpMethod !== 'GET') {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: 'Method not allowed' })
    };
  }

  try {
    const systemId = event.queryStringParameters?.systemId;
    
    if (!systemId) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'systemId required' })
      };
    }

    const supabase = getSupabase();
    
    // آمار امروز
    const today = new Date().toISOString().split('T')[0];
    const { data: todayStats } = await supabase
      .from('usage_stats')
      .select('analysis_count')
      .eq('system_id', systemId)
      .eq('analysis_date', today)
      .single();

    // آمار هفتگی
    const weekly = await getWeeklyStats(systemId);
    
    // تاریخچه تحلیل‌ها
    const { data: history } = await supabase
      .from('analysis_history')
      .select('created_at, coordinates')
      .eq('system_id', systemId)
      .order('created_at', { ascending: false })
      .limit(10);

    const resetDate = new Date();
    resetDate.setHours(24, 0, 0, 0);

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        today: todayStats?.analysis_count || 0,
        remaining: Math.max(0, 2 - (todayStats?.analysis_count || 0)),
        limit: 2,
        resetDate: resetDate.toISOString(),
        weekly: weekly || [],
        history: history || []
      })
    };

  } catch (error) {
    console.error('Usage stats error:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: 'خطای سرور' })
    };
  }
};