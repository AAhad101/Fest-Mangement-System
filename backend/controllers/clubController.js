const User = require('../models/User');
const Event = require('../models/Event');

// Clubs / Organizers Listing Page
exports.getAllClubs = async (req, res) => {
    try{
        // List: All organizers (Name, Category, Description)
        const clubs = await User.find({role: 'Organizer'})
            .select('organizerName category description');
        res.status(200).json(clubs);
    } 
    catch(error){
        res.status(500).json({message: "Error fetching clubs", error: error.message});
    }
};

// Organizer Detail Page (Participant View)
exports.getClubDetails = async (req, res) => {
    try{
        const clubId = req.params.id;
        
        // Info: Name, Category, Description, Contact Email
        const club = await User.findById(clubId)
            .select('organizerName category description contactEmail');
        
        if(!club) return res.status(404).json({message: "Club not found"});

        // Events: Upcoming | Past
        const allEvents = await Event.find({organizer: clubId, status: 'Published'});
        
        const now = new Date();
        const upcoming = allEvents.filter(e => new Date(e.startDate) > now);
        const past = allEvents.filter(e => new Date(e.endDate) < now);

        res.status(200).json({club, events: {upcoming, past}});
    } 
    catch(error){
        res.status(500).json({message: "Error fetching club details", error: error.message});
    }
};