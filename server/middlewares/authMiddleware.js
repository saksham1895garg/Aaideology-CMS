const jwt = require('jsonwebtoken');
const User = require('../models/userSchema');

// const requireAuth = (req, res, next) => {
//     console.error('Authentication middleware triggered');

//     const { jwt: token } = req.cookies;
//     // check json web token exists & is verified
//     if (token) {
//         jwt.verify(token, process.env.JWT_SECRET_KEY, (err, decoded) => {
//             if (err) {
//                 console.error('JWT verification error:', err);
//                 return res.redirect('/user/login');
//             }
//             const isValid = decoded ? true : false;

//             if (isValid) {
//                 next();
//             } else {
//                 res.redirect('/user/login');
//             }
//         });
//     } else {
//         console.error('No token provided');
//         res.redirect('/user/login');
//     }

// }

const checkUser = (req, res, next) => {
    const { jwt: token } = req.cookies;


    res.locals.user = null;
    if(token){
        jwt.verify(token, process.env.JWT_SECRET_KEY, async(err, decoded) => {
            if (err) {
                console.error('JWT verification error:', err);
                return next();
            }

            const user = await User.findById(decoded.id);
            res.locals.user = user;
            next();
        });
    }else{
        next();
    };
};

module.exports = {
   
    checkUser
};
