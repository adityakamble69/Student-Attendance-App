// routes/subjectRoutes.js
// GET /, GET /:id, POST /, PUT /:id, DELETE /:id — all admin-only for Phase 2.

const express = require('express');
const router = express.Router();

const subjectController = require('../controllers/subjectController');
const authMiddleware = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');
const validate = require('../middleware/validate');
const { createSubjectSchema, updateSubjectSchema } = require('../validators/subjectValidators');

router.use(authMiddleware, roleMiddleware(['admin']));

router.get('/', subjectController.list);
router.get('/:id', subjectController.getOne);
router.post('/', validate(createSubjectSchema), subjectController.create);
router.put('/:id', validate(updateSubjectSchema), subjectController.update);
router.delete('/:id', subjectController.remove);

module.exports = router;