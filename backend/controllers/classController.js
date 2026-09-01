// controllers/classController.js
// Phase 2 + Phase 3: Classes & Divisions CRUD, Teacher's My Classes / Timetable,
// and Student Roster / Enrollment management.

const classModel = require('../models/classModel');
const enrollmentModel = require('../models/enrollmentModel');

async function list(req, res, next) {
  try {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 20;

    const { rows, total } = await classModel.getAll({ page, limit });
    res.json({ success: true, data: { classes: rows, page, limit, total } });
  } catch (err) {
    next(err);
  }
}

async function getOne(req, res, next) {
  try {
    const classRow = await classModel.getById(req.params.id);
    if (!classRow) {
      return res.status(404).json({ success: false, error: 'Class not found.' });
    }
    res.json({ success: true, data: { class: classRow } });
  } catch (err) {
    next(err);
  }
}

async function create(req, res, next) {
  try {
    const classRow = await classModel.create(req.body);
    res.status(201).json({ success: true, data: { class: classRow } });
  } catch (err) {
    next(err);
  }
}

async function update(req, res, next) {
  try {
    const existing = await classModel.getById(req.params.id);
    if (!existing) {
      return res.status(404).json({ success: false, error: 'Class not found.' });
    }

    const classRow = await classModel.update(req.params.id, req.body);
    res.json({ success: true, data: { class: classRow } });
  } catch (err) {
    next(err);
  }
}

async function remove(req, res, next) {
  try {
    const existing = await classModel.getById(req.params.id);
    if (!existing) {
      return res.status(404).json({ success: false, error: 'Class not found.' });
    }

    await classModel.remove(req.params.id);
    res.json({ success: true, data: { message: 'Class deleted.' } });
  } catch (err) {
    next(err);
  }
}

// Phase 3 additions:

async function getMyClasses(req, res, next) {
  try {
    const teacherId = req.user.id;
    const { day, date } = req.query;

    const classes = await classModel.getByTeacher(teacherId, { day, date });
    res.json({ success: true, data: { classes } });
  } catch (err) {
    next(err);
  }
}

async function getClassStudents(req, res, next) {
  try {
    const classId = Number(req.params.id);
    const classRow = await classModel.getById(classId);
    if (!classRow) {
      return res.status(404).json({ success: false, error: 'Class not found.' });
    }

    if (req.user.role === 'teacher' && classRow.teacher_id !== req.user.id) {
      return res
        .status(403)
        .json({ success: false, error: 'Forbidden: You are not assigned to this class.' });
    }

    const students = await enrollmentModel.getEnrolledStudents(classId);
    res.json({
      success: true,
      data: {
        class: classRow,
        students,
        total: students.length,
      },
    });
  } catch (err) {
    next(err);
  }
}

async function enrollStudents(req, res, next) {
  try {
    const classId = Number(req.params.id);
    const { studentIds } = req.body;

    const classRow = await classModel.getById(classId);
    if (!classRow) {
      return res.status(404).json({ success: false, error: 'Class not found.' });
    }

    const result = await enrollmentModel.enrollStudents(classId, studentIds);
    res.json({ success: true, data: { message: 'Students enrolled successfully.', ...result } });
  } catch (err) {
    next(err);
  }
}

async function enrollBySection(req, res, next) {
  try {
    const classId = Number(req.params.id);
    const { semester, section, department } = req.body;

    const classRow = await classModel.getById(classId);
    if (!classRow) {
      return res.status(404).json({ success: false, error: 'Class not found.' });
    }

    const result = await enrollmentModel.enrollBySection(classId, { semester, section, department });
    res.json({ success: true, data: { message: 'Students enrolled from section.', ...result } });
  } catch (err) {
    next(err);
  }
}

async function unenrollStudent(req, res, next) {
  try {
    const classId = Number(req.params.id);
    const studentId = Number(req.params.studentId);

    await enrollmentModel.unenrollStudent(classId, studentId);
    res.json({ success: true, data: { message: 'Student removed from class.' } });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  list,
  getOne,
  create,
  update,
  remove,
  getMyClasses,
  getClassStudents,
  enrollStudents,
  enrollBySection,
  unenrollStudent,
};