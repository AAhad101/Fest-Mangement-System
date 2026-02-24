const express = require('express');
const router = express.Router();
const {
    toggleFollowOrganizer,
    getUserProfile, 
    getMyEvents, 
    updateProfile
} = require('../controllers/userController');
const {requestPasswordReset, getResetHistory} = require('../controllers/authController');
const {protect, authorize} = require('../middleware/authMiddleware');

// Participant follows/unfollows a club
router.post('/follow', protect, authorize('Participant'), toggleFollowOrganizer);

// Participant views their own profile
router.get('/profile', protect, authorize('Participant'), getUserProfile);

// GET /api/users/my-events
router.get('/my-events', protect, authorize('Participant'), getMyEvents);

// PUT /api/users/profile
router.put('/profile', protect, authorize('Participant'), updateProfile);

router.post('/request-reset', protect, authorize('Organizer'), requestPasswordReset);
router.get('/reset-history', protect, authorize('Organizer'), getResetHistory);

module.exports = router;
