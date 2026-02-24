const express = require('express');
const router = express.Router();
const{
    createEvent, 
    getAllEvents, 
    getBrowseEvents, 
    getEventDetails,
    getOrganizerDashboard,
    getEventRegistrations,
    updateEvent,
    exportEventParticipants,
    getPendingApprovals
} = require('../controllers/eventController');
const{protect, authorize} = require('../middleware/authMiddleware');

// Public route to view all events
router.get('/', getAllEvents);

// Protected route: Only Organisers can create events
router.post('/create', protect, authorize('Organizer'), createEvent);

// GET /api/events/browse?search=code&eventType=Normal
router.get('/browse', protect, getBrowseEvents);

// Public route to get event details: GET /api/events/:id
router.get('/:id', getEventDetails);

// Organizer dashboard stats
router.get('/organizer/dashboard', protect, authorize('Organizer'), getOrganizerDashboard);

// Specific event's participant list
router.get('/organizer/event/:eventId/participants', protect, authorize('Organizer'), getEventRegistrations);

// PUT /api/events/update/:id
router.put('/update/:id', protect, authorize('Organizer'), updateEvent);

// GET /api/events/organizer/event/:eventId/export
router.get('/organizer/event/:eventId/export', protect, authorize('Organizer'), exportEventParticipants);

// Route for organizer to see their specific pending approvals
router.get('/organizer/approvals', protect, authorize('Organizer'), getPendingApprovals);

module.exports = router;
