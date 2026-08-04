// utils/tokenUtils.js
// Small wrapper around jsonwebtoken so authController stays focused on flow.

const jwt = require('jsonwebtoken');
const env = require('../config/env');

function signAccessToken({ id, role }) {
  return jwt.sign({ id, role }, env.JWT_ACCESS_SECRET, {
    expiresIn: env.JWT_ACCESS_EXPIRY,
  });
}

function signRefreshToken({ id, role }) {
  return jwt.sign({ id, role }, env.JWT_REFRESH_SECRET, {
    expiresIn: env.JWT_REFRESH_EXPIRY,
  });
}

function verifyRefreshToken(token) {
  // Throws if invalid/expired — caller catches it.
  return jwt.verify(token, env.JWT_REFRESH_SECRET);
}

module.exports = { signAccessToken, signRefreshToken, verifyRefreshToken };