const express = require('express');
const { refreshToken } = require('../middlewares/authMiddleware');

const router = express.Router();

// Route for refreshing the access token
router.post('/refresh-token', refreshToken);

module.exports = router;
