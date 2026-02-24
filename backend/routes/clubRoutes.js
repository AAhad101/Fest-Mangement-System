const express = require('express');
const router = express.Router();
const {getAllClubs, getClubDetails} = require('../controllers/clubController');
const {protect} = require('../middleware/authMiddleware');

router.get('/', protect, getAllClubs);
router.get('/:id', protect, getClubDetails);

module.exports = router;