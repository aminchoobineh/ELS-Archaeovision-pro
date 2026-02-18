const { generateActivationCode } = require('./utils/algorithm.js');
const { createSecureSignature } = require('./utils/hmac.js');

exports.handler = async (event) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
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

  // بررسی توکن ادمین
  const token = event.headers.authorization?.replace('Bearer ', '');
  if (token !== process.env.ADMIN_TOKEN) {
    return {
      statusCode: 403,
      headers,
      body: JSON.stringify({ error: 'دسترسی غیرمجاز' })
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

    const activationCode = generateActivationCode(systemId);
    const signature = createSecureSignature(systemId, activationCode);

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        success: true,
        systemId,
        activationCode,
        signature: signature.substring(0, 16) + '...',
        generatedAt: new Date().toISOString()
      })
    };

  } catch (error) {
    console.error('Generate code error:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: 'خطای داخلی سرور' })
    };
  }
};