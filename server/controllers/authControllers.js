const path = require('path');
const fs = require('fs');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const User = require('../models/userSchema');
const sendPasswordEmail = require('../middlewares/email');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');


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
    // console.log("Incoming registration data:", req.body);
    try {
        const { username, email, password } = req.body;

        // Check for existing user
        const existingEmailUser = await User.findOne({ email });
        if (existingEmailUser) {
            return res.status(400).json({ errors: { email: "Email already exists" } });
        }

        // Create new user (password hashing is handled by schema)
        const user = await User.create({ username, email, password });

        await sendPasswordEmail(email, password);

        // Generate JWT token
        const token = jwt.sign(
            { id: user._id, email: user.email },
            process.env.JWT_SECRET_KEY,
            { expiresIn: '1d' }
        );

        // Set cookie and send response
        res.cookie("jwt", token);
        res.status(201).json({
            success: true,
            user: {
                id: user._id,
                email: user.email,
                username: user.username
            },
            token,
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

exports.userLoginPost = async(req, res, next) => {
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
                    expiresIn: '1d'
                });
                res.cookie("jwt", token);


                res.status(201).json({
                    user:{
                        id: user._id,
                        email: user.email,
                        password: user.password
                    },
                    token
                })

            }else{
                return res.status(400).json({message: "Incorrect Email and Password"})
            }
            
        }else{
            return res.status(400).json({message: "User not found"});
        }

    } catch (error) {
        res.status(500).json({ message: "Login failed", error });
        console.log(error);
    }
    next()
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
