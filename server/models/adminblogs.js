const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const blogs = {
    blogHead:{
        type:String,
        required: true
    },
    blogoverview:{
        type: String
    },
    blogImage:{
        type: String,
        required: true
    }
}

module.exports = mongoose.model('Blogs', blogs);