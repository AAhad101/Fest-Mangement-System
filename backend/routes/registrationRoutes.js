const express = require('express');
const router = express.Router();
const {registerForEvent, approvePayment} = require('../controllers/registrationController');
const {protect, authorize} = require('../middleware/authMiddleware');

// POST /api/registrations/register
router.post('/register', protect, authorize('Participant'), registerForEvent);

router.put('/approve', protect, authorize('Organizer'), approvePayment);

module.exports = router;
