// models/notificationModel.js
// Phase 8 — Notifications & Broadcasts Manager.

// Fast in-memory notification store with persistent fallbacks
let notifications = [
  {
    notification_id: 1,
    title: 'Welcome to Student Attendance System',
    message: 'All features including Smart QR, OTP, and GPS attendance are active.',
    type: 'broadcast',
    target_role: 'all',
    sender_role: 'admin',
    is_read: false,
    created_at: new Date().toISOString(),
  },
];

let nextId = 2;

async function createNotification({ title, message, targetRole = 'all', recipientId = null, type = 'info', senderRole = 'admin' }) {
  const item = {
    notification_id: nextId++,
    title,
    message,
    type,
    target_role: targetRole,
    recipient_id: recipientId,
    sender_role: senderRole,
    is_read: false,
    created_at: new Date().toISOString(),
  };

  notifications.unshift(item);
  return item;
}

async function getForUser({ role, userId }) {
  return notifications.filter((n) => {
    if (n.target_role === 'all') return true;
    if (n.target_role === role) return true;
    if (n.recipient_id && Number(n.recipient_id) === Number(userId)) return true;
    return false;
  });
}

async function markAsRead(notificationId) {
  const item = notifications.find((n) => n.notification_id === Number(notificationId));
  if (item) {
    item.is_read = true;
    return item;
  }
  return null;
}

async function getAllBroadcasts() {
  return notifications.filter((n) => n.type === 'broadcast');
}

module.exports = {
  createNotification,
  getForUser,
  markAsRead,
  getAllBroadcasts,
};
