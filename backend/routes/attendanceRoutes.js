// routes/attendanceRoutes.js
// Phase 3 (Manual) + Phase 5 (Smart: QR, OTP, GPS) Attendance Endpoints.

const express = require('express');
const router = express.Router();

const attendanceController = require('../controllers/attendanceController');
const authMiddleware = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');
const validate = require('../middleware/validate');
const {
  markAttendanceSchema,
  startQrSchema,
  scanQrSchema,
  generateOtpSchema,
  submitOtpSchema,
  gpsAttendanceSchema,
} = require('../validators/attendanceValidators');

router.use(authMiddleware);

// Manual & Timetable routes
router.post(
  '/mark-manual',
  roleMiddleware(['teacher', 'admin']),
  validate(markAttendanceSchema),
  attendanceController.markManual
);

router.get(
  '/class/:classId',
  roleMiddleware(['teacher', 'admin']),
  attendanceController.getClassAttendance
);

router.get(
  '/history',
  roleMiddleware(['teacher', 'admin']),
  attendanceController.getHistory
);

router.get(
  '/teacher-summary',
  roleMiddleware(['teacher', 'admin']),
  attendanceController.getTeacherSummary
);

// Phase 5: QR Code Attendance routes
router.post(
  '/qr/start',
  roleMiddleware(['teacher', 'admin']),
  validate(startQrSchema),
  attendanceController.startQrSession
);

router.get(
  '/qr/active/:classId',
  roleMiddleware(['teacher', 'admin']),
  attendanceController.getActiveQrSession
);

router.post(
  '/qr/rotate/:classId',
  roleMiddleware(['teacher', 'admin']),
  attendanceController.rotateQrSession
);

router.post(
  '/qr/scan',
  roleMiddleware(['student']),
  validate(scanQrSchema),
  attendanceController.scanQrAttendance
);

// Phase 5: OTP Attendance routes
router.post(
  '/otp/generate',
  roleMiddleware(['teacher', 'admin']),
  validate(generateOtpSchema),
  attendanceController.generateOtpSession
);

router.get(
  '/otp/active/:classId',
  roleMiddleware(['teacher', 'admin']),
  attendanceController.getActiveOtpSession
);

router.post(
  '/otp/submit',
  roleMiddleware(['student']),
  validate(submitOtpSchema),
  attendanceController.submitOtpAttendance
);

// Phase 5: GPS Geofence Attendance route
router.post(
  '/gps/mark',
  roleMiddleware(['student']),
  validate(gpsAttendanceSchema),
  attendanceController.markGpsAttendance
);

module.exports = router;
