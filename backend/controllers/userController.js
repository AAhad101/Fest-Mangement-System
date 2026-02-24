const User = require('../models/User');
const Registration = require('../models/Registration');
const Event = require('../models/Event');

// Follow/Unfollow an organizer
exports.toggleFollowOrganizer = async (req, res) => {
    try{
        const userId = req.user.id; // The logged-in participant
        const {organizerId} = req.body;

        // 1. Find the organizer to ensure they exist and are actually an Organizer
        const organizer = await User.findOne({_id: organizerId, role: 'Organizer'});
        if(!organizer){
            return res.status(404).json({message: "Organizer not found"});
        }

        const user = await User.findById(userId);

        // 2. Check if already following
        const isFollowing = user.followedClubs.includes(organizerId);

        if(isFollowing){
            // Unfollow: Remove from array
            user.followedClubs = user.followedClubs.filter(
                (id) => id.toString() !== organizerId
            );
            await user.save();
            return res.status(200).json({message: "Unfollowed successfully!", followedClubs: user.followedClubs});
        }
        else{
            // Follow: Add to array
            user.followedClubs.push(organizerId);
            await user.save();
            return res.status(200).json({message: "Followed successfully", followedClubs: user.followedClubs});
        }
    }

    catch(error){
        res.status(500).json({message: "Server error", error: error.message});
    }
};

// Get profile (to see followed clubs) - Section 9.6
exports.getUserProfile = async (req, res) => {
    try{
        const user = await User.findById(req.user.id)
            .select("-password") // To not send the password
            .populate('followedClubs', 'organizerName category');

        res.status(200).json(user);
    }

    catch(error){
        res.status(500).json({message: "Error fetching profile", error: error.message});
    }
};

exports.getMyEvents = async (req, res) => {
    try{
        const userId = req.user.id;

        // 1. Fetch all registrations for this user
        // We populate 'event' to get name, type, and schedule (Section 9.2)
        const registrations = await Registration.find({participant: userId})
            .populate({
                path: 'event',
                select: 'name eventType startDate endDate organizer',
                populate: {path: 'organizer', select: 'organizerName'}
            })
            .sort({createdAt: -1});
        
        const now = new Date();

        // 2. Filter for "Upcoming Events" (Registered and not yet started/ended)
        const upcomingEvents = registrations.filter(reg =>
            reg.status === 'Registered' && new Date(reg.event.startDate) > now
        );

        // 3. Categorize for "Participation History" tabs (Section 9.2)
        const history = {
            normal: registrations.filter(reg => reg.event.eventType === 'Normal'),
            merchandise: registrations.filter(reg => reg.event.eventType === 'Merchandise'),
            completed: registrations.filter(reg => new Date(reg.event.endDate) < now),
            cancelled: registrations.filter(reg => reg.status === 'Cancelled' || reg.status === 'Rejected')
        };

        res.status(200).json({
            upcomingEvents,
            participationHistory: history
        });
    }

    catch(error){
        res.status(500).json({message: "Error fetching dashboard data", error: error.message});
    }
};

// Update participant profile (Section 9.6)
exports.updateProfile = async (req, res) => {
    try{
        const {firstName, lastName, contactNumber, interests} = req.body;

        if (!firstName || !lastName) {
            return res.status(400).json({ message: "First and Last name are required." });
        }

        const updatedUser = await User.findByIdAndUpdate(
            req.user.id,
            {
                $set: {
                    firstName,
                    lastName,
                    contactNumber,
                    interests   // Array of strings
                }
            },
            {new: true, runValidators: true}
        ).select('-password');
    
        res.status(200).json({message: "Profile updated successfully", user: updatedUser});
    }

    catch(error){
        res.status(500).json({message: "Error updating profile", error: error.message});
    }
};

exports.updateOrganizerProfile = async (req, res) => {
    try {
        const { organizerName, category, description, contactEmail, discordWebhook } = req.body;
        
        const updatedUser = await User.findByIdAndUpdate(
            req.user.id,
            { $set: { organizerName, category, description, contactEmail, discordWebhook } },
            { new: true }
        ).select('-password');

        res.status(200).json({ message: "Organizer profile updated", user: updatedUser });
    } catch (error) {
        res.status(500).json({ message: "Update failed", error: error.message });
    }
};
