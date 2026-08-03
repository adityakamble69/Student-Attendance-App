// routes/authRoutes.js
// Phase 1 will implement: POST /register, POST /login, POST /refresh, POST /logout

const express = require('express');
const router = express.Router();

router.get('/ping', (req, res) => {
  res.json({ success: true, data: 'auth routes wired — implementation starts Phase 1' });
});

module.exports = router;
