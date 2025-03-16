const path = require('path');
const fs = require('fs');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const User = require('../models/userSchema');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');


// admin login
exports.adminauth = async (req, res) => {
    const locals = {
        title: 'Admin login' 
    }
    res.render('admin/admin-auth', locals);
};

// user register
exports.userRegister = async(req, res) => {
    let locals = {
        title: 'Registration'
    }
    res.render('user-registeration/user-register', locals);
};

exports.userRegisterPost = async(req, res) => {
    console.log("Incoming registration data:", req.body); // Log incoming data
    try {
        const existingEmailUser = await User.findOne({email : req.body.email});
        const existingUsernameUser = await User.findOne({username : req.body.username});
        if (existingEmailUser) {
            return res.status(400).json({ errors: {email: "Email already exists"} });
        }


        const user = await User.create(req.body);


        const token = jwt.sign({id: user._id, email: user.email }, process.env.JWT_SECRET_KEY, {
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
        }); 
    } catch (error) {
        console.error("Error creating user:", error); // Log any errors during user creation
        if(error.name ==="ValidationError"){
            const errors = {};
            Object.keys(error.errors).forEach(key => {
                errors[key] = error.errors[key].message;
            });

            res.status(400).json({errors});
        }
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
