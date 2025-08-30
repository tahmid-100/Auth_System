const express = require('express');
const { getProfile } = require('../controllers/profileController');
const { protect } = require('../middleware/auth');

const router = express.Router();

router.get('/profile', protect, getProfile);

module.exports = router;