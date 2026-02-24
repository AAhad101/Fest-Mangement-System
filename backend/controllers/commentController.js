const Comment = require('../models/Comment');

exports.postComment = async (req, res) => {
    try{
        const {eventId, text, parentId} = req.body;
        const comment = new Comment({
            event: eventId,
            user: req.user.id,
            text,
            parentComment: parentId || null
        });
        await comment.save();
        
        // Populate user info before sending back
        const populatedComment = await comment.populate('user', 'firstName lastName organizerName role');
        res.status(201).json(populatedComment);
    } 

    catch(error){
        res.status(500).json({message: "Failed to post comment"});
    }
};

exports.getEventComments = async (req, res) => {
    try{
        const comments = await Comment.find({event: req.params.eventId})
            .populate('user', 'firstName lastName organizerName role')
            .sort({ createdAt: 1 }); // Oldest first for chronological chat
        res.json(comments);
    } 

    catch(error){
        res.status(500).json({message: "Failed to load comments"});
    }
};
