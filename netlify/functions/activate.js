const { generateActivationCode } = require('./utils/algorithm.js');
const { createSecureSignature } = require('./utils/hmac.js');
const { getSupabase } = require('./utils/supabase.js');

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
    const { systemId, activationCode } = JSON.parse(event.body);

    if (!systemId || !activationCode) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'systemId و activationCode الزامی هستند' })
      };
    }

    // بررسی صحت کد فعال‌سازی
    const expectedCode = generateActivationCode(systemId);
    if (activationCode !== expectedCode) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'کد فعال‌سازی نامعتبر است' })
      };
    }

    const supabase = getSupabase();

    // بررسی فعال‌سازی قبلی
    const { data: existing } = await supabase
      .from('licenses')
      .select('*')
      .eq('system_id', systemId)
      .single();

    if (existing) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'این دستگاه قبلاً فعال شده است' })
      };
    }

    // ایجاد امضای امن
    const signature = createSecureSignature(systemId, activationCode);
    
    // محاسبه تاریخ انقضا (۲ سال بعد)
    const expiresAt = new Date();
    expiresAt.setFullYear(expiresAt.getFullYear() + 2);

    // ذخیره در دیتابیس
    const { error: insertError } = await supabase
      .from('licenses')
      .insert([{
        system_id: systemId,
        activation_code: activationCode,
        secure_signature: signature,
        expires_at: expiresAt.toISOString()
      }]);

    if (insertError) {
      console.error('Insert error:', insertError);
      return {
        statusCode: 500,
        headers,
        body: JSON.stringify({ error: 'خطا در ذخیره‌سازی لایسنس' })
      };
    }

    // لاگ موفق
    await supabase
      .from('activation_logs')
      .insert([{
        system_id: systemId,
        ip_address: event.headers['client-ip'] || event.headers['x-forwarded-for'],
        user_agent: event.headers['user-agent'],
        action: 'activate',
        success: true
      }]);

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        success: true,
        expiresAt: expiresAt.toISOString(),
        message: 'فعال‌سازی با موفقیت انجام شد'
      })
    };

  } catch (error) {
    console.error('Activation error:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: 'خطای داخلی سرور' })
    };
  }
};