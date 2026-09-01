// services/otpService.js
// Phase 5 — Anti-Proxy Smart Attendance: Time-bound Numeric OTP Manager.

// In-memory active OTP sessions: Map<classId, { code, expiresAt, classId, date, teacherId }>
const activeOtpSessions = new Map();

const OTP_TTL_SECONDS = 90; // 90 seconds countdown window

function generateOtp(classId, teacherId, date) {
  // Generate a random 6-digit number string
  const code = Math.floor(100000 + Math.random() * 900000).toString();
  const now = Date.now();
  const expiresAt = now + OTP_TTL_SECONDS * 1000;

  const session = {
    classId: Number(classId),
    teacherId: Number(teacherId),
    date,
    code,
    createdAt: now,
    expiresAt,
    ttlSeconds: OTP_TTL_SECONDS,
  };

  activeOtpSessions.set(Number(classId), session);
  return session;
}

function getActiveOtp(classId) {
  const session = activeOtpSessions.get(Number(classId));
  if (!session) return null;

  if (Date.now() > session.expiresAt) {
    activeOtpSessions.delete(Number(classId));
    return null;
  }

  const remainingSeconds = Math.max(0, Math.round((session.expiresAt - Date.now()) / 1000));
  return { ...session, remainingSeconds };
}

function validateOtp(classId, inputCode) {
  const session = getActiveOtp(classId);
  if (!session) {
    return { valid: false, reason: 'OTP attendance session has expired or is not active.' };
  }

  if (session.code !== inputCode.trim()) {
    return { valid: false, reason: 'Incorrect OTP code.' };
  }

  return { valid: true, session };
}

function closeOtp(classId) {
  activeOtpSessions.delete(Number(classId));
}

module.exports = {
  generateOtp,
  getActiveOtp,
  validateOtp,
  closeOtp,
  OTP_TTL_SECONDS,
};
