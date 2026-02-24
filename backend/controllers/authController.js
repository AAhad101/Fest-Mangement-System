const User = require('../models/User');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

exports.login = async (req, res) => {
    try{
        const {email, password} = req.body;

        // 1. Find user by email
        const user = await User.findOne({email});
        if(!user) return res.status(404).json({message: "User not found"});

        // 2. Check password using bcrypt
        const isMatch = await bcrypt.compare(password, user.password);
        if(!isMatch) return res.status(400).json({message: "Invalid credentials"});

        // 3. Create a JWT token
        const token = jwt.sign(
            {id: user._id, role: user.role},
            process.env.JWT_SECRET,
            {expiresIn: '1d'}
        );

        // 4. Send response
        res.status(200).json({
            token,
            user: {id: user._id, email: user.email, role: user.role}
        });
    }

    catch(error){
        res.status(500).json({message: "Server error", error});
    }
};

exports.registerParticipant = async (req, res) => {
    try{
        const{
            email, password, firstName, lastName,
            participantType, collegeOrgName, contactNumber
        } = req.body;

        // 1. Email Domain Validation for IIIT Students
        if(participantType === 'IIIT'){
            const isIIITEmail = email.endsWith('@students.iiit.ac.in') || email.endsWith('@iiit.ac.in') || email.endsWith('@research.iiit.ac.in');
            if(!isIIITEmail){
                return res.status(400).json({message: "IIIT participants must use a IIIT-issued email ID only."});
            }
        }

        // 2. Check if user already exists
        const existingUser = await User.findOne({email});
        if(existingUser){
            return res.status(400).json({message: "Email is already registered."});
        }

        // 3. Hash the password
        const hashedPassword = await bcrypt.hash(password, 10);

        // 4. Create new participant record
        const newUser = new User({
            email,
            password: hashedPassword,
            role: 'Participant',    // No role switching, blocks malicious "role": "Admin" messages
            firstName,
            lastName,
            participantType,
            collegeOrgName,
            contactNumber
        });

        await newUser.save();
        // 200 is for general success, 201 is specifically for when a new resource is created 
        res.status(201).json({message: "Participant registered successfully!"});
    }

    catch(error){
        res.status(500).json({message: "Server error during registration", error});
    }
};

exports.requestPasswordReset = async (req, res) => {
    try{
        const { newPassword, reason } = req.body;
        const hashedPassword = await bcrypt.hash(newPassword, 10); // Hash immediately

        const user = await User.findById(req.user.id);
        user.passwordResetRequests.push({
            newPasswordHash: hashedPassword,
            reason,
            status: 'Pending'
        });

        await user.save();
        res.status(201).json({message: "Reset request submitted to Admin."});
    } 

    catch(error){
        res.status(500).json({message: "Request failed."});
    }
};

exports.getResetHistory = async (req, res) => {
    try{
        const user = await User.findById(req.user.id).select('passwordResetRequests');
        res.status(200).json(user.passwordResetRequests);
    } 
    catch(error){
        res.status(500).json({message: "Error fetching history", error: error.message});
    }
};
