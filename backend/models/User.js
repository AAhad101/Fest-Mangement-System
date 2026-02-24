const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    email: {type: String, required: true, unique: true},
    password: {type: String, required: true},
    role: {type: String, enum:['Admin', 'Organizer', 'Participant'], required: true},

    // Fields for participants
    firstName: String,
    lastName: String,
    participantType: {type: String, enum: ['IIIT', 'Non-IIIT']},
    collegeOrgName: String,
    contactNumber: String,
    interests: [String],
    // Creates a reference to the clubs' documents using the MongoDB assigned ID
    followedClubs: [{type: mongoose.Schema.Types.ObjectId, ref: 'User'}],  

    // Fields for organizers
    organizerName: String,
    category: String,
    description: String,
    contactEmail: String,   
    discordWebhook: {type: String, default: ""},

    passwordResetRequests: [{
        newPasswordHash: String,
        reason: String,
        status: { type: String, enum: ['Pending', 'Approved', 'Rejected'], default: 'Pending' },
        adminComments: String,
        requestedAt: { type: Date, default: Date.now },
        resolvedAt: Date
    }]

    // Timestamps to maintain createdAt and updatedAt timestamps for each document
    // Can be used to find trending events in the last 24 hours
}, {timestamps: true});

module.exports = mongoose.model('User', userSchema)
