// validators/notificationValidators.js
// Phase 8 — Notification Broadcast Schemas.

const { z } = require('zod');

const broadcastNotificationSchema = z.object({
  title: z.string().min(1, 'Title is required').max(150),
  message: z.string().min(1, 'Message is required'),
  targetRole: z.enum(['all', 'teacher', 'student', 'admin']).default('all'),
});

module.exports = {
  broadcastNotificationSchema,
};
