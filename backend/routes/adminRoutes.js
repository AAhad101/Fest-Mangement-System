const express = require('express');
const router = express.Router();
const {
    createOrganizer,
    getAllOrganizers,
    deleteOrganizer,
    getAllEventsAdmin,
    moderateEvent
} = require('../controllers/adminController');
const {protect, authorize} = require('../middleware/authMiddleware');

// Only an Admin who is logged in can access this
router.post('/create-organizer', protect, authorize('Admin'), createOrganizer);
router.get('/organizers', protect, authorize('Admin'), getAllOrganizers);
router.delete('/organizers/:id', protect, authorize('Admin'), deleteOrganizer);
router.get('/events', protect, authorize('Admin'), getAllEventsAdmin);
router.put('/events/:id/moderate', protect, authorize('Admin'), moderateEvent);

module.exports = router;