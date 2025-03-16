const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const reviewSchema = new Schema({
    // name: {

    //     type: String,
    //     required: true
    // }
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    rating: {
        type: Number,
        required: true,
        min: 1,
        max: 5
    },

    comment: { 
        type: String,
        required: true
    },
    date: {
        type: Date,
        default: Date.now
    }
}, {toObject:{getters: true, }, toJSON:{getters: true}});



module.exports = mongoose.model('Review', reviewSchema);
