// controllers/teacherController.js
// Phase 2 — Admin Core: Teacher CRUD. All routes are admin-only
// (enforced in routes/teacherRoutes.js via roleMiddleware(['admin'])).

const bcrypt = require('bcrypt');
const teacherModel = require('../models/teacherModel');

const SALT_ROUNDS = 10;

async function list(req, res, next) {
  try {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 20;
    const search = req.query.search || '';

    const { rows, total } = await teacherModel.getAll({ page, limit, search });
    res.json({ success: true, data: { teachers: rows, page, limit, total } });
  } catch (err) {
    next(err);
  }
}

async function getOne(req, res, next) {
  try {
    const teacher = await teacherModel.getById(req.params.id);
    if (!teacher) {
      return res.status(404).json({ success: false, error: 'Teacher not found.' });
    }
    res.json({ success: true, data: { teacher } });
  } catch (err) {
    next(err);
  }
}

async function create(req, res, next) {
  try {
    const { name, email, password, department } = req.body;

    const existing = await teacherModel.findByEmail(email);
    if (existing) {
      return res.status(409).json({ success: false, error: 'A teacher with this email already exists.' });
    }

    const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);
    const teacher = await teacherModel.create({ name, email, passwordHash, department });

    res.status(201).json({ success: true, data: { teacher } });
  } catch (err) {
    next(err);
  }
}

async function update(req, res, next) {
  try {
    const existing = await teacherModel.getById(req.params.id);
    if (!existing) {
      return res.status(404).json({ success: false, error: 'Teacher not found.' });
    }

    const { name, email, department, password } = req.body;

    if (email && email !== existing.email) {
      const emailTaken = await teacherModel.findByEmail(email);
      if (emailTaken) {
        return res.status(409).json({ success: false, error: 'Email already in use by another teacher.' });
      }
    }

    const fields = { name, email, department };
    if (password) {
      fields.password_hash = await bcrypt.hash(password, SALT_ROUNDS);
    }

    const teacher = await teacherModel.update(req.params.id, fields);
    res.json({ success: true, data: { teacher } });
  } catch (err) {
    next(err);
  }
}

async function remove(req, res, next) {
  try {
    const existing = await teacherModel.getById(req.params.id);
    if (!existing) {
      return res.status(404).json({ success: false, error: 'Teacher not found.' });
    }

    await teacherModel.remove(req.params.id);
    res.json({ success: true, data: { message: 'Teacher deleted.' } });
  } catch (err) {
    next(err);
  }
}

module.exports = { list, getOne, create, update, remove };