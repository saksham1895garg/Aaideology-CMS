const path = require('path');
const fs = require('fs'); 
const multer = require('multer');
const Admin = require('../models/adminSchema');
const UserRes = require('../models/resumes')
const Review = require('../models/review');
const User = require('../models/userSchema');
const mongoose = require('mongoose');
const { render } = require('ejs');

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
});

// main site page for displaying
exports.getMainPage = async(req, res) => {
    const locals = {
        title: 'Aaideology || The Perfect Source'
    }
    res.render("aaideology", locals);
    
};






// services
exports.homepage = async (req, res) => {
    
    const locals = { 
        title: 'Aaideology || The Perfect Source'
    } 
    
    try {
        const reviews = await Review.find({});
        const admin = await Admin.find({});
        const user = res.locals.user;
        res.render('index', { locals, admin, reviews, user }); // Ensure locals is passed here
    } catch (error) {
        console.error('Error fetching admin data:', error);
        res.status(500).send('Internal Server Error');
    } 
};   

exports.postReviewHomepage = async(req, res) => {
    try {
        let userReview = new Review({
            rating: req.body.rating,
            name: req.body.name,
            comment: req.body.comment,
            rating: req.body.rating,
            userId: res.locals.user._id
        })
        const user = res.locals.user; // Access user from locals
        
        if (!req.body.rating || !req.body.comment) {

            return res.status(400).json({ 
                success: false,
                message: 'Please provide all required fields' 
            });
        } 
        await Review.create(userReview);
        if (user && user.reviews) {
            user.reviews.push(userReview._id); // Add the review reference
            await user.save(); // Save the user document
        } else {
            console.error('User or user.reviews is undefined:', user);
            return res.status(500).json({
                success: false,
                message: 'Error saving review data: User data is incomplete'
            });
        }
        
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

exports.deleteUserReview = async(req, res) => {

    try {
        const review = await Review.findById(req.params.id);
        if (!review) {
            return res.status(404).json({ success: false, message: 'No Reviews Found' });
        }

        // New logic to delete the resume ID from the user's document
        const user = await User.findById(review.userId);
        if (user) {
            user.reviews.pull(review._id); // Remove the resume ID from the user's resumes array
            await user.save(); // Save the updated user document
        }

        await Review.findByIdAndDelete(req.params.id);
        
        res.redirect('/user/profile/');
    } catch (error) {
        console.error('Error deleting Review:', error);
        res.status(500).json({ success: false, message: 'Error deleting Review' });
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
exports.deleteAdminUserReview = async(req, res) => {
    try {
        const review = await Review.findById(req.params.id);
        if (!review) {
            return res.status(404).json({ success: false, message: 'No Reviews Found' });
        }

        // New logic to delete the resume ID from the user's document
        const user = await User.findById(review.userId);
        if (user) {
            user.reviews.pull(review._id); // Remove the resume ID from the user's resumes array
            await user.save(); // Save the updated user document
        }

        await Review.findByIdAndDelete(req.params.id);
        
        res.redirect('/admin/user/review'); 
    } catch (error) {
        console.error('Error deleting Review:', error);
        res.status(500).json({ success: false, message: 'Error deleting Review' });
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
    
    if (!req.file) {
        return res.status(400).json({
            success: false,
            message: 'No file uploaded. Please upload a company logo.'
        });
    }

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
        duration: req.body.duration
    });
   
    console.log('Company Name:', newAdmin.companyname);

    try { 
        await Admin.create(newAdmin);
        res.redirect('/admin/posted/');
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
        res.redirect("/admin/posted");
    } catch (error) {
        console.error('Error updating admin:', error);  
        res.status(500).send('Error updating admin data');
    }
};

// details page
exports.aaideologydetails = async(req, res) => {

    // const linkname = await Admin.findOne({ jobname })
    const locals = {
        title: `Job Page Details `
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
        
        res.redirect('/admin/posted');
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

        // New logic to delete the resume ID from the user's document
        const user = await User.findById(resume.userId);
        if (user) {
            user.resumes.pull(resume._id); // Remove the resume ID from the user's resumes array
            await user.save(); // Save the updated user document
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
            jobname2: req.body.jobname2,
            resume: req.file.filename, 
            resumedate: req.body.resumedate,
            userId: res.locals.user._id,
            jobId: req.params.jobId
        }); 
        
        const user = res.locals.user; // Access user from locals
        
        await UserRes.create(newUserRes);
        user.resumes.push(newUserRes._id); // Add the resume reference
        await user.save(); // Save the user document

        res.redirect('/');
    } catch (error) { 
        console.error('Error saving resume:', error);
        res.status(500).send('Error saving resume data');
    }
}; 

exports.userResumeDelete = async(req, res) => {
    try {
        const resume = await UserRes.findById(req.params.id);
        if (!resume) {
            return res.status(404).json({ success: false, message: 'Resume not found' });
        }

        const filePath = path.join(__dirname, '../../uploads', resume.resume);
        if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
        }

        // New logic to delete the resume ID from the user's document
        const user = await User.findById(resume.userId);
        if (user) {
            user.resumes.pull(resume._id); // Remove the resume ID from the user's resumes array
            await user.save(); // Save the updated user document
        }

        await UserRes.findByIdAndDelete(req.params.id);
        res.redirect('/user/profile');
    } catch (error) {
        console.error('Error deleting resume:', error);
        res.status(500).json({ success: false, message: 'Error deleting resume' });
    }
};

// user management system
exports.userInfo = async(req, res) => {

    const locals = {
        title: `Aaideology || User Profile` 
    }
    
    try {
         // Use the user ID from the authenticated user

        const user = res.locals.user; 
        const resumes = user && user.resumes ? await UserRes.find({ _id: { $in: user.resumes } }) : []; 
        const reviews = user && user.reviews ? await Review.find({ _id: { $in: user.reviews } }) : []; 
        
    

        // const userResume = resumes.length > 0 ? resumes[0] : null; 
        // const jobId = userResume ? userResume.jobId : null;
        // const job = jobId ? await Admin.findOne({ _id: jobId }) : null; 
        // const jobName = job ? job.jobname : 'Job not found'; 

        res.render('user-info/user-page-info', { locals, user, resumes, reviews });
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
