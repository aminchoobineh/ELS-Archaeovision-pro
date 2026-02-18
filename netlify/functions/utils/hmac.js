const crypto = require('crypto');

// ============================================
// ماژول امنیت و رمزنگاری
// توسط تیم امنیت و رمزنگاری
// ============================================

/**
 * ایجاد امضای امن با SECRET_KEY
 * @param {string} systemId - شناسه دستگاه
 * @param {string} activationCode - کد فعال‌سازی
 * @returns {string} امضای HMAC-SHA256
 */
exports.createSecureSignature = (systemId, activationCode) => {
  const secretKey = process.env.SECRET_KEY;
  if (!secretKey) {
    throw new Error('SECRET_KEY not set in environment variables');
  }
  
  const data = `${systemId}|${activationCode}|archaeovision-v3`;
  return crypto
    .createHmac('sha256', secretKey)
    .update(data)
    .digest('hex');
};

/**
 * بررسی امضای امن
 */
exports.verifySignature = (systemId, activationCode, storedSignature) => {
  const expected = exports.createSecureSignature(systemId, activationCode);
  return crypto.timingSafeEqual(
    Buffer.from(expected),
    Buffer.from(storedSignature)
  );
};