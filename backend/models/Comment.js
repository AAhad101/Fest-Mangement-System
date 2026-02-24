const mongoose = require('mongoose');

const commentSchema = new mongoose.Schema({
    event: {type: mongoose.Schema.Types.ObjectId, ref: 'Event', required: true},
    user: {type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true},
    text: {type: String, required: true},
    // Logic for threaded replies (Organizer replies)
    parentComment: {type: mongoose.Schema.Types.ObjectId, ref: 'Comment', default: null}, 
}, {timestamps: true});

module.exports = mongoose.model('Comment', commentSchema);
