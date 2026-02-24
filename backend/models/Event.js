const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema({
    name: {type: String, required: true},
    description: {type: String, required: true},
    
    // Section 7: Event Types
    eventType: {type: String, enum: ['Normal', 'Merchandise'], required: true},

    // Section 8: Core Event Attributes
    category: {type: String, required: true}, // E.g: Technical, Cultural 
    eligibility: {type: String, default: 'All'},
    registrationDeadline: {type: Date, required: true},
    startDate: {type: Date, required: true},
    endDate: {type: Date, required: true},
    registrationLimit: {type: Number},
    registrationFee: {type: Number, default: 0},
    organizer: {type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true}, // Reference to an Organizer
    attendees: [{
        user: {type: mongoose.Schema.Types.ObjectId, ref: 'User'},
        registeredAt: {type: Date, default: Date.now}
    }],
    tags: [String],

    // Additional requirements by event type
    // Normal Events: Custom Form Builder Logic (we will store it as a JSON schema)
    customFormFields: {type: mongoose.Schema.Types.Mixed},

    // Merchandise Events
    itemDetails: [{
        itemName: {type: String},
        size: {type: String}, 
        price: {type: Number},
        stockQuantity: {type: Number},
        purchaseLimit: {type: Number, default: 1}
    }],

    status: {
        type: String,
        enum: ['Draft', 'Published', 'Ongoing', 'Completed', 'Closed'],
        default: 'Draft'    
    },

    // Revenue tracking
    revenue: {type: Number, default: 0}

}, {timestamps: true});

module.exports = mongoose.model('Event', eventSchema);