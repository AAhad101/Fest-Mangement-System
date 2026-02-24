const User = require('../models/User');
const bcrypt = require('bcrypt');
const Event = require('../models/Event');
const Registration = require('../models/Registration');

exports.createOrganizer = async (req, res) => {
    try{
        const{organizerName, email, password, category, description, contactEmail} = req.body;

        // 1. Check if email is already taken
        const existingUser = await User.findOne({email});
        if(existingUser) return res.status(400).json({message: "Email already exists"});

        // 2. Hash the password provided by admin
        const hashedPassword = await bcrypt.hash(password, 10);

        // 3. Create the organizer
        const newOrganizer = new User({
            email,  // Login email
            password: hashedPassword,
            role: 'Organizer',
            organizerName,
            category,
            description,
            contactEmail  // Email to be displayed for participants
        });

        await newOrganizer.save();
        res.status(201).json({message: "Organizer account created successfully"});
    }

    catch(error){
        res.status(500).json({message: "Failed to create organizer", error});
    }
};

exports.getAllOrganizers = async (req, res) => {
    try{
        const organizers = await User.find({role: 'Organizer'})
            .select('organizerName email category description contactEmail createdAt');
        res.status(200).json(organizers);
    } 
    catch(error){
        res.status(500).json({message: "Error fetching organizers", error: error.message});
    }
};

exports.deleteOrganizer = async (req, res) => {
    try{
        const organizer = await User.findById(req.params.id);
        if(organizer.role !== 'Organizer') return res.status(400).json({message: "User is not an organizer"});
        
        await User.findByIdAndDelete(req.params.id);
        // Clean up: delete all events by this organizer
        await Event.deleteMany({organizer: req.params.id});
        res.status(200).json({message: "Organizer and their events deleted"});
    }
    catch(error){
        res.status(500).json({message: "Error deleting organizer", error: error.message});
    }
};

exports.getAllEventsAdmin = async (req, res) => {
    try{
        const events = await Event.find()
            .populate('organizer', 'organizerName')
            .sort({createdAt: -1});
        res.status(200).json(events);
    } 
    catch(error){
        res.status(500).json({message: "Error fetching all events", error: error.message});
    }
};

exports.moderateEvent = async (req, res) => {
    try{
        const {status} = req.body; // Admin can force status to 'Closed' or 'Deleted'
        const event = await Event.findByIdAndUpdate(req.params.id, {status}, {new: true});
        res.status(200).json({message: "Event moderated by Admin", event});
    }
    catch(error){
        res.status(500).json({message: "Error moderating event", error: error.message});
    }
};

