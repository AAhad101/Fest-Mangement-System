const jwt = require('jsonwebtoken');

// This function checks if the user is logged in (has a valid token)
exports.protect = (req, res, next) => {
    let token;

    // 1. Check if token exists in headers (Bearer Token)
    if(req.headers.authorization && req.headers.authorization.startsWith('Bearer')){
        token = req.headers.authorization.split(' ')[1];
    }

    if(!token){
        return res.status(401).json({message: "Not authorized, no token"});
    }

    try{
        // 2. Verify token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // 3. Attach user info (id and role) to the request object
        req.user = decoded;

        // 4. Move to the next function
        next();
    }

    catch(error){
        console.log("JWT Error Details:", error.message); // DEBUG LINE
        res.status(401).json({message: "Not authorized, token failed"});
    }
};

// This function checks if the user has a specific role
exports.authorize = (...roles) => {
    return (req, res, next) => {
        if(!roles.includes(req.user.role)){
            return res.status(403).json({message: `Role ${req.user.role} is not authorized to acces this route`});
        }
        next();
    };
};