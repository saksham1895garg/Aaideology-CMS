const express = require('express');
const router = express.Router();
const contentControllers = require('../controllers/contentControllers');
const authControllers = require('../controllers/authControllers');
const { userpic } = require('../controllers/authControllers');
const { uploadLogo, uploadResume } = contentControllers;
const { adminAuth } = require('../middlewares/authMiddleware');


// main web page 
router.get('/', contentControllers.getMainPage);

// main service page
router.get('/services', contentControllers.homepage); 
// admin content post page
router.get('/admin/post', adminAuth, contentControllers.adminpage);   

// main admin page 
router.get('/admin', adminAuth, contentControllers.alladminpage); 
router.get('/admin/logout', authControllers.adminAuthLogout);
router.post('/admin', uploadLogo.single('companylogo'), contentControllers.postadminpage); 
router.get('/admin/posted', adminAuth, contentControllers.mainadminpage);

// admin edit post page
router.get('/admin/edit-post/:id', adminAuth, contentControllers.admineditpost);
router.post('/admin/edit-post/:id', uploadLogo.single('companylogo'), contentControllers.admineditput);
router.put('/admin/edit-post/:id', uploadLogo.single('companylogo'), contentControllers.admineditput);

router.post('/admin/delete-post/:id', contentControllers.adminpostdelete);
router.post('/admin/cv-delete/:id', contentControllers.deleteResume); 

router.get('/aaideology/:id', contentControllers.aaideologydetails);
router.get('/admin/cv', adminAuth, contentControllers.userResumeDetails);
router.post('/user/cv/:jobId', uploadResume.single('cv'), contentControllers.userResumeDetailsPost);
router.post("/user/cv/delete/:id", contentControllers.userResumeDelete)

// admin user page
router.get('/admin/user', adminAuth, contentControllers.userInfoProfile);
router.post('/admin/user/delete/:id', adminAuth, contentControllers.userAdminInfoProfileDelete)



// user review system
router.post('/user/review', contentControllers.postReviewHomepage);
router.get('/admin/user/review', contentControllers.adminUserReview);
router.post('/admin/delete/review/:id', contentControllers.deleteAdminUserReview);
router.post('/user/review/delete/:id', contentControllers.deleteUserReview);

const { checkUser } = require('../middlewares/authMiddleware'); // Import the checkUser middleware

// user info profile
router.get('/user/profile', checkUser, contentControllers.userInfo); // Apply authentication middleware


router.post('/user/profile', authControllers.userInfoProfilePost);
router.get('/user/logout', authControllers.userInfoProfileLogout);
router.get('/admin/user/profile', contentControllers.userInfoProfile); 
 
// admin authentication routes
router.get('/admin/login', authControllers.adminauth);  
router.post('/admin/login', authControllers.adminAuthPost);

// User authentication routes
router.get('/user/register', authControllers.userRegister)
// router.get('/:id/verify/:token', authControllers.userVerify)
router.post('/user/register', userpic.single('profilepic'), authControllers.userRegisterPost)
router.get('/user/login', authControllers.userLogin)
router.post('/user/login', authControllers.userLoginPost)

// About pages
router.get('/about', contentControllers.aboutpage);

// contact pages
router.get('/contact', contentControllers.contactpage);

// blogs page
router.get('/blogs', contentControllers.blogsPage)

module.exports = router;
