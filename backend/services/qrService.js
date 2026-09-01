// services/qrService.js
// Phase 5 — Anti-Proxy Smart Attendance: Rotating QR Session Manager.

const crypto = require('crypto');

// In-memory active QR sessions: Map<classId, { token, expiresAt, classId, date, teacherId }>
const activeQrSessions = new Map();

const QR_TTL_SECONDS = 120; // 2 minutes total session validity (refreshed on rotation)
const ROTATION_SECONDS = 15; // QR code updates every 15 seconds

function generateSessionToken(classId, teacherId, date) {
  const raw = `${classId}:${teacherId}:${date}:${Date.now()}:${crypto.randomBytes(16).toString('hex')}`;
  const token = crypto.createHash('sha256').update(raw).digest('hex');

  const now = Date.now();
  const session = {
    classId: Number(classId),
    teacherId: Number(teacherId),
    date,
    token,
    createdAt: now,
    expiresAt: now + QR_TTL_SECONDS * 1000,
    nextRotationAt: now + ROTATION_SECONDS * 1000,
  };

  activeQrSessions.set(Number(classId), session);
  return session;
}

function rotateSessionToken(classId) {
  const current = activeQrSessions.get(Number(classId));
  if (!current) return null;

  if (Date.now() > current.expiresAt) {
    activeQrSessions.delete(Number(classId));
    return null;
  }

  const raw = `${classId}:${current.teacherId}:${current.date}:${Date.now()}:${crypto.randomBytes(16).toString('hex')}`;
  current.token = crypto.createHash('sha256').update(raw).digest('hex');
  current.nextRotationAt = Date.now() + ROTATION_SECONDS * 1000;
  activeQrSessions.set(Number(classId), current);

  return current;
}

function getActiveSession(classId) {
  const session = activeQrSessions.get(Number(classId));
  if (!session) return null;

  if (Date.now() > session.expiresAt) {
    activeQrSessions.delete(Number(classId));
    return null;
  }

  return session;
}

function validateQrToken(classId, token) {
  const session = getActiveSession(classId);
  if (!session) {
    return { valid: false, reason: 'QR attendance session has expired or is not active.' };
  }

  if (session.token !== token) {
    return { valid: false, reason: 'Invalid or expired QR token. Please scan the latest QR code.' };
  }

  return { valid: true, session };
}

function closeSession(classId) {
  activeQrSessions.delete(Number(classId));
}

module.exports = {
  generateSessionToken,
  rotateSessionToken,
  getActiveSession,
  validateQrToken,
  closeSession,
  ROTATION_SECONDS,
};
