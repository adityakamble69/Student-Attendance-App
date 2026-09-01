// routes/reportRoutes.js
// Phase 6 — Reports & CSV Export Routes.

const express = require('express');
const router = express.Router();

const reportController = require('../controllers/reportController');
const authMiddleware = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');

router.use(authMiddleware);

// Class-level reports (Teacher or Admin)
router.get('/class/:classId', roleMiddleware(['teacher', 'admin']), reportController.getClassReport);
router.get('/class/:classId/csv', roleMiddleware(['teacher', 'admin']), reportController.exportClassCsv);

// Institute-level reports (Admin only)
router.get('/institute', roleMiddleware(['admin']), reportController.getInstituteReport);
router.get('/institute/csv', roleMiddleware(['admin']), reportController.exportInstituteCsv);

module.exports = router;
