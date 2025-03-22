const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcrypt');

const userSchema = new mongoose.Schema({
    resumes: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'UserRes' 
    }],
    reviews: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Review' 
    }],

    email: {
        type: String,
        required: [true, "Email is required"],
        unique: true,
        lowercase: true,
        trim: true,
        validate: [validator.isEmail, "Please provide a valid email"]
    },
    username: {
        type: String,
        required: true,
        trim: true
    },

    password: {
        type: String,
        required: [true, "Password is required"],
        minlength: [6, "Password must be at least 6 characters long"],
        maxLenght: [12, "Password must be no more than 12 characters"],
        validate: {
            validator: function(value) {
                // Only run validation if password is modified
                if (!this.isModified('password')) return true;
                return /^(?=.*[A-Z])(?=.*[@#$%^&*!])[A-Za-z\d@#$%^&*!]{6,}$/.test(value);
            },
            message: "Password must be at least 6 characters long, contain at least one uppercase letter, and one special character (@, #, $, etc.)"
        }
    }
});

userSchema.pre('save', async function(next) {
    // Only hash password if it's modified
    if (!this.isModified('password')) return next();
    
    try {
        const salt = await bcrypt.genSalt();
        this.password = await bcrypt.hash(this.password, salt);
        next();
    } catch (error) {
        next(error);
    }
});

const User = new mongoose.model('User', userSchema); 
module.exports = User;
