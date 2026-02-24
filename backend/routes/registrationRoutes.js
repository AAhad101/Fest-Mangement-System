const express = require('express');
const router = express.Router();
const {registerForEvent, approvePayment, markAttendance} = require('../controllers/registrationController');
const {protect, authorize} = require('../middleware/authMiddleware');

// POST /api/registrations/register
router.post('/register', protect, authorize('Participant'), registerForEvent);

router.put('/approve', protect, authorize('Organizer'), approvePayment);

router.put('/attendance', protect, authorize('Organizer'), markAttendance);

module.exports = router;
