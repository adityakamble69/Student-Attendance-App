// controllers/authController.js
// Phase 1: register / login / refresh / logout.
// Per rules.md: never trust student_id/teacher_id from the body for identity —
// req.user always comes from the verified JWT, never from client input.

const bcrypt = require('bcrypt');
const userModel = require('../models/userModel');
const { signAccessToken, signRefreshToken, verifyRefreshToken } = require('../utils/tokenUtils');

const SALT_ROUNDS = 10;

async function register(req, res, next) {
  try {
    const { role, name, email, password, rollNo, phone, department, semester, section } = req.body;

    const existing = await userModel.findByEmailAndRole(email, role);
    if (existing) {
      return res.status(409).json({ success: false, error: 'An account with this email already exists.' });
    }

    const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);

    const created = await userModel.createUser({
      role,
      name,
      email,
      passwordHash,
      extra: { rollNo, phone, department, semester, section },
    });

    const accessToken = signAccessToken({ id: created.id, role });
    const refreshToken = signRefreshToken({ id: created.id, role });

    return res.status(201).json({
      success: true,
      data: {
        user: { id: created.id, role, name, email },
        accessToken,
        refreshToken,
      },
    });
  } catch (err) {
    next(err);
  }
}

async function login(req, res, next) {
  try {
    const { role, email, password } = req.body;

    const user = await userModel.findByEmailAndRole(email, role);
    // Same generic message whether the email or password was wrong —
    // don't leak which one was incorrect.
    if (!user) {
      return res.status(401).json({ success: false, error: 'Invalid email or password.' });
    }

    const passwordMatches = await bcrypt.compare(password, user.password_hash);
    if (!passwordMatches) {
      return res.status(401).json({ success: false, error: 'Invalid email or password.' });
    }

    const id = userModel.idFor(role, user);
    const accessToken = signAccessToken({ id, role });
    const refreshToken = signRefreshToken({ id, role });

    return res.json({
      success: true,
      data: {
        user: { id, role, name: user.name, email: user.email },
        accessToken,
        refreshToken,
      },
    });
  } catch (err) {
    next(err);
  }
}

async function refresh(req, res, next) {
  try {
    const { refreshToken } = req.body;

    let payload;
    try {
      payload = verifyRefreshToken(refreshToken);
    } catch (err) {
      return res.status(401).json({ success: false, error: 'Invalid or expired refresh token.' });
    }

    // Confirm the user still exists (not deleted since the token was issued).
    const user = await userModel.findByIdAndRole(payload.id, payload.role);
    if (!user) {
      return res.status(401).json({ success: false, error: 'Account no longer exists.' });
    }

    const accessToken = signAccessToken({ id: payload.id, role: payload.role });

    return res.json({ success: true, data: { accessToken } });
  } catch (err) {
    next(err);
  }
}

async function logout(req, res) {
  // Phase 1 MVP: stateless JWTs, so logout is client-side (delete the
  // stored tokens). If a server-side revoke list becomes necessary
  // (e.g. "log out all devices"), add a refresh_tokens table then.
  return res.json({ success: true, data: { message: 'Logged out.' } });
}

module.exports = { register, login, refresh, logout };