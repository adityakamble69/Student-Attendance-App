// controllers/attendanceController.js
// Phase 3 — Teacher Core: Mark manual attendance, query class attendance,
// view session history, and retrieve teacher dashboard metrics.

const attendanceModel = require('../models/attendanceModel');
const classModel = require('../models/classModel');

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

async function markManual(req, res, next) {
  try {
    const { classId, date, records } = req.body;

    // Verify class exists
    const classRow = await classModel.getById(classId);
    if (!classRow) {
      return res.status(404).json({ success: false, error: 'Class not found.' });
    }

    // Role check: if teacher, verify they are assigned to this class
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

module.exports = {
  markManual,
  getClassAttendance,
  getHistory,
  getTeacherSummary,
};
