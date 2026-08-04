// routes/authRoutes.js
// POST /register, POST /login, POST /refresh, POST /logout

const express = require('express');
const router = express.Router();

const authController = require('../controllers/authController');
const { validate, registerSchema, loginSchema, refreshSchema } = require('../validators/authValidators');
const authMiddleware = require('../middleware/authMiddleware');

router.post('/register', validate(registerSchema), authController.register);
router.post('/login', validate(loginSchema), authController.login);
router.post('/refresh', validate(refreshSchema), authController.refresh);
router.post('/logout', authMiddleware, authController.logout);

module.exports = router;