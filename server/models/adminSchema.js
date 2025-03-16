const mongoose = require('mongoose');
const { schema } = require('./userSchema');

const Schema = mongoose.Schema; 

const admin = new Schema({
    companyname: {
        type: String,
        required: true
    },
    companydes: {
        type: String,
        required: true
    },
    companylogo: {
        type: String,
        required: true
    },
    jobname: {
        type: String,
        required: true
    },
    jobdescription: {
        type: String,
        required: true,
        default: ""
    },
    salary: {
        type: String,
        required: true,
        default: "Undefined"
    },
    location: {
        type: String,
        required: true,
        default: "Undefined"
    },
    duration: {
        type: String,
        required: true,
        default: "Undefined"
    },
    responsibilities: { // Corrected spelling
        type: String,
        required: true,
        default: ""
    }, 
    requirements: { // Updated to lowercase
        type: String,
        required: true,
        default: ""
    },
    opportunities: {
        type: String, 
        required: true,
        default: ""
    },
    benefits: {
        type: String,
        required: false,
        default: ""
    },
    applyprocces: {
        type: String,
        required: true,
        default: ""
    },
    posteddate: {
        type: Date,
        required: true,
        default: Date.now()
    },
    postedBy: {
        type: mongoose.Schema.Types.ObjectId, ref: "User"
    },
    deadline: {
        type: Date,
        required: true,
        default: Date.now()
    }
});

module.exports = mongoose.model('adminSchema', admin);
