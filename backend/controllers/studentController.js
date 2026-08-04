// controllers/studentController.js
// Phase 2 — Admin Core: Student CRUD. All routes are admin-only
// (enforced in routes/studentRoutes.js via roleMiddleware(['admin'])).

const bcrypt = require('bcrypt');
const studentModel = require('../models/studentModel');

const SALT_ROUNDS = 10;

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

module.exports = { list, getOne, create, update, remove };