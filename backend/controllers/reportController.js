// controllers/reportController.js
// Phase 6 — Dashboards, Reports & Analytics Controller.

const attendanceModel = require('../models/attendanceModel');
const classModel = require('../models/classModel');
const reportService = require('../services/reportService');

async function getClassReport(req, res, next) {
  try {
    const classId = Number(req.params.classId);
    const { fromDate, toDate } = req.query;

    const classRow = await classModel.getById(classId);
    if (!classRow) {
      return res.status(404).json({ success: false, error: 'Class not found.' });
    }

    const records = await attendanceModel.getExportRecordsForClass(classId, { fromDate, toDate });
    res.json({
      success: true,
      data: {
        class: classRow,
        records,
        totalRecords: records.length,
      },
    });
  } catch (err) {
    next(err);
  }
}

async function exportClassCsv(req, res, next) {
  try {
    const classId = Number(req.params.classId);
    const { fromDate, toDate } = req.query;

    const classRow = await classModel.getById(classId);
    if (!classRow) {
      return res.status(404).json({ success: false, error: 'Class not found.' });
    }

    const records = await attendanceModel.getExportRecordsForClass(classId, { fromDate, toDate });
    const csv = reportService.generateClassAttendanceCsv(classRow, records);

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="attendance_class_${classId}.csv"`);
    res.send(csv);
  } catch (err) {
    next(err);
  }
}

async function getInstituteReport(req, res, next) {
  try {
    const summary = await attendanceModel.getInstituteSummaryReport();
    res.json({ success: true, data: { summary } });
  } catch (err) {
    next(err);
  }
}

async function exportInstituteCsv(req, res, next) {
  try {
    const summary = await attendanceModel.getInstituteSummaryReport();
    const csv = reportService.generateInstituteSummaryCsv(summary);

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename="institute_attendance_report.csv"');
    res.send(csv);
  } catch (err) {
    next(err);
  }
}

module.exports = {
  getClassReport,
  exportClassCsv,
  getInstituteReport,
  exportInstituteCsv,
};
