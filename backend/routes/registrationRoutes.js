const express = require('express');
const router = express.Router();
const {registerForEvent} = require('../controllers/registrationController');
const {protect, authorize} = require('../middleware/authMiddleware');

// POST /api/registrations/register
router.post('/register', protect, authorize('Participant'), registerForEvent);

module.exports = router;