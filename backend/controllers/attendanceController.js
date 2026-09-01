// controllers/attendanceController.js
// Phase 3 + Phase 5: Manual Attendance, Timetable stats, and Smart Anti-Proxy Methods (QR, OTP, GPS).

const attendanceModel = require('../models/attendanceModel');
const classModel = require('../models/classModel');
const qrService = require('../services/qrService');
const otpService = require('../services/otpService');
const geoService = require('../services/geoService');

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

async function markManual(req, res, next) {
  try {
    const { classId, date, records } = req.body;

    const classRow = await classModel.getById(classId);
    if (!classRow) {
      return res.status(404).json({ success: false, error: 'Class not found.' });
    }

    if (req.user.role === 'teacher' && classRow.teacher_id !== req.user.id) {
      return res
        .status(403)
        .json({ success: false, error: 'Forbidden: You are not assigned to this class.' });
    }

    const result = await attendanceModel.markBatch({
      classId,
      date,
      markedBy: req.user.id,
      method: 'Manual',
      records,
    });

    res.json({
      success: true,
      data: {
        message: 'Attendance recorded successfully.',
        count: result.count,
        date,
        classId,
      },
    });
  } catch (err) {
    next(err);
  }
}

async function getClassAttendance(req, res, next) {
  try {
    const classId = Number(req.params.classId);
    const date = req.query.date || new Date().toISOString().slice(0, 10);

    const classRow = await classModel.getById(classId);
    if (!classRow) {
      return res.status(404).json({ success: false, error: 'Class not found.' });
    }

    if (req.user.role === 'teacher' && classRow.teacher_id !== req.user.id) {
      return res
        .status(403)
        .json({ success: false, error: 'Forbidden: You are not assigned to this class.' });
    }

    const result = await attendanceModel.getByClassAndDate(classId, date);

    res.json({
      success: true,
      data: {
        class: classRow,
        date,
        ...result,
      },
    });
  } catch (err) {
    next(err);
  }
}

async function getHistory(req, res, next) {
  try {
    const classId = Number(req.query.classId);
    if (!classId) {
      return res.status(400).json({ success: false, error: 'classId query parameter is required.' });
    }

    const classRow = await classModel.getById(classId);
    if (!classRow) {
      return res.status(404).json({ success: false, error: 'Class not found.' });
    }

    if (req.user.role === 'teacher' && classRow.teacher_id !== req.user.id) {
      return res
        .status(403)
        .json({ success: false, error: 'Forbidden: You are not assigned to this class.' });
    }

    const { fromDate, toDate, page, limit } = req.query;
    const history = await attendanceModel.getHistoryByClass(classId, {
      fromDate,
      toDate,
      page,
      limit,
    });

    res.json({
      success: true,
      data: {
        class: classRow,
        ...history,
      },
    });
  } catch (err) {
    next(err);
  }
}

async function getTeacherSummary(req, res, next) {
  try {
    const now = new Date();
    const currentDay = DAYS[now.getDay()];
    const day = req.query.day || (currentDay === 'Sun' ? 'Mon' : currentDay);
    const date = req.query.date || now.toISOString().slice(0, 10);

    const summary = await attendanceModel.getTeacherSummary(req.user.id, { day, date });

    res.json({
      success: true,
      data: {
        day,
        date,
        ...summary,
      },
    });
  } catch (err) {
    next(err);
  }
}

// Phase 5: Smart Anti-Proxy Attendance Methods

// 1. QR Code Attendance
async function startQrSession(req, res, next) {
  try {
    const { classId } = req.body;
    const date = req.body.date || new Date().toISOString().slice(0, 10);

    const classRow = await classModel.getById(classId);
    if (!classRow) {
      return res.status(404).json({ success: false, error: 'Class not found.' });
    }

    if (req.user.role === 'teacher' && classRow.teacher_id !== req.user.id) {
      return res.status(403).json({ success: false, error: 'Forbidden: Not assigned to this class.' });
    }

    const session = qrService.generateSessionToken(classId, req.user.id, date);
    res.json({
      success: true,
      data: {
        ...session,
        rotationSeconds: qrService.ROTATION_SECONDS,
      },
    });
  } catch (err) {
    next(err);
  }
}

async function getActiveQrSession(req, res, next) {
  try {
    const classId = Number(req.params.classId);
    const session = qrService.getActiveSession(classId);
    if (!session) {
      return res.json({ success: true, data: { active: false } });
    }
    res.json({
      success: true,
      data: {
        active: true,
        ...session,
        rotationSeconds: qrService.ROTATION_SECONDS,
      },
    });
  } catch (err) {
    next(err);
  }
}

async function rotateQrSession(req, res, next) {
  try {
    const classId = Number(req.params.classId);
    const session = qrService.rotateSessionToken(classId);
    if (!session) {
      return res.status(400).json({ success: false, error: 'Session expired or not active.' });
    }
    res.json({ success: true, data: session });
  } catch (err) {
    next(err);
  }
}

async function scanQrAttendance(req, res, next) {
  try {
    const studentId = req.user.id;
    const { classId, token, lat, lng } = req.body;

    const validation = qrService.validateQrToken(classId, token);
    if (!validation.valid) {
      return res.status(400).json({ success: false, error: validation.reason });
    }

    const date = validation.session.date;

    // Optional GPS geofence check if coordinates are provided
    if (lat !== undefined && lng !== undefined) {
      const geoCheck = geoService.validateLocation(lat, lng);
      if (!geoCheck.isInside) {
        return res.status(403).json({
          success: false,
          error: `Location check failed: You are ${geoCheck.distanceMeters}m away from campus (max allowed is ${geoCheck.allowedRadiusMeters}m).`,
        });
      }
    }

    const alreadyMarked = await attendanceModel.checkIfAlreadyMarked(studentId, classId, date);
    if (alreadyMarked && alreadyMarked.status === 'Present') {
      return res.json({
        success: true,
        data: { message: 'Attendance already marked for today.', status: 'Present', date },
      });
    }

    const result = await attendanceModel.markSingleStudent({
      studentId,
      classId,
      date,
      status: 'Present',
      markedBy: `system(QR)`,
      method: 'QR',
    });

    res.json({
      success: true,
      data: { message: 'Attendance marked successfully via QR scan!', ...result },
    });
  } catch (err) {
    next(err);
  }
}

// 2. OTP Attendance
async function generateOtpSession(req, res, next) {
  try {
    const { classId } = req.body;
    const date = req.body.date || new Date().toISOString().slice(0, 10);

    const classRow = await classModel.getById(classId);
    if (!classRow) {
      return res.status(404).json({ success: false, error: 'Class not found.' });
    }

    if (req.user.role === 'teacher' && classRow.teacher_id !== req.user.id) {
      return res.status(403).json({ success: false, error: 'Forbidden: Not assigned to this class.' });
    }

    const session = otpService.generateOtp(classId, req.user.id, date);
    res.json({ success: true, data: session });
  } catch (err) {
    next(err);
  }
}

async function getActiveOtpSession(req, res, next) {
  try {
    const classId = Number(req.params.classId);
    const session = otpService.getActiveOtp(classId);
    if (!session) {
      return res.json({ success: true, data: { active: false } });
    }
    res.json({ success: true, data: { active: true, ...session } });
  } catch (err) {
    next(err);
  }
}

async function submitOtpAttendance(req, res, next) {
  try {
    const studentId = req.user.id;
    const { classId, code, lat, lng } = req.body;

    const validation = otpService.validateOtp(classId, code);
    if (!validation.valid) {
      return res.status(400).json({ success: false, error: validation.reason });
    }

    const date = validation.session.date;

    if (lat !== undefined && lng !== undefined) {
      const geoCheck = geoService.validateLocation(lat, lng);
      if (!geoCheck.isInside) {
        return res.status(403).json({
          success: false,
          error: `Location check failed: You are ${geoCheck.distanceMeters}m away from campus.`,
        });
      }
    }

    const result = await attendanceModel.markSingleStudent({
      studentId,
      classId,
      date,
      status: 'Present',
      markedBy: `system(OTP)`,
      method: 'OTP',
    });

    res.json({
      success: true,
      data: { message: 'Attendance verified and marked successfully via OTP!', ...result },
    });
  } catch (err) {
    next(err);
  }
}

// 3. GPS Attendance
async function markGpsAttendance(req, res, next) {
  try {
    const studentId = req.user.id;
    const { classId, lat, lng } = req.body;
    const date = new Date().toISOString().slice(0, 10);

    const geoCheck = geoService.validateLocation(lat, lng);
    if (!geoCheck.isInside) {
      return res.status(403).json({
        success: false,
        error: `GPS check failed: You are ${geoCheck.distanceMeters}m from campus center. You must be within ${geoCheck.allowedRadiusMeters}m to mark attendance.`,
      });
    }

    const result = await attendanceModel.markSingleStudent({
      studentId,
      classId,
      date,
      status: 'Present',
      markedBy: `system(GPS)`,
      method: 'GPS',
    });

    res.json({
      success: true,
      data: {
        message: 'GPS location verified! Attendance marked successfully.',
        distanceMeters: geoCheck.distanceMeters,
        ...result,
      },
    });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  markManual,
  getClassAttendance,
  getHistory,
  getTeacherSummary,
  startQrSession,
  getActiveQrSession,
  rotateQrSession,
  scanQrAttendance,
  generateOtpSession,
  getActiveOtpSession,
  submitOtpAttendance,
  markGpsAttendance,
};
