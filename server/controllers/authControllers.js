const path = require('path');
const fs = require('fs');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const User = require('../models/userSchema'); 
const sendPasswordEmail = require('../middlewares/email').default || require('../middlewares/email');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const multer = require('multer');

var profilePicFile = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, path.join(__dirname, '../../profilepic')); // Ensure this path exists
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + '-' + file.originalname);
    }
});
exports.userpic = multer({
    storage: profilePicFile, 
    limits: { fileSize: 1000000 }, // 1MB limit
    fileFilter: function (req, file, cb) { 
        const allowedExtensions = /\.(png|jpe?g|jpg)$/i;
        const allowedMimeTypes = ['image/png', 'image/jpeg', 'image/jpg'];
        if (!allowedExtensions.test(file.originalname) || !allowedMimeTypes.includes(file.mimetype)) {
            return cb(new Error('Only image files are allowed!'), false);
        }
        cb(null, true);
    }
});

// admin login
exports.adminauth = async (req, res) => {
    const locals = {
        title: 'Admin login' 
    }
    res.render('admin/admin-auth', locals);
};

exports.adminAuthPost = async (req, res) => {
    try {
        const { email, password } = req.body;
        console.log('Login attempt:', { email }); // Log login attempt

        if (email !== "sakshamalways@gmail.com") {
            console.log('Access denied: incorrect email');
            return res.status(403).json({ message: "Access Denied" });
        }

        const user = await User.findOne({ email });
        if (!user) {
            console.log('User not found in database');
            return res.status(400).json({ message: "User not found" });
        }

        console.log('Found user, comparing passwords...'); // Log password comparison
        const isMatch = await bcrypt.compare(password, user.password);
        console.log('Password match result:', isMatch); // Log password match result

        if (!isMatch) {
            console.log('Password mismatch');
            return res.status(400).json({ message: "Invalid credentials" });
        }

        const token = jwt.sign({ email }, process.env.JWT_ADMIN_SECRET, { expiresIn: "7d" });
        res.cookie('token', token, { httpOnly: true });
        
        console.log('Login successful, redirecting to admin');
        return res.redirect('/admin');
    } catch (error) {
        console.error('Login error:', error);
        return res.status(500).json({ message: "Server error", error: error.message });
    }
};
exports.adminAuthLogout = async (req, res) => {
    res.clearCookie('token');
    res.clearCookie('refreshToken');
    res.redirect('/admin/login');
};

// user register
exports.userRegister = async(req, res) => {
    let locals = {
        title: 'Registration'
    }
    res.render('user-registeration/user-register', locals);
};

exports.userRegisterPost = async(req, res) => {
    try {
        const { username, email, password } = req.body;
        const profilePicFile = req.file ? req.file.filename : null;

        const existingEmailUser = await User.findOne({ email });
        if (existingEmailUser) {
            return res.status(400).json({ errors: { email: "Email already exists" } });
        }

        const user = await User.create({ username, email, password, profilePicFile });

        try {
            await sendPasswordEmail(email, password);
        } catch (emailError) {
            console.error("Error sending email:", emailError);
        }

        const token = jwt.sign(
            { id: user._id, email: user.email },
            process.env.JWT_SECRET_KEY,
            { expiresIn: '30d' }  // Increased to 30 days
        );

        const refreshToken = jwt.sign(
            { id: user._id, email: user.email },
            process.env.JWT_SECRET_KEY,
            { expiresIn: '60d' }  // 60 days for refresh token
        );

        // Set cookies with extended expiry
        res.cookie("jwt", token, { 
            httpOnly: true,
            maxAge: 30 * 24 * 60 * 60 * 1000 // 30 days
        });
        res.cookie("refreshToken", refreshToken, {
            httpOnly: true,
            maxAge: 60 * 24 * 60 * 60 * 1000 // 60 days
        });

        res.status(201).json({
            success: true,
            user: {
                id: user._id,
                email: user.email,
                username: user.username
            },
            token,
            refreshToken,
            redirectUrl: '/user/login'
        });
    } catch (error) {
        console.error("Error creating user:", error);
        if (error.name === "ValidationError") {
            const errors = {};
            Object.keys(error.errors).forEach(key => {
                errors[key] = error.errors[key].message;
            });
            return res.status(400).json({ errors });
        }
        return res.status(500).json({ error: "Registration failed" });
    }
};

exports.userLoginPost = async(req, res) => {
    const { email, password } = req.body;
    try {
        const user = await User.findOne({ email });
        if(user){
            const passwordMatch = await bcrypt.compare(password, user.password);
            if(passwordMatch){
                const token = jwt.sign({
                    id: user._id,
                    email: user.email
                }, process.env.JWT_SECRET_KEY, {
                    expiresIn: '30d'  // Increased to 30 days
                });

                const refreshToken = jwt.sign({
                    id: user._id,
                    email: user.email
                }, process.env.JWT_SECRET_KEY, {
                    expiresIn: '60d'  // 60 days for refresh token
                });

                // Set cookies with extended expiry
                res.cookie("jwt", token, { 
                    httpOnly: true,
                    maxAge: 30 * 24 * 60 * 60 * 1000 // 30 days
                });
                res.cookie("refreshToken", refreshToken, {
                    httpOnly: true,
                    maxAge: 60 * 24 * 60 * 60 * 1000 // 60 days
                });

                res.status(201).json({
                    user:{
                        id: user._id,
                        email: user.email
                    },
                    token,
                    refreshToken
                });
            } else {
                return res.status(400).json({message: "Incorrect Email and Password", alert: "Please enter correct email and password"})
            }
        } else {
            return res.status(400).json({message: "User not found", alert: "User not found"});
        }
    } catch (error) {
        res.status(500).json({ message: "Login failed", error, alert: "Invalid Creadentials"});
        console.log(error);
    }
};

exports.refreshToken = async(req, res) => {
    const refreshToken = req.cookies.refreshToken;
    
    if (!refreshToken) {
        return res.status(401).json({ message: "No refresh token" });
    }

    try {
        const decoded = jwt.verify(refreshToken, process.env.JWT_SECRET_KEY);
        const newToken = jwt.sign(
            { id: decoded.id, email: decoded.email },
            process.env.JWT_SECRET_KEY,
            { expiresIn: '30d' }
        );

        res.cookie("jwt", newToken, { 
            httpOnly: true,
            maxAge: 30 * 24 * 60 * 60 * 1000
        });

        res.json({ success: true, token: newToken });
    } catch (error) {
        res.status(401).json({ message: "Invalid refresh token" });
    }
};

exports.userLogin = async (req, res) => {
    let locals = {
        title: 'Login'
    }; 
    res.render('user-registeration/user-login', locals);
};

exports.userInfoProfilePost = async (req, res) => {

   
};
exports.userInfoProfileLogout = async (req, res) => {
    res.cookie("jwt", "", {maxAge: 1});
    res.redirect('/user/login');
};
