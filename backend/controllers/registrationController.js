const Event = require('../models/Event');
const Registration = require('../models/Registration');
const crypto = require('crypto');
const sendTicketEmail = require('../utils/sendEmail');

exports.registerForEvent = async (req, res) => {
    try{
        const{eventId, formData, purchasedItems, teamName} = req.body;
        const userId = req.user.id;

        const event = await Event.findById(eventId);
        if(!event) return res.status(404).json({message: "Event not found"});

        // 1. Validation (Section 9.4/9.5)
        if(new Date() > new Date(event.registrationDeadline)){
            return res.status(400).json({message: "Registration dealine has passed"});
        }

        // 2. Prevent double registration (Section 9.2)
        const existingReg = await Registration.findOne({event: eventId, participant: userId});
        if(existingReg) return res.status(400).json({message: "Already registered"});

        let ticketID = `TICK-${crypto.randomBytes(4).toString('hex').toUpperCase()}`;

        // 3. Workflow logic
        if(event.eventType === 'Normal'){
            if(event.registrationLimit && event.attendees.length >= event.registrationLimit){
                return res.status(400).json({message: "Event is full"});
            }
        }
        else{
            // Merchandise workflow
            for(const item of purchasedItems){
                const itemInDB = event.itemDetails.find(dbItem =>
                    dbItem.itemName === item.itemName && dbItem.size === item.size
                );

                if(!itemInDB || itemInDB.stockQuantity < (item.quantity || 1)){
                    return res.status(400).json({
                        message: `Item ${item.itemName} (${item.size}) is out of stock`
                    });
                }

                // Decrement stock for this specific variant
                itemInDB.stockQuantity -= (item.quantity || 1);
            }

            // Save the updated stock back to the Event document
            await event.save();
        }

        // 4. Create registration with unique Ticket ID
        const registration = new Registration({
            event: eventId,
            participant: userId,
            ticketID,
            teamName,
            formData: event.eventType === 'Normal' ? formData : undefined,
            purchasedItems: event.eventType === 'Merchandise' ? purchasedItems : undefined,
            qrCode: `QR-${ticketID}`
        });

        await registration.save();

        // 5. Update event attendees list
        event.attendees.push({user: userId, registeredAt: new Date()});
        await event.save();


        // 6. Mandatory email notification
        try{
            // Fetch the user details to get the email and name
            const User = require('../models/User');
            const participantUser = await User.findById(userId);

            if(participantUser){
                await sendTicketEmail({
                    email: participantUser.email,
                    userName: `${participantUser.firstName} ${participantUser.lastName}`,
                    eventName: event.name,
                    ticketId: ticketID,
                    eventType: event.eventType,
                    qrCode: registration.qrCode // The ID/String to be converted to QR
                });
                console.log("Ticket email sent successfully.");
            }
        } 
        catch(err){
            console.error("Email Service Error:", err.message);
            console.error("Email failed to send, but registration was successful.");
        }


        res.status(201).json({message: "Registered successfully!", registration});
    }

    catch(error){
        res.status(500).json({message: "Registration failed", error: error.message});
    }
};
