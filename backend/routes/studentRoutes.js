// routes/studentRoutes.js
const express = require('express');
const router = express.Router();

const studentController = require('../controllers/studentController');
const authMiddleware = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');
const validate = require('../middleware/validate');
const { createStudentSchema, updateStudentSchema } = require('../validators/studentValidators');

router.use(authMiddleware, roleMiddleware(['admin']));

router.get('/', studentController.list);
router.get('/:id', studentController.getOne);
router.post('/', validate(createStudentSchema), studentController.create);
router.put('/:id', validate(updateStudentSchema), studentController.update);
router.delete('/:id', studentController.remove);

module.exports = router;