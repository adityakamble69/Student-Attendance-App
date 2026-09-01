// controllers/notificationController.js
// Phase 8 — Notifications & Broadcasts Controller.

const notificationModel = require('../models/notificationModel');

async function getMyNotifications(req, res, next) {
  try {
    const list = await notificationModel.getForUser({
      role: req.user.role,
      userId: req.user.id,
    });
    res.json({ success: true, data: { notifications: list } });
  } catch (err) {
    next(err);
  }
}

async function markRead(req, res, next) {
  try {
    const id = Number(req.params.id);
    const item = await notificationModel.markAsRead(id);
    if (!item) {
      return res.status(404).json({ success: false, error: 'Notification not found.' });
    }
    res.json({ success: true, data: { notification: item } });
  } catch (err) {
    next(err);
  }
}

async function sendBroadcast(req, res, next) {
  try {
    const { title, message, targetRole } = req.body;
    const item = await notificationModel.createNotification({
      title,
      message,
      targetRole,
      type: 'broadcast',
      senderRole: req.user.role,
    });

    res.status(201).json({
      success: true,
      data: {
        message: 'Broadcast notification sent successfully.',
        notification: item,
      },
    });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  getMyNotifications,
  markRead,
  sendBroadcast,
};
