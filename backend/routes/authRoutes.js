const express = require('express')
const router = express.Router();
const {login, registerParticipant} = require('../controllers/authController');

// Define the login endpoint
router.post('/login', login);
// Define the registration endpoint
router.post('/register', registerParticipant);

module.exports = router;
