require('dotenv').config()
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const User = require('./models/User');

const seedAdmin = async () => {
    try{
        await mongoose.connect(process.env.MONGO_URI);

        // Enter the hashed password
        const hashedPassword = $2b$10$PVzGJC250XD2oiA5QZYv/.T5aPWV34lcXXviFKuNwp8zTHRbSMalW

        const admin = new User({
            email: 'admin@felicity.iiit.ac.in',
            password: hashedPassword,
            role: 'Admin'
        });

        await admin.save();
        console.log("Admin created successfully");
        process.exit();
    }
    catch(error){
        console.error("Error:", error);
        process.exit(1);
    }
};

seedAdmin();
