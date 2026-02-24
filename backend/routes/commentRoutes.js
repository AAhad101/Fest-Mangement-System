const express = require('express');
const router = express.Router();
const {postComment, getEventComments} = require('../controllers/commentController');
const {protect} = require('../middleware/authMiddleware');

router.get('/:eventId', getEventComments);
router.post('/', protect, postComment);

module.exports = router;
