// middleware/authMiddleware.js
// Verifies the JWT access token and attaches decoded payload to req.user.
// Per rules.md: never trust student_id/teacher_id from the request body —
// always read identity from req.user (derived from the token) instead.

const jwt = require('jsonwebtoken');
const env = require('../config/env');

function authMiddleware(req, res, next) {
  const header = req.headers.authorization;

  if (!header || !header.startsWith('Bearer ')) {
    return res.status(401).json({ success: false, error: 'Missing or malformed Authorization header.' });
  }

  const token = header.split(' ')[1];

  try {
    const payload = jwt.verify(token, env.JWT_ACCESS_SECRET);
    req.user = payload; // { id, role, iat, exp }
    next();
  } catch (err) {
    return res.status(401).json({ success: false, error: 'Invalid or expired token.' });
  }
}

module.exports = authMiddleware;
