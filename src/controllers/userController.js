const bcrypt = require('bcrypt');
const pool = require('../../config/db');

class UserController {
  // Register a new user
  async registerUser(req, res) {
    try {
      const { firstname, lastname, address, city, zipCode, phoneNumber, email, password } = req.body;

      // Validate input
      if (!firstname || !lastname || !address || !city || !zipCode || !phoneNumber || !email || !password) {
        return res.status(400).json({
          success: false,
          message: 'All fields are required'
        });
      }

      // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid email format'
        });
      }

      // Validate zip code (assuming 5 digits)
      const zipRegex = /^\d{5}$/;
      if (!zipRegex.test(zipCode)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid zip code. Must be 5 digits'
        });
      }

      // Check if user already exists
      const [existingUsers] = await pool.query(
        'SELECT UserId FROM members WHERE Email = ?',
        [email]
      );

      if (existingUsers.length > 0) {
        return res.status(409).json({
          success: false,
          message: 'Email already registered'
        });
      }

      // Hash password
      const saltRounds = 10;
      const hashedPassword = await bcrypt.hash(password, saltRounds);

      // Insert new user into database
      const [result] = await pool.query(
        `INSERT INTO members (fname, lname, address, city, zip, phone, Email, Password)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [firstname, lastname, address, city, zipCode, phoneNumber, email, hashedPassword]
      );

      return res.status(201).json({
        success: true,
        message: 'User registered successfully',
        userId: result.insertId
      });

    } catch (error) {
      console.error('Registration error:', error);
      return res.status(500).json({
        success: false,
        message: 'Server error during registration'
      });
    }
  }

  // Login user
  async loginUser(req, res) {
    try {
      const { email, password } = req.body;

      // Validate input
      if (!email || !password) {
        return res.status(400).json({
          success: false,
          message: 'Email and password are required'
        });
      }

      // Find user by email
      const [users] = await pool.query(
        'SELECT * FROM members WHERE Email = ?',
        [email]
      );

      if (users.length === 0) {
        return res.status(401).json({
          success: false,
          message: 'Invalid email or password'
        });
      }

      const user = users[0];

      // Compare password
      const isPasswordValid = await bcrypt.compare(password, user.Password);

      if (!isPasswordValid) {
        return res.status(401).json({
          success: false,
          message: 'Invalid email or password'
        });
      }

      // Create session (you'll need express-session middleware)
      req.session.userId = user.UserId;
      req.session.userEmail = user.Email;
      req.session.userName = `${user.fname} ${user.lname}`;

      return res.status(200).json({
        success: true,
        message: 'Login successful',
        user: {
          userId: user.UserId,
          email: user.Email,
          name: `${user.fname} ${user.lname}`
        }
      });

    } catch (error) {
      console.error('Login error:', error);
      return res.status(500).json({
        success: false,
        message: 'Server error during login'
      });
    }
  }

  // Logout user
  async logoutUser(req, res) {
    try {
      req.session.destroy((err) => {
        if (err) {
          return res.status(500).json({
            success: false,
            message: 'Logout failed'
          });
        }
        return res.status(200).json({
          success: true,
          message: 'Logout successful'
        });
      });
    } catch (error) {
      console.error('Logout error:', error);
      return res.status(500).json({
        success: false,
        message: 'Server error during logout'
      });
    }
  }

  // Get user profile
  async getUserProfile(req, res) {
    try {
      const userId = req.session.userId;

      if (!userId) {
        return res.status(401).json({
          success: false,
          message: 'Not authenticated'
        });
      }

      const [users] = await pool.query(
        'SELECT UserId, fname, lname, Email, address, city, zip, phone FROM members WHERE UserId = ?',
        [userId]
      );

      if (users.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'User not found'
        });
      }

      return res.status(200).json({
        success: true,
        user: users[0]
      });

    } catch (error) {
      console.error('Get profile error:', error);
      return res.status(500).json({
        success: false,
        message: 'Server error'
      });
    }
  }
}

module.exports = new UserController();
