// middleware/roleMiddleware.js
// Usage: router.delete('/teachers/:id', authMiddleware, roleMiddleware(['admin']), controller)

function roleMiddleware(allowedRoles = []) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ success: false, error: 'Not authenticated.' });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ success: false, error: 'Forbidden — insufficient role.' });
    }

    next();
  };
}

module.exports = roleMiddleware;
