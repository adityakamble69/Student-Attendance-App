// routes/studentRoutes.js
// Phase 2 (Admin CRUD) + Phase 4 (Student Core Self-Service)

const express = require('express');
const router = express.Router();

const studentController = require('../controllers/studentController');
const authMiddleware = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');
const validate = require('../middleware/validate');
const { createStudentSchema, updateStudentSchema } = require('../validators/studentValidators');

router.use(authMiddleware);

// Student Self-Service Routes (Student only)
router.get('/me/timetable', roleMiddleware(['student']), studentController.getMyTimetable);
router.get('/me/stats', roleMiddleware(['student']), studentController.getMyStats);
router.get('/me/history', roleMiddleware(['student']), studentController.getMyHistory);

// Admin Management Routes (Admin only)
router.get('/', roleMiddleware(['admin']), studentController.list);
router.get('/:id', roleMiddleware(['admin', 'student']), studentController.getOne);
router.post('/', roleMiddleware(['admin']), validate(createStudentSchema), studentController.create);
router.put('/:id', roleMiddleware(['admin']), validate(updateStudentSchema), studentController.update);
router.delete('/:id', roleMiddleware(['admin']), studentController.remove);

module.exports = router;