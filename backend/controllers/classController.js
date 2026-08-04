// controllers/classController.js
// Phase 2 — Admin Core: Classes & Divisions CRUD (also how teachers get
// assigned to subjects — see models/classModel.js header). Admin-only
// (enforced in routes/classRoutes.js via roleMiddleware(['admin'])).

const classModel = require('../models/classModel');

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

module.exports = { list, getOne, create, update, remove };