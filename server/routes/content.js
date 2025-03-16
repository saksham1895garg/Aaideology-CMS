const express = require('express');
const router = express.Router();
const contentControllers = require('../controllers/contentControllers');
const authControllers = require('../controllers/authControllers');
const { uploadLogo, uploadResume } = require('../controllers/contentControllers');
// const { requireAuth } = require('../middlewares/authMiddleware'); 

// Customer routes 

// main service page
router.get('/', contentControllers.homepage);
// admin content post page
router.get('/admin/post', contentControllers.adminpage); 

// main admin page 
router.get('/admin', contentControllers.alladminpage); 
router.post('/admin', uploadLogo.single('companylogo'), contentControllers.postadminpage); 
router.get('/admin/posted', contentControllers.mainadminpage);

// admin edit post page
router.get('/admin/edit-post/:id', contentControllers.admineditpost);
router.post('/admin/edit-post/:id', uploadLogo.single('companylogo'), contentControllers.admineditput);
router.put('/admin/edit-post/:id', uploadLogo.single('companylogo'), contentControllers.admineditput);

router.post('/admin/delete-post/:id', contentControllers.adminpostdelete);
router.post('/admin/cv-delete/:id', contentControllers.deleteResume);

router.get('/aaideology/:id', contentControllers.aaideologydetails);
router.get('/admin/cv', contentControllers.userResumeDetails);
router.post('/user/cv', uploadResume.single('cv'), contentControllers.userResumeDetailsPost);

// user review system
router.post('/user/review', contentControllers.postReviewHomepage);
router.get('/admin/user/review', contentControllers.adminUserReview);

const { checkUser } = require('../middlewares/authMiddleware'); // Import the checkUser middleware

// user info profile
router.get('/user/profile', checkUser, contentControllers.userInfo); // Apply authentication middleware


router.post('/user/profile', authControllers.userInfoProfilePost);
router.get('/user/logout', authControllers.userInfoProfileLogout);
router.get('/admin/user/profile', contentControllers.userInfoProfile); 
 
// admin authentication routes
router.get('/admin/login', authControllers.adminauth);  

// User authentication routes
router.get('/user/register', authControllers.userRegister)
router.post('/user/register', authControllers.userRegisterPost)
router.get('/user/login', authControllers.userLogin)
router.post('/user/login', authControllers.userLoginPost)

// About pages
router.get('/about', contentControllers.aboutpage);

// contact pages
router.get('/contact', contentControllers.contactpage);

module.exports = router;
