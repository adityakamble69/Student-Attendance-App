// controllers/leaveController.js
// Phase 7 — Leave Management Controller.

const leaveModel = require('../models/leaveModel');

async function apply(req, res, next) {
  try {
    const studentId = req.user.id;
    const { reason, fromDate, toDate } = req.body;

    const leave = await leaveModel.apply({ studentId, reason, fromDate, toDate });
    res.status(201).json({
      success: true,
      data: {
        message: 'Leave application submitted successfully.',
        leave,
      },
    });
  } catch (err) {
    next(err);
  }
}

async function getMyLeaves(req, res, next) {
  try {
    const studentId = req.user.id;
    const leaves = await leaveModel.getByStudent(studentId);
    res.json({ success: true, data: { leaves } });
  } catch (err) {
    next(err);
  }
}

async function listAll(req, res, next) {
  try {
    const { status, page, limit } = req.query;
    const result = await leaveModel.getAll({ status, page, limit });
    res.json({ success: true, data: result });
  } catch (err) {
    next(err);
  }
}

async function getOne(req, res, next) {
  try {
    const leave = await leaveModel.getById(req.params.id);
    if (!leave) {
      return res.status(404).json({ success: false, error: 'Leave request not found.' });
    }
    res.json({ success: true, data: { leave } });
  } catch (err) {
    next(err);
  }
}

async function review(req, res, next) {
  try {
    const leaveId = Number(req.params.id);
    const { status } = req.body;
    const reviewedBy = req.user.id;

    const existing = await leaveModel.getById(leaveId);
    if (!existing) {
      return res.status(404).json({ success: false, error: 'Leave request not found.' });
    }

    const updated = await leaveModel.review({ leaveId, status, reviewedBy });
    res.json({
      success: true,
      data: {
        message: `Leave request ${status.toLowerCase()} successfully.`,
        leave: updated,
      },
    });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  apply,
  getMyLeaves,
  listAll,
  getOne,
  review,
};
