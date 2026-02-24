require('dotenv').config() // Loads the environment variables
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors')

const app = express();
app.use(express.json()); // Allows the server to read JSON data
app.use(cors()); // Allows the React frontend to talk to this server

// Mounting all required routes
const authRoutes = require('./routes/authRoutes');
app.use('/api/auth', authRoutes); // This prefixes all auth routes with /api/auth
const adminRoutes = require('./routes/adminRoutes');
app.use('/api/admin', adminRoutes);
const eventRoutes = require('./routes/eventRoutes');
app.use('/api/events', eventRoutes);
const userRoutes = require('./routes/userRoutes');
app.use('/api/users', userRoutes);
const registrationRoutes = require('./routes/registrationRoutes');
app.use('/api/registrations', registrationRoutes);
const clubRoutes = require('./routes/clubRoutes');
app.use('/api/clubs', clubRoutes);
const commentRoutes = require('./routes/commentRoutes');
app.use('/api/comments', commentRoutes);

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log("MongoDB Connected"))
    .catch(err => console.log("Connection Error:", err));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
