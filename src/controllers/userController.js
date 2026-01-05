const userService = require('../service/userService');
const pool = require('../../config/db');

class UserController {
  // Registrera ny användare
  async registerUser(req, res) {
    const result = await userService.registerUserData(req.body);
    res.status(201).json({
      success: true,
      message: 'Användare registrerad',
      userId: result.userId
    });
  }

  // Logga in användare
  async loginUser(req, res) {
    const user = await userService.loginUserData(req.body.email, req.body.password);
    req.session.userId = user.UserId;
    req.session.userEmail = user.Email;
    req.session.userName = `${user.fname} ${user.lname}`;
    res.status(200).json({
      success: true,
      message: 'Inloggning lyckades',
      user: {
        userId: user.UserId,
        email: user.Email,
        name: `${user.fname} ${user.lname}`
      }
    });
  }

  // Logga ut användare
  async logoutUser(req, res) {
    await userService.logoutUserData(req);
    res.status(200).json({
      success: true,
      message: 'Logout successful'
    });
  }

  // Hämta användarprofil
  async getUserProfile(req, res) {
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