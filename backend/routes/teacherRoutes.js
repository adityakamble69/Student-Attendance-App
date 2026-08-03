// routes/teacherRoutes.js
// Placeholder — endpoints implemented in the phase that owns this domain
// (see phases.md). Wired into server.js now so the route tree is real
// from Phase 0, even before handlers exist.

const express = require('express');
const router = express.Router();

router.get('/ping', (req, res) => {
  res.json({ success: true, data: 'teacherRoutes alive — handlers added in a later phase' });
});

module.exports = router;
