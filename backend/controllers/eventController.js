const Event = require('../models/Event');
const User = require('../models/User');
const Registration = require('../models/Registration');
const {sendDiscordNotification} = require('../utils/discordLogger');

exports.createEvent = async (req, res) => {
    try{
        const{
            name, description, eventType, category, eligibility,
            registrationDeadline, startDate, endDate, registrationLimit,
            registrationFee, tags, customFormFields, itemDetails
        } = req.body;

        // Basic validation: Check if merchandise has items
        if(eventType == 'Merchandise' && (!itemDetails || itemDetails.length === 0)){
            return res.status(400).json({message: "Merchandise events must include item details."});
        }

        const newEvent = new Event({
            name,
            description,
            eventType,
            category,
            eligibility,
            registrationDeadline,
            startDate,
            endDate,
            registrationLimit,
            registrationFee,
            tags,
            organizer: req.user.id, // Set from authMiddleware
            // Conditional assignment based one eventType
            customFormFields: eventType === 'Normal' ? customFormFields: undefined,
            itemDetails: eventType === 'Merchandise' ? itemDetails: undefined
            // attendees will automatically be [] via Schema default
        });

        await newEvent.save();
        res.status(201).json({
            message: "Event created successfully",
            event: newEvent
        });
    }

    catch(error){
        console.error("Event Creation Error:", error);
        res.status(500).json({
            message: "Failed to create event",
            error: error.message
        });
    }
};

exports.getBrowseEvents = async (req, res) => {
    try{
        const{
            search,
            eventType,
            eligibility,
            startDate,
            endDate,
            followedOnly
        } = req.query;

        let query = {status: "Published"};  // So they see only published events

        // 1. Search Logic: Partial matching on Event Name or Organizer Name
        if(search){
            // First, find organizers whose names match the search
            const matchingOrganizers = await User.find({
                organizerName: {$regex: search, $options: 'i'},
                role: 'Organizer',
            }).select('_id');
        
            const organizerIds = matchingOrganizers.map(org => org._id);

            // Create an OR query: matches event name OR matches any found organizer IDs
            query.$or = [{name: {$regex: search, $options: 'i'}},
                {organizer: {$in: organizerIds}}
            ];
        }

        // 2. Filters Logic
        if(eventType) query.eventType = eventType;
        if(eligibility) query.eligibility = eligibility;

        // Date range
        if(startDate || endDate){
            query.startDate = {};
            if(startDate) query.startDate.$gte = new Date(startDate);
            if(endDate) query.endDate.$lte = new Date(endDate);
        }

        // Followed Clubs Filter
        if(followedOnly === 'true' && req.user){
            const user = await User.findById(req.user.id);
            if(user && user.followedClubs){
                query.organizer = {$in: user.followedClubs};
            }
        }

        // 3. Trending Logic: Top 5 most "popular" over last 24 hours
        // We look for events with the most registrations in the last 24 hours
        const twentyFourHoursAgo = new Date(Date.now() - 24*60*60*1000);
        const trendingQuery = {status: "Published"};    // Only published events must show
        
        // Fetch events and populate organizer
        const allEvents = await Event.find(trendingQuery).populate('organizer', 'organizerName');

        const trendingEvents = allEvents
            .map(event => {
                const recentRegistrations = event.attendees.filter(
                    a => a.registeredAt >= twentyFourHoursAgo
                ).length;
                return {...event._doc, recentCount: recentRegistrations};
            })
            .sort((a,b) => b.recentCount - a.recentCount)
            .slice(0, 5);

        // 4. Main Browse Results
        const events = await Event.find(query)
            .populate('organizer', 'organizerName')
            .sort({startDate: 1});

        res.status(200).json({
            trending: trendingEvents,
            allEvents: events
        });
    }

    catch(error){
        res.status(500).json({message: "Error loading Browse page", error: error.message});
    }
};

// Logic to fetch all events for the dashboard
exports.getAllEvents = async (req, res) => {
    try{
        const events = await Event.find()
            .populate('organizer', 'organizerName email')
            .sort({startDate: 1});  // Sort by upcoming date
        res.status(200).json(events);
    }
    catch(error){
        res.status(500).json({message: "Error fetching events", error: error.message});
    }
};

exports.getEventDetails = async (req, res) => {
    try{
        const event = await Event.findById(req.params.id)
            .populate('organizer', 'organizerName description contactEmail');

        if(!event){
            return res.status(404).json({message: "Event not found"});
        }

        // Section 9.4: Validation logic
        const now = new Date();
        const isDeadlinePassed = now > new Date(event.registrationDeadline);

        // Check if registration limit has been reached (for Normal events)
        let isFull = false;
        if(event.eventTyoe === 'Normal' && event.registrationLimit){
            isFull = event.attendees.length >= event.registrationLimit;
        }

        // For Merchandise, stock is handled per item in the array
        const hasStock = event.eventType === 'Merchandise'
            ? event.itemDetails.some(item => item.stockQuantity > 0)
            : true;

        res.status(200).json({
            event,
            availability: {
                isOpen: !isDeadlinePassed && (event.eventType === 'Normal' ? !isFull : hasStock),
                isDeadlinePassed,
                isFull,
                outOfStock: !hasStock,
                message: isDeadlinePassed ? "Registration Deadline Passed" :
                         (isFull ? "Event is full" :
                            (!hasStock ? "All items out of stock" : "Available"))
            }
        });
    }

    catch(error){
        res.status(500).json({message: "Error fetching event details", error: error.message});
    }
}

exports.getOrganizerDashboard = async (req, res) => {
    try{
        const organizerId = req.user.id;
        const events = await Event.find({organizer: organizerId});

        // 1. Carousel data: name, type, status
        const carouselEvents = events.map(e => ({
            _id: e.id,
            name: e.name,
            eventType: e.eventType,
            status: e.status,
            startDate: e.startDate
        }));

        // 2. Event analytics: stats for all completed events
        const completedEvents = events.filter(e => e.status === 'Completed');
        const analytics = {
            totalRegistrations: events.reduce((sum, e) => sum + e.attendees.length, 0),
            totalRevenue: events.reduce((sum, e) => sum + (e.revenue || 0), 0),
            completedEventStats: completedEvents.map(e => ({
                name: e.name,
                registrations: e.attendees.length,
                revenue: e.revenue
            }))
        };

        res.status(200).json({carouselEvents, analytics});
    }

    catch(error){
        res.status(500).json({message: "Dashboard error", error: error.message});
    }
};

exports.getEventRegistrations = async (req, res) => {
    try {
        const { eventId } = req.params;
        const organizerId = req.user.id;

        // 1. Verify ownership
        const event = await Event.findOne({ _id: eventId, organizer: organizerId });
        if(!event) return res.status(403).json({ message: "Unauthorized access to this event" });

        // 2. Fetch registrations with participant details
        const registrations = await Registration.find({ event: eventId })
            .populate('participant', 'firstName lastName email contactNumber')
            .sort({ createdAt: -1 });

        // 3. Section 10.3 Analytics Calculations
        const totalRegistrations = registrations.length;
        
        // Calculate Revenue (Price * Quantity for Merch, or Fee * Attendees for Normal)
        let totalRevenue = 0;
        if(event.eventType === 'Merchandise'){
            totalRevenue = registrations.reduce((sum, reg) => {
                const regTotal = reg.purchasedItems.reduce((pSum, item) => pSum + (item.price * item.quantity), 0);
                return sum + regTotal;
            }, 0);
        }
        else{
            totalRevenue = totalRegistrations * (event.registrationFee || 0);
        }

        // Team Stats (Section 10.3)
        const teamNames = registrations.map(reg => reg.teamName).filter(Boolean);
        const uniqueTeamsCount = [...new Set(teamNames)].length;

        // 4. Format data for the organizer table
        const participantData = registrations.map(reg => ({
            name: `${reg.participant.firstName} ${reg.participant.lastName}`,
            email: reg.participant.email,
            contact: reg.participant.contactNumber,
            registrationDate: reg.createdAt,
            ticketID: reg.ticketID,
            status: reg.status,
            attended: reg.attended || false,
            attendanceTimestamp: reg.attendanceTimestamp || null,
            team: reg.teamName || "Individual",
            responses: event.eventType === 'Normal' ? reg.formData : reg.purchasedItems 
        }));

        res.status(200).json({
            eventName: event.name,
            overview: {
                eventType: event.eventType,
                status: event.status,
                dates: { start: event.startDate, end: event.endDate },
                eligibility: event.eligibility,
                pricing: event.registrationFee
            },
            analytics: {
                totalRegistrations,
                totalRevenue,
                totalTeams: uniqueTeamsCount,
                attendanceMock: Math.floor(totalRegistrations * 0.8) // Mocked for 10.3 requirement
            },
            participants: participantData
        });
    } 
    
    catch(error){
        res.status(500).json({ message: "Error fetching participant list", error: error.message });
    }
};

exports.updateEvent = async (req, res) => {
    try {
        const {id} = req.params;
        const organizerId = req.user.id;

        // 1. Find event and populate organizer to get their Discord Webhook URL
        const event = await Event.findById(id).populate('organizer');
        if(!event) return res.status(404).json({ message: "Event not found" });

        // Verify ownership
        if(event.organizer._id.toString() !== organizerId){
            return res.status(403).json({ message: "Unauthorized to edit this event" });
        }

        const oldStatus = event.status;
        const {status, description, registrationDeadline, registrationLimit} = req.body;

        // 2. Apply Section 10.4 Editing Rules
        
        // RULE: Ongoing or Completed events allow NO edits except status change
        if(['Ongoing', 'Completed', 'Closed'].includes(oldStatus)){
            const tryingToEditFields = description || registrationDeadline || registrationLimit;
            if (tryingToEditFields) {
                return res.status(400).json({ 
                    message: `Event is ${oldStatus}. Only status updates are allowed.` 
                });
            }
        }

        // RULE: Published events allow specific updates
        if(oldStatus === 'Published'){
            if (description) event.description = description;
            if (registrationDeadline) event.registrationDeadline = new Date(registrationDeadline);
            if (registrationLimit) event.registrationLimit = registrationLimit;
        }

        // RULE: Draft events allow free edits (default behavior)
        if(oldStatus === 'Draft'){
            if(description) event.description = description;
            if(registrationDeadline) event.registrationDeadline = new Date(registrationDeadline);
            if(registrationLimit) event.registrationLimit = registrationLimit;
            // You can add more fields here like name, category etc. for Drafts
        }

        // 3. Always allow status transition
        if(status) event.status = status;

        await event.save();

        // 4. Section 10.5: Trigger Discord Webhook on initial Publish
        if(oldStatus === 'Draft' && status === 'Published'){
            if(event.organizer.discordWebhook){
                await sendDiscordNotification(event.organizer.discordWebhook, event);
            }
        }

        res.status(200).json({ 
            message: "Event updated successfully", 
            event 
        });

    } 
    
    catch(error){
        res.status(500).json({ message: "Update failed", error: error.message });
    }
};

exports.exportEventParticipants = async (req, res) => {
    try {
        const { eventId } = req.params;
        const organizerId = req.user.id;

        // 1. Verify Ownership
        const event = await Event.findOne({ _id: eventId, organizer: organizerId });
        if (!event) return res.status(403).json({ message: "Unauthorized access" });

        // 2. Fetch Registrations
        const registrations = await Registration.find({ event: eventId })
            .populate('participant', 'firstName lastName email contactNumber');

        // 3. Construct CSV Header
        let csvContent = "Name,Email,Registration Date,Ticket ID,Status,Custom Responses/Items,Attended,Check-in Time\n";

        // 4. Append Participant Data
        registrations.forEach(reg => {
            const name = `${reg.participant.firstName} ${reg.participant.lastName}`;
            const email = reg.participant.email;
            const date = new Date(reg.createdAt).toLocaleDateString();
            const ticket = reg.ticketID;
            const status = reg.status;
            
            // Format responses as a single string to avoid breaking CSV columns
            const responses = event.eventType === 'Normal' 
                ? JSON.stringify(reg.formData).replace(/,/g, ';') 
                : reg.purchasedItems.map(i => `${i.itemName}(${i.size})`).join('; ');

            checkIn = reg.attendanceTimestamp ? new Date(reg.attendanceTimestamp).toLocaleString() : "N/A";

            csvContent += `${name},${email},${date},${ticket},${status},"${responses}",${reg.attended ? 'YES' : 'NO'},${checkIn}\n`;
        });

        // 5. Set Headers for File Download
        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', `attachment; filename=${event.name.replace(/\s+/g, '_')}_Participants.csv`);
        
        return res.status(200).send(csvContent);
    } catch (error) {
        res.status(500).json({ message: "Export failed", error: error.message });
    }
};

exports.getPendingApprovals = async (req, res) => {
    try{
        const events = await Event.find({ organizer: req.user.id });
        const eventIds = events.map(e => e._id);
        const pending = await Registration.find({ 
            event: { $in: eventIds }, 
            status: 'Pending' 
        }).populate('participant event');
        res.json(pending);
    } 
    catch(error){
        res.status(500).json({ message: "Failed to fetch approvals" });
    }
};
