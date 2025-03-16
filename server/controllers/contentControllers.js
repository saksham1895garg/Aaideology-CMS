const path = require('path');
const fs = require('fs'); 
const multer = require('multer');
const Admin = require('../models/adminSchema');
const UserRes = require('../models/resumes')
const Review = require('../models/review');
const User = require('../models/userSchema');
const mongoose = require('mongoose');

// Storage for company logos
var logoStorage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, path.join(__dirname, '../../public/uploads'));
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + '-' + file.originalname);
    }
});

// Storage for resumes
var resumeStorage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, path.join(__dirname, '../../uploads'));
    },
    filename: (req, file, cb) => { 
        cb(null, Date.now() + '-' + file.originalname);
    }
});

exports.uploadLogo = multer({
    storage: logoStorage, 
    limits: { fileSize: 1000000 * 2 }, // 2MB limit
    fileFilter: function (req, file, cb) {
        const allowedExtensions = /\.(png|jpe?g|gif)$/i;
        const allowedMimeTypes = ['image/png', 'image/jpeg', 'image/gif'];
        if (!allowedExtensions.test(file.originalname) || !allowedMimeTypes.includes(file.mimetype)) {
            return cb(new Error('Only image files are allowed!'), false);
        }
        cb(null, true);
    }
});

exports.uploadResume = multer({ 
    storage: resumeStorage,  
    limits: { fileSize: 1000000 * 2 }, // Limit file size to 1MB
    fileFilter: function (req, file, cb) {
        const allowedExtensions = /\.(pdf|docx?)$/i;
        const allowedMimeTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
        
        if (!allowedExtensions.test(file.originalname) || !allowedMimeTypes.includes(file.mimetype)) {
            return cb(new Error('Only PDF and Word documents are allowed!'));
        }
        cb(null, true);
    }
})

// services
exports.homepage = async (req, res) => {
    
    const locals = { 
        title: 'Aaideology || The Perfect Source',
        user: req.user // Include user object here 
    } 
    
    try {
        let reviews = await Review.find({});
        const admin = await Admin.find({});
        res.render('index', { locals, admin, reviews }); // Ensure locals is passed here
    } catch (error) {
        console.error('Error fetching admin data:', error);
        res.status(500).send('Internal Server Error');
    } 
};   

exports.postReviewHomepage = async(req, res) => {
    try {
        const { rating, name, comment } = req.body;
        
        if (!rating || !name || !comment) {
            return res.status(400).json({ 
                success: false,
                message: 'Please provide all required fields' 
            });
        }  

        const newReview = new Review({
            rating,
            name,
            comment,
            date: new Date()
        });

        await newReview.save();
        res.status(201).json({ 
            success: true,
            message: 'Review submitted successfully' 
        });
    } catch (error) {
        console.error('Error saving review:', error);
        res.status(500).json({ 
            success: false,
            message: 'Error saving review data' 
        });
    } 
}; 

// admin review page
exports.adminUserReview = async(req, res) => {
    const locals = {
        title: 'Admin || Reviews'
    }
    try {
        let reviews = await Review.find({});
        res.render('admin/admin-reviews', { locals, reviews });
    } catch (error) {
        console.error('Error fetching admin data:', error);
        res.status(500).send('Internal Server Error');
    }
};

// admin pages
exports.adminpage = async (req, res) => {
    const locals = {
        title: 'Aaideology || Admin Access'
    }
    res.render('admin/admin-post', locals);  
};

// post content admin page
exports.postadminpage = async (req, res) => {
    console.log('Form submitted:', req.body);
    let newAdmin = new Admin({
        companyname: req.body.companyname,
        companydes: req.body.companydes,
        jobname: req.body.jobname,
        jobdescription: req.body.jobdescription,
        location: req.body.location,
        salary: req.body.salary,
        companylogo: req.file.filename,
        deadline: req.body.deadline,
        posteddate: Date.now(),
        opportunities: req.body.opportunities,
        requirements: req.body.requirements,
        applyprocces: req.body.applyprocces,
        qualifications: req.body.qualifications,
        responsibilities: req.body.responsibilities, 
        duration: req.body.duration,
        postedBy: req.user.userId
    });
   
    console.log('Company Name:', newAdmin.companyname);

    try { 
        await Admin.create(newAdmin);
        res.redirect('/admin');
    } catch (error) { 
        console.error('Error saving admin:', error);
        res.status(500).send('Error saving admin data');
    }
};

// main admin page
exports.mainadminpage = async(req, res) => {
    let locals = {
        title: 'Aaideology || Main Admin'
    }
    try {
        let admin = await Admin.find({});
        res.render('admin/admin-main', { locals, admin });
    } catch (error) {
        console.error('Error fetching main admin data:', error);
        res.status(500).send('Internal Server Error');
    } 
};

exports.admineditpost = async(req, res) => {
    try {
        let admin = await Admin.findOne({ _id: req.params.id })
        let locals = {
            title: 'Aaideology || Admin Edit Post',
        }
        res.render('admin/admin-edit', { locals, admin });
    } catch (error) {
        console.error('Error fetching admin for edit:', error);
        res.status(500).send('Internal Server Error');
    }
};

// edit the existing content admin page
exports.admineditput = async(req, res) => {
    try {
        const updateData = {
            companyname: req.body.companyname,
            companydes: req.body.companydes,
            jobname: req.body.jobname,
            jobdescription: req.body.jobdescription,
            location: req.body.location,
            salary: req.body.salary,
            deadline: req.body.deadline,
            opportunities: req.body.opportunities,
            requirements: req.body.requirements,
            applyprocces: req.body.applyprocces,
            qualifications: req.body.qualifications,
            responsibilities: req.body.responsibilities,
            duration: req.body.duration
        };

        // Only update companylogo if a new file is uploaded
        if (req.file) {
            updateData.companylogo = req.file.filename;
        }

        await Admin.findByIdAndUpdate(req.params.id, updateData); 
        res.redirect("/admin");
    } catch (error) {
        console.error('Error updating admin:', error);  
        res.status(500).send('Error updating admin data');
    }
};

// details page
exports.aaideologydetails = async(req, res) => {
    const locals = {
        title: `Admin Details`
    }

    try {
        const admin = await Admin.findById(req.params.id);
        res.render('details', { locals, admin });
    } catch (error) {
        console.error('Error fetching admin data:', error);
        res.status(500).send('Internal Server Error');
    } 
};

exports.adminpostdelete = async(req, res) => {
    let id = req.params.id;
    try {
        let adminToDelete = await Admin.findById(id);
        if (!adminToDelete) {
            return res.status(404).send('Admin not found');
        }

        await Admin.findByIdAndDelete({ _id: id }); 

        let imagePath = path.join(__dirname, '../../public/uploads/', adminToDelete.companylogo);
        console.log(imagePath);
        
        if (fs.existsSync(imagePath)) {
            fs.unlinkSync(imagePath);
        } else {
            console.log(`File not found: ${imagePath}`);
        }
        
        res.redirect('/admin');
    } catch (error) {
        console.error('Error deleting admin:', error);
        res.status(500).send('Error deleting admin data');
    }
}

// resumes details page
exports.userResumeDetails = async(req, res) => {
    try {
        let userres = await UserRes.find({});
        res.render('resumes-admin', { userres });
    } catch (error) {
        console.error('Error fetching resume data:', error);
        res.status(500).send('Internal Server Error');
    }
};

// resumes post details page
exports.deleteResume = async(req, res) => {
    try {
        const resume = await UserRes.findById(req.params.id);
        if (!resume) {
            return res.status(404).json({ success: false, message: 'Resume not found' });
        }

        const filePath = path.join(__dirname, '../../uploads', resume.resume);
        if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
        }
        await UserRes.findByIdAndDelete(req.params.id);
        res.redirect('/admin/cv');
    } catch (error) {
        console.error('Error deleting resume:', error);
        res.status(500).json({ success: false, message: 'Error deleting resume' });
    }
};

exports.userResumeDetailsPost = async(req, res) => {
    if (!req.file) {
        return res.status(400).json({ 
            success: false,
            message: 'No file uploaded. Please upload a resume.' 
        });
    } 

    try {
        let newUserRes = new UserRes({
            name: req.body.name,
            email: req.body.email,
            phone: req.body.phone,
            resume: req.file.filename
        }); 
        
        const user = locals.user; // Access user from locals

        await UserRes.create(newUserRes);
        user.resumes.push(newUserRes._id); // Add the resume reference
        await user.save(); // Save the user document

        res.redirect('/');
    } catch (error) {
        console.error('Error saving resume:', error);
        res.status(500).send('Error saving resume data');
    }
}; 


// user management system
exports.userInfo = async(req, res) => {

    const locals = {
        title: 'Aaideology || User Info'
    }
    
    try {
         // Use the user ID from the authenticated user

    const user = locals.user; // Use the user object from locals
        console.log('User data:', user); // Log user data for debugging
        const resumes = user && user.resumes ? await UserRes.find({ _id: { $in: user.resumes } }) : []; // Fetch resumes associated with the user


    res.render('user-info/user-page-info', { locals, user, resumes }); // Pass resumes to the view


    } catch (error) {
        console.error('Error fetching user info:', error);
        res.status(500).send('Internal Server Error');
    }
};

exports.userInfoProfile = async(req, res) => {
    const locals = {
        title: 'Aaideology || User Info'
    }
    res.render('admin/user-details', locals);
}

exports.alladminpage = async(req, res) => {
    let locals = {
        title: 'Aaideology || All Admins'
    }
    res.render('admin/alladminpage', locals)
}

exports.aboutpage = async(req, res) => {
    const locals = {
        title: 'Aaideology || About Us'
    };
    res.render('about/about', locals);
}

// contact page
exports.contactpage = async(req, res) => {
    const locals = {
        title: 'Aaideology || Contact Us'
    };
    res.render('contact/contact', locals);
}
