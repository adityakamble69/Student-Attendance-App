// controllers/subjectController.js
// Phase 2 — Admin Core: Subject CRUD. All routes are admin-only
// (enforced in routes/subjectRoutes.js via roleMiddleware(['admin'])).

const subjectModel = require('../models/subjectModel');

async function list(req, res, next) {
  try {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 20;
    const search = req.query.search || '';

    const { rows, total } = await subjectModel.getAll({ page, limit, search });
    res.json({ success: true, data: { subjects: rows, page, limit, total } });
  } catch (err) {
    next(err);
  }
}

async function getOne(req, res, next) {
  try {
    const subject = await subjectModel.getById(req.params.id);
    if (!subject) {
      return res.status(404).json({ success: false, error: 'Subject not found.' });
    }
    res.json({ success: true, data: { subject } });
  } catch (err) {
    next(err);
  }
}

async function create(req, res, next) {
  try {
    const { subjectName, semester, department } = req.body;
    const subject = await subjectModel.create({ subjectName, semester, department });
    res.status(201).json({ success: true, data: { subject } });
  } catch (err) {
    next(err);
  }
}

async function update(req, res, next) {
  try {
    const existing = await subjectModel.getById(req.params.id);
    if (!existing) {
      return res.status(404).json({ success: false, error: 'Subject not found.' });
    }

    const subject = await subjectModel.update(req.params.id, req.body);
    res.json({ success: true, data: { subject } });
  } catch (err) {
    next(err);
  }
}

async function remove(req, res, next) {
  try {
    const existing = await subjectModel.getById(req.params.id);
    if (!existing) {
      return res.status(404).json({ success: false, error: 'Subject not found.' });
    }

    await subjectModel.remove(req.params.id);
    res.json({ success: true, data: { message: 'Subject deleted.' } });
  } catch (err) {
    next(err);
  }
}

module.exports = { list, getOne, create, update, remove };