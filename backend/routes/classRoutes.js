// routes/classRoutes.js
// Phase 2 (Admin CRUD) + Phase 3 (Teacher timetable & Class Student Rosters)

const express = require('express');
const router = express.Router();

const classController = require('../controllers/classController');
const authMiddleware = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');
const validate = require('../middleware/validate');
const { createClassSchema, updateClassSchema } = require('../validators/classValidators');
const {
  enrollStudentsSchema,
  enrollBySectionSchema,
} = require('../validators/attendanceValidators');

router.use(authMiddleware);

// Teacher-accessible endpoints
router.get('/my-classes', roleMiddleware(['teacher', 'admin']), classController.getMyClasses);
router.get('/:id/students', roleMiddleware(['teacher', 'admin']), classController.getClassStudents);

// Admin-only management endpoints
router.get('/', roleMiddleware(['admin']), classController.list);
router.get('/:id', roleMiddleware(['admin', 'teacher']), classController.getOne);
router.post('/', roleMiddleware(['admin']), validate(createClassSchema), classController.create);
router.put('/:id', roleMiddleware(['admin']), validate(updateClassSchema), classController.update);
router.delete('/:id', roleMiddleware(['admin']), classController.remove);

// Enrollment endpoints
router.post(
  '/:id/enroll',
  roleMiddleware(['admin']),
  validate(enrollStudentsSchema),
  classController.enrollStudents
);
router.post(
  '/:id/enroll-section',
  roleMiddleware(['admin']),
  validate(enrollBySectionSchema),
  classController.enrollBySection
);
router.delete(
  '/:id/enroll/:studentId',
  roleMiddleware(['admin']),
  classController.unenrollStudent
);

module.exports = router;