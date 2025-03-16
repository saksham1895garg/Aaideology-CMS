const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const userRes = new Schema({
    // name: {
    //     type: String,
    //     required: true
    // },
    // email: {
    //     type: String,
    //     required: true
    // },
    // phone: {
    //     type: String,
    //     required: true
    // },
    // resume: {
    //     type: String,
    //     required: true
    // }

    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    jobId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "adminSchema",
        required: true
    }

})

module.exports = mongoose.model('UserRes', userRes);