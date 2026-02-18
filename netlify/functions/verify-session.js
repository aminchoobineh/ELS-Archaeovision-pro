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
    const { systemId } = JSON.parse(event.body);

    if (!systemId) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'systemId الزامی است' })
      };
    }

    const supabase = getSupabase();

    const { data: license, error } = await supabase
      .from('licenses')
      .select('*')
      .eq('system_id', systemId)
      .single();

    if (error || !license) {
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({ status: 'not_activated' })
      };
    }

    const now = new Date();
    const expiresAt = new Date(license.expires_at);
    
    if (now > expiresAt) {
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({ status: 'expired' })
      };
    }

    // بررسی امضا
    const expectedSignature = createSecureSignature(systemId, license.activation_code);
    if (license.secure_signature !== expectedSignature) {
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({ status: 'invalid' })
      };
    }

    const daysLeft = Math.floor((expiresAt - now) / (1000 * 60 * 60 * 24));

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        status: 'active',
        expiresAt: license.expires_at,
        daysLeft,
        activatedAt: license.activated_at
      })
    };

  } catch (error) {
    console.error('Verify error:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: 'خطای داخلی سرور' })
    };
  }
};