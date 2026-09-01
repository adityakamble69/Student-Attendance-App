// routes/attendanceRoutes.js
// Phase 3 — Teacher Core: Manual Attendance Marking, Querying, History, and Dashboard stats.

const express = require('express');
const router = express.Router();

const attendanceController = require('../controllers/attendanceController');
const authMiddleware = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');
const validate = require('../middleware/validate');
const { markAttendanceSchema } = require('../validators/attendanceValidators');

router.use(authMiddleware);

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

module.exports = router;
