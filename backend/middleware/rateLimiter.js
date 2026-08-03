// middleware/rateLimiter.js
// Per rules.md §3: rate-limit OTP generation and QR scan endpoints.
// Two named limiters exported — apply per-route in Phase 5.

const rateLimit = require('express-rate-limit');

const otpLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, error: 'Too many OTP requests. Please wait a moment.' },
});

const qrScanLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, error: 'Too many attendance attempts. Please wait a moment.' },
});

module.exports = { otpLimiter, qrScanLimiter };
