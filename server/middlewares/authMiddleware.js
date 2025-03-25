const jwt = require('jsonwebtoken');
const User = require('../models/userSchema');
const { getMaxListeners } = require('../models/adminSchema');

const requireAuth = (req, res, next) => {
    const { jwt: token } = req.cookies;
    // check json web token exists & is verified
    if (token) {
        jwt.verify(token, process.env.JWT_SECRET_KEY, (err, decoded) => {
            if (err) {
                console.error('JWT verification error:', err);
                return res.status(401).json({ message: 'Token has expired. Please log in again.' });
                // return next(); // Allow request to continue to 404 handler
            }
            const isValid = decoded ? true : false;

            if (isValid) {
                next();
            } else {
                res.redirect('/user/login');
            }  
        });
    } else {
        console.error('No token provided');
        res.redirect('/user/login');
    }

    console.error('Authentication middleware triggered');
}

const checkUser = (req, res, next) => {
    const { jwt: token } = req.cookies;
    res.locals.user = null;
    if(token){
        jwt.verify(token, process.env.JWT_SECRET_KEY, async(err, decoded) => {
            if (err) {
                console.error('JWT verification error:', err);
                res.locals.user = null; // Ensure user is set to null if token is invalid
                return next(); // Proceed without user data
            }

            const user = await User.findById(decoded.id); // Retrieve user from database

            res.locals.user = user;
            next();
        });
    }else{
        next();
    };
};

const refreshToken = (req, res) => {
    console.log('Received refresh token:', req.cookies.refreshToken); // Log the refresh token for debugging

    const { refreshToken } = req.cookies;
    if (!refreshToken) return res.sendStatus(401);

    jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET, (err, decoded) => {
        if (err) return res.sendStatus(403);
        const newAccessToken = jwt.sign({ id: decoded.id }, process.env.JWT_SECRET_KEY, { expiresIn: '15m' });
        res.json({ accessToken: newAccessToken });
    });
};


// admin middleware for authentication
const adminAuth = async(req, res, next) => {
    try {
        const token = req.cookies.token; // Changed from jwt to token
        res.locals.user = null; 

        if (!token) {
            return res.status(401).json({ message: "Unauthorized: No token provided" });
        }

        // Verify JWT Token with correct secret
        const decoded = jwt.verify(token, process.env.JWT_ADMIN_SECRET); // Changed to JWT_ADMIN_SECRET
        
        // Check if email matches admin email
        if (decoded.email !== "sakshamalways@gmail.com") {
            return res.status(403).json({ message: "Access Denied" });
        }

        req.user = { email: decoded.email }; // Simplified user object
        res.locals.user = { email: decoded.email }; 
        next();
    } catch (err) {
        console.error('JWT verification error:', err);
        return res.status(403).json({ message: "Invalid or expired token" });
    }
};

module.exports = {
    requireAuth,
    checkUser,
    refreshToken,
    adminAuth
};
