// routes/classRoutes.js
// GET /, GET /:id, POST /, PUT /:id, DELETE /:id — all admin-only for Phase 2.
// POST / and PUT /:id are also how a teacher gets assigned to a subject
// (see models/classModel.js header for why there's no separate join table).

const express = require('express');
const router = express.Router();

const classController = require('../controllers/classController');
const authMiddleware = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');
const validate = require('../middleware/validate');
const { createClassSchema, updateClassSchema } = require('../validators/classValidators');

router.use(authMiddleware, roleMiddleware(['admin']));

router.get('/', classController.list);
router.get('/:id', classController.getOne);
router.post('/', validate(createClassSchema), classController.create);
router.put('/:id', validate(updateClassSchema), classController.update);
router.delete('/:id', classController.remove);

module.exports = router;