const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcrypt');

const userSchema = new mongoose.Schema({
    resumes: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'UserRes' // Reference to the resumes model
    }],

    email: {
        type: String,
        required: [true, "Email is required"],
        unique: true,
        validate: [validator.isEmail, "Please provide a valid email"]
    },
    username: {
        type: String,
        required: true
    },


    password: {
        type: String,
        required: [true, "Password is required"],
        minlength: [8, "Please provide a valid password"]
    }
});

userSchema.pre('save', async function(next) {
    const salt = await bcrypt.genSalt();
    this.password = await bcrypt.hash(this.password, salt);
    next();
})
const User = new mongoose.model('User', userSchema);
module.exports = User;
