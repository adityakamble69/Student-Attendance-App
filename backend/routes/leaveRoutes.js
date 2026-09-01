// routes/leaveRoutes.js
// Phase 7 — Leave Management Routes.

const express = require('express');
const router = express.Router();

const leaveController = require('../controllers/leaveController');
const authMiddleware = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');
const validate = require('../middleware/validate');
const { applyLeaveSchema, reviewLeaveSchema } = require('../validators/leaveValidators');

router.use(authMiddleware);

// Student endpoints
router.post('/apply', roleMiddleware(['student']), validate(applyLeaveSchema), leaveController.apply);
router.get('/my', roleMiddleware(['student']), leaveController.getMyLeaves);

// Teacher & Admin endpoints
router.get('/', roleMiddleware(['teacher', 'admin']), leaveController.listAll);
router.get('/:id', roleMiddleware(['teacher', 'admin', 'student']), leaveController.getOne);
router.patch('/:id/review', roleMiddleware(['teacher', 'admin']), validate(reviewLeaveSchema), leaveController.review);

module.exports = router;
