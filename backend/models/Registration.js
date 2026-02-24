const mongoose = require('mongoose');
const registrationSchema = new mongoose.Schema({
    event: {type: mongoose.Schema.Types.ObjectId, ref: 'Event', required: true},
    participant: {type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true},
    ticketID: {type: String, unique: true, required: true},
    qrCode: {type: String}, // For Merchandise

    // For Normal events: store their custom form responses
    formData: {type: mongoose.Schema.Types.Mixed},

    // For Merchandise events: store what they bought
    purchasedItems: [{
        itemName: String,
        size: String,
        price: Number,
        quantity: {type: Number, default: 1}
    }],

    teamName: {type: String},   // Optional for team-based events

    attended: {type: Boolean, default: false},  // To track attendance for organizer's analytics

    status: {type: String, enum: ['Registered', 'Cancelled', 'Completed'], default: 'Registered'}
}, {timestamps: true});

module.exports = mongoose.model('Registration', registrationSchema);