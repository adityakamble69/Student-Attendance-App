// controllers/studentController.js
// Phase 2 + Phase 4: Student CRUD & Student Self-Service (Timetable, Stats, History).

const bcrypt = require('bcrypt');
const studentModel = require('../models/studentModel');

const SALT_ROUNDS = 10;
const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

async function list(req, res, next) {
  try {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 20;
    const search = req.query.search || '';

    const { rows, total } = await studentModel.getAll({ page, limit, search });
    res.json({ success: true, data: { students: rows, page, limit, total } });
  } catch (err) {
    next(err);
  }
}

async function getOne(req, res, next) {
  try {
    const student = await studentModel.getById(req.params.id);
    if (!student) {
      return res.status(404).json({ success: false, error: 'Student not found.' });
    }
    res.json({ success: true, data: { student } });
  } catch (err) {
    next(err);
  }
}

async function create(req, res, next) {
  try {
    const { rollNo, name, email, password, phone, department, semester, section } = req.body;

    const existing = await studentModel.findByEmail(email);
    if (existing) {
      return res.status(409).json({ success: false, error: 'A student with this email already exists.' });
    }

    const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);
    const student = await studentModel.create({
      rollNo, name, email, passwordHash, phone, department, semester, section,
    });

    res.status(201).json({ success: true, data: { student } });
  } catch (err) {
    next(err);
  }
}

async function update(req, res, next) {
  try {
    const existing = await studentModel.getById(req.params.id);
    if (!existing) {
      return res.status(404).json({ success: false, error: 'Student not found.' });
    }

    const { rollNo, name, email, password, phone, department, semester, section } = req.body;

    if (email && email !== existing.email) {
      const emailTaken = await studentModel.findByEmail(email);
      if (emailTaken) {
        return res.status(409).json({ success: false, error: 'Email already in use by another student.' });
      }
    }

    const fields = {
      roll_no: rollNo, name, email, phone, department, semester, section,
    };
    if (password) {
      fields.password_hash = await bcrypt.hash(password, SALT_ROUNDS);
    }

    const student = await studentModel.update(req.params.id, fields);
    res.json({ success: true, data: { student } });
  } catch (err) {
    next(err);
  }
}

async function remove(req, res, next) {
  try {
    const existing = await studentModel.getById(req.params.id);
    if (!existing) {
      return res.status(404).json({ success: false, error: 'Student not found.' });
    }

    await studentModel.remove(req.params.id);
    res.json({ success: true, data: { message: 'Student deleted.' } });
  } catch (err) {
    next(err);
  }
}

// Phase 4: Student Self-Service Endpoints

async function getMyTimetable(req, res, next) {
  try {
    const studentId = req.user.id;
    const now = new Date();
    const currentDay = DAYS[now.getDay()];
    const day = req.query.day || (currentDay === 'Sun' ? 'Mon' : currentDay);

    const timetable = await studentModel.getStudentTimetable(studentId, { day });
    res.json({ success: true, data: { timetable, day } });
  } catch (err) {
    next(err);
  }
}

async function getMyStats(req, res, next) {
  try {
    const studentId = req.user.id;
    const stats = await studentModel.getStudentStats(studentId);
    if (!stats) {
      return res.status(404).json({ success: false, error: 'Student profile not found.' });
    }
    res.json({ success: true, data: stats });
  } catch (err) {
    next(err);
  }
}

async function getMyHistory(req, res, next) {
  try {
    const studentId = req.user.id;
    const { subjectId, fromDate, toDate, page, limit } = req.query;

    const history = await studentModel.getStudentHistory(studentId, {
      subjectId,
      fromDate,
      toDate,
      page,
      limit,
    });

    res.json({ success: true, data: history });
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
  getMyTimetable,
  getMyStats,
  getMyHistory,
};