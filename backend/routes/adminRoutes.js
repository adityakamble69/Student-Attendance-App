// routes/adminRoutes.js
// GET /dashboard — basic counts for the Admin Home screen (design.md pattern).

const express = require('express');
const router = express.Router();

const adminController = require('../controllers/adminController');
const authMiddleware = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');

router.use(authMiddleware, roleMiddleware(['admin']));

router.get('/dashboard', adminController.dashboard);

module.exports = router;