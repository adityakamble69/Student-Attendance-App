// controllers/adminController.js
// Phase 2 — Admin Dashboard: basic counts only (charts land in Phase 6).

const teacherModel = require('../models/teacherModel');
const studentModel = require('../models/studentModel');
const subjectModel = require('../models/subjectModel');
const classModel = require('../models/classModel');

async function dashboard(req, res, next) {
  try {
    const [totalTeachers, totalStudents, totalSubjects, totalClasses] = await Promise.all([
      teacherModel.countAll(),
      studentModel.countAll(),
      subjectModel.countAll(),
      classModel.countAll(),
    ]);

    res.json({
      success: true,
      data: { totalTeachers, totalStudents, totalSubjects, totalClasses },
    });
  } catch (err) {
    next(err);
  }
}

module.exports = { dashboard };