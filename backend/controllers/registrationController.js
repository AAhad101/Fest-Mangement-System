const Event = require('../models/Event');
const Registration = require('../models/Registration');
const crypto = require('crypto');
const sendTicketEmail = require('../utils/sendEmail');
const User = require('../models/User');

/**
 * Handles event registration for both Normal and Merchandise events.
 * Implements Tier A: Payment Approval Workflow for paid events.
 */
exports.registerForEvent = async (req, res) => {
    try {
        const { eventId, formData, purchasedItems, teamName, paymentProof } = req.body;
        const userId = req.user.id;

        const event = await Event.findById(eventId);
        if (!event) return res.status(404).json({ message: "Event not found" });

        // 1. Validation (Section 9.4/9.5)
        if (new Date() > new Date(event.registrationDeadline)) {
            return res.status(400).json({ message: "Registration deadline has passed" });
        }

        // 2. Prevent double registration (Section 9.2)
        const existingReg = await Registration.findOne({ event: eventId, participant: userId });
        if (existingReg) return res.status(400).json({ message: "Already registered for this event" });

        // Generate a unique Ticket ID
        let ticketID = `TICK-${crypto.randomBytes(4).toString('hex').toUpperCase()}`;
        const totalFee = event.registrationFee || 0;

        // 3. Workflow Logic: Check if Payment Approval is needed (Tier A)
        if (totalFee > 0) {
            // Paid Event Workflow: Status starts as 'Pending'
            if (!paymentProof) {
                return res.status(400).json({ message: "Payment proof is required for paid events." });
            }

            const registration = new Registration({
                event: eventId,
                participant: userId,
                ticketID,
                teamName,
                formData: event.eventType === 'Normal' ? formData : undefined,
                purchasedItems: event.eventType === 'Merchandise' ? purchasedItems : undefined,
                paymentProof, // Image URL or Base64 from frontend
                status: 'Pending',
                eventType: event.eventType
            });

            await registration.save();

            return res.status(201).json({ 
                message: "Registration submitted. Awaiting organizer approval of payment proof.", 
                status: 'Pending' 
            });
        } 
        else {
            // 4. Free Event Workflow: Complete immediately
            
            // Handle Merchandise Stock for Free items
            if (event.eventType === 'Merchandise') {
                for (const item of purchasedItems) {
                    const itemInDB = event.itemDetails.find(dbItem =>
                        dbItem.itemName === item.itemName && dbItem.size === item.size
                    );
                    if (!itemInDB || itemInDB.quantity < (item.quantity || 1)) {
                        return res.status(400).json({ message: `Item ${item.itemName} is out of stock` });
                    }
                    itemInDB.quantity -= (item.quantity || 1);
                }
                await event.save();
            } else {
                // Check capacity for Normal events
                if (event.registrationLimit && event.attendees.length >= event.registrationLimit) {
                    return res.status(400).json({ message: "Event is full" });
                }
            }

            const registration = new Registration({
                event: eventId,
                participant: userId,
                ticketID,
                teamName,
                formData: event.eventType === 'Normal' ? formData : undefined,
                purchasedItems: event.eventType === 'Merchandise' ? purchasedItems : undefined,
                qrCode: `QR-${ticketID}`,
                status: 'Successful',
                eventType: event.eventType
            });

            await registration.save();

            // Update event attendees list
            event.attendees.push({ user: userId, registeredAt: new Date() });
            await event.save();

            // 5. Mandatory email notification for successful free registration
            try {
                const participantUser = await User.findById(userId);
                if (participantUser) {
                    await sendTicketEmail({
                        email: participantUser.email,
                        userName: `${participantUser.firstName} ${participantUser.lastName}`,
                        eventName: event.name,
                        ticketId: ticketID,
                        eventType: event.eventType,
                        qrCode: registration.qrCode
                    });
                }
            } catch (err) {
                console.error("Email Service Error:", err.message);
            }

            return res.status(201).json({ message: "Registered successfully! Ticket sent to email.", registration });
        }
    } catch (error) {
        console.error("Registration Logic Error:", error.message);
        res.status(500).json({ message: "Registration failed", error: error.message });
    }
};

/**
 * Tier A Feature: Organizer Approval for Paid Registrations
 */
exports.approvePayment = async (req, res) => {
    try {
        const { registrationId, action } = req.body; // action: 'Approved' or 'Rejected'
        
        const registration = await Registration.findById(registrationId).populate('event participant');
        if (!registration) return res.status(404).json({ message: "Registration not found" });

        // Security: Ensure only the event organizer can approve
        if (registration.event.organizer.toString() !== req.user.id) {
            return res.status(403).json({ message: "Unauthorized to approve this payment" });
        }

        if (action === 'Approved') {
            const event = await Event.findById(registration.event._id);

            // Handle Merchandise Stock decrement upon approval
            if (event.eventType === 'Merchandise') {
                for (const item of registration.purchasedItems) {
                    const itemInDB = event.itemDetails.find(dbItem =>
                        dbItem.itemName === item.itemName && dbItem.size === item.size
                    );
                    if (itemInDB) itemInDB.quantity -= (item.quantity || 1);
                }
            }

            registration.status = 'Successful';
            registration.qrCode = `QR-${registration.ticketID}`;
            
            event.attendees.push({ user: registration.participant._id, registeredAt: new Date() });
            
            await event.save();
            await registration.save();

            // Send ticket via email after approval
            await sendTicketEmail({
                email: registration.participant.email,
                userName: `${registration.participant.firstName} ${registration.participant.lastName}`,
                eventName: event.name,
                ticketId: registration.ticketID,
                eventType: event.eventType,
                qrCode: registration.qrCode
            });

            res.json({ message: "Registration approved and ticket sent." });
        } 
        else {
            registration.status = 'Rejected';
            await registration.save();
            res.json({ message: "Registration rejected." });
        }
    } catch (error) {
        res.status(500).json({ message: "Approval process failed", error: error.message });
    }
};

exports.markAttendance = async (req, res) => {
    try{
        const {ticketID} = req.body; // Can be scanned or manually typed
        
        // Find registration by ticketID and ensure it was 'Successful' (Paid/Approved)
        const registration = await Registration.findOne({ticketID, status: 'Successful'})
            .populate('participant', 'firstName lastName email')
            .populate('event', 'name organizer');

        if(!registration){
            return res.status(404).json({message: "Invalid or Unapproved Ticket"});
        }

        // Security: Ensure only the organizer of this event is scanning
        if(registration.event.organizer.toString() !== req.user.id){
            return res.status(403).json({message: "Unauthorized: You are not the organizer for this event"});
        }

        if(registration.attended){
            return res.status(400).json({ 
                message: `Already checked in at ${new Date(registration.attendanceTimestamp).toLocaleTimeString()}` 
            });
        }

        registration.attended = true;
        registration.attendanceTimestamp = new Date();
        await registration.save();

        res.json({
            message: `Attendance marked for ${registration.participant.firstName}`,
            participant: `${registration.participant.firstName} ${registration.participant.lastName}`,
            timestamp: registration.attendanceTimestamp
        });
    } 

    catch(error){
        res.status(500).json({message: "Attendance error", error: error.message});
    }
};
