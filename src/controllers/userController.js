const userService = require('../service/userService');
const pool = require('../../config/db');

/**
 * Controller for user-related operations (registration, login, logout, profile).
 */
class UserController {
  /**
   * Registers a new user.
   * @param {import('express').Request} req - Express request object
   * @param {import('express').Response} res - Express response object
   * @returns {Promise<void>}
   */
  async registerUser(req, res) {
    // Passes user data to service layer for validation and database insert
    const result = await userService.registerUserData(req.body);
    res.status(201).json({
      success: true,
      message: 'User registered',
      userId: result.userId
    });
  }

  /**
   * Logs in a user and creates a session.
   * @param {import('express').Request} req - Express request object
   * @param {import('express').Response} res - Express response object
   * @returns {Promise<void>}
   */
  async loginUser(req, res) {
    // Authenticates user and sets session variables
    const user = await userService.loginUserData(req.body.email, req.body.password);
    req.session.userId = user.UserId;
    req.session.userEmail = user.Email;
    req.session.userName = `${user.fname} ${user.lname}`;
    res.status(200).json({
      success: true,
      message: 'Login successful',
      user: {
        userId: user.UserId,
        email: user.Email,
        name: `${user.fname} ${user.lname}`
      }
    });
  }

  /**
   * Logs out the current user by destroying the session.
   * @param {import('express').Request} req - Express request object
   * @param {import('express').Response} res - Express response object
   * @returns {Promise<void>}
   */
  async logoutUser(req, res) {
    // Calls service to destroy session
    await userService.logoutUserData(req);
    res.status(200).json({
      success: true,
      message: 'Logout successful'
    });
  }

  /**
   * Gets the profile of the currently authenticated user.
   * @param {import('express').Request} req - Express request object
   * @param {import('express').Response} res - Express response object
   * @returns {Promise<void>}
   */
  async getUserProfile(req, res) {
    // Checks session and fetches user profile from service
    const userId = req.session.userId;
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'Not authenticated'
      });
    }
    const user = await userService.getUserProfileData(userId, pool);
    res.status(200).json({
      success: true,
      user
    });
  }
}

module.exports = new UserController();