const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const asyncHandler = require('../middleware/asyncHandler');

// Register a new user
router.post('/register', asyncHandler(userController.registerUser));

// Login user
router.post('/login', asyncHandler(userController.loginUser));

// Logout user
router.post('/logout', asyncHandler(userController.logoutUser));

// Get user profile (requires authentication)
router.get('/profile', asyncHandler(userController.getUserProfile));

// Get current user info (requires authentication)
router.get('/me', asyncHandler(userController.getCurrentUser));

module.exports = router;
