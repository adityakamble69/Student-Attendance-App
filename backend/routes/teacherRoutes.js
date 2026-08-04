// routes/teacherRoutes.js
// GET /, GET /:id, POST /, PUT /:id, DELETE /:id — all admin-only for Phase 2.
// (Phase 3 may add a scoped GET for teachers viewing their own profile.)

const express = require('express');
const router = express.Router();

const teacherController = require('../controllers/teacherController');
const authMiddleware = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');
const validate = require('../middleware/validate');
const { createTeacherSchema, updateTeacherSchema } = require('../validators/teacherValidators');

router.use(authMiddleware, roleMiddleware(['admin']));

router.get('/', teacherController.list);
router.get('/:id', teacherController.getOne);
router.post('/', validate(createTeacherSchema), teacherController.create);
router.put('/:id', validate(updateTeacherSchema), teacherController.update);
router.delete('/:id', teacherController.remove);

module.exports = router;