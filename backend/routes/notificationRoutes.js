// routes/notificationRoutes.js
// Phase 8 — Notifications & Broadcasts Routes.

const express = require('express');
const router = express.Router();

const notificationController = require('../controllers/notificationController');
const authMiddleware = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');
const validate = require('../middleware/validate');
const { broadcastNotificationSchema } = require('../validators/notificationValidators');

router.use(authMiddleware);

router.get('/my', notificationController.getMyNotifications);
router.patch('/:id/read', notificationController.markRead);
router.post(
  '/broadcast',
  roleMiddleware(['admin']),
  validate(broadcastNotificationSchema),
  notificationController.sendBroadcast
);

module.exports = router;
