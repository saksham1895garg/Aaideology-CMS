require('dotenv').config();
const cookieParser = require('cookie-parser');
const express = require('express');
const methodOverride = require('method-override');
const cors = require('cors');
const expressLayout = require('express-ejs-layouts');
const mongoose = require('mongoose');
const session = require('express-session'); 
const User = require('./server/models/userSchema'); 
const multer = require('multer');
const path = require('path');
const bodyParser = require('body-parser');
const jwt = require('jsonwebtoken'); 
const MongoStore = require('connect-mongo');
const MemoryStore = require('memorystore')(session)
const {requireAuth, checkUser} = require('./server/middlewares/authMiddleware');


const app = express(); 
const port = process.env.PORT || 3000;

mongoose.connect(process.env.DB_PORT, {
  ssl: true,
  tlsAllowInvalidCertificates: true,
  retryWrites: true,
  w: 'majority'
}).then(() => {
        console.log('Database connection established');
    }).catch((err) => {
        console.error('Error connecting to the database:', err.message);
        console.error('Please check your connection string and ensure the database server is running.');
    });




// middlewares
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(methodOverride('X-HTTP-Method-Override'));
app.use(bodyParser.json());
app.use(cookieParser());
app.use(checkUser);
// set engine
app.use(expressLayout); 
app.set('layout', './layouts/main');
app.set('view engine', 'ejs');
// static files
app.use(express.static('public'));
app.use(express.static('uploads')); // for image upload 

// sessions
app.use(session({
    secret: process.env.SESSION_SECRET,
    store: new MemoryStore({
        checkPeriod: 86400000 * 7 // prune expired entries every 24h
      }),
    resave: false, 
    saveUninitialized: true,
    cookie: { secure: false }  // Set secure to false for development environment
})); 


//extra middleware for session
app.set('trust proxy', 1); // trust first proxy


app.use(function(req,res,next){
    if(!req.session){
        return next(new Error('Oh no')) //handle error
    }
    next() //otherwise continue
    });





 
app.use('/',  require("./server/routes/content"));
app.use('/', require("./server/routes/auth")); // Added authentication routes


app.get('*', (req, res) => {
    res.status(404).render('404');
});

app.listen(port, () => {
    console.log(`listening on http://localhost:${port}`);
});
