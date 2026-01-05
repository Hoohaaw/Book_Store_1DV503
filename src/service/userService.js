const bcrypt = require('bcrypt');
const pool = require('../../config/db');

/**
 * Registers a new user in the database after validation and password hashing.
 * @param {Object} data - User data from request body
 * @param {string} data.firstname
 * @param {string} data.lastname
 * @param {string} data.address
 * @param {string} data.city
 * @param {string} data.zipCode
 * @param {string} data.phoneNumber
 * @param {string} data.email
 * @param {string} data.password
 * @returns {Promise<{userId: number}>}
 * @throws {Object} Error object with status and message
 */
const registerUserData = async (data) => {
  const { firstname, lastname, address, city, zipCode, phoneNumber, email, password } = data;

  // Validate required fields
  if (!firstname || !lastname || !address || !city || !zipCode || !phoneNumber || !email || !password) {
    throw { status: 400, message: 'All fields are required' };
  }
  // Validate email format
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    throw { status: 400, message: 'Invalid email format' };
  }
  // Validate zip code
  const zipRegex = /^\d{5}$/;
  if (!zipRegex.test(zipCode)) {
    throw { status: 400, message: 'Invalid zip code. Must be 5 digits' };
  }

  // Check if user already exists
  const [existingUsers] = await pool.query('SELECT UserId FROM members WHERE Email = ?', [email]);
  if (existingUsers.length > 0) {
    throw { status: 409, message: 'Email already registered' };
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

  return { userId: result.insertId };
};

/**
 * Authenticates a user by email and password.
 * @param {string} email - User email
 * @param {string} password - User password
 * @returns {Promise<Object>} User object from database
 * @throws {Object} Error object with status and message
 */
const loginUserData = async (email, password) => {
  if (!email || !password) {
    throw { status: 400, message: 'Email and password are required' };
  }
  // Find user by email
  const [users] = await pool.query('SELECT * FROM members WHERE Email = ?', [email]);
  if (users.length === 0) {
    throw { status: 401, message: 'Invalid email or password' };
  }
  const user = users[0];
  // Compare password
  const isPasswordValid = await bcrypt.compare(password, user.Password);
  if (!isPasswordValid) {
    throw { status: 401, message: 'Invalid email or password' };
  }
  return user;
};

/**
 * Logs out the user by destroying the session.
 * @param {import('express').Request} req - Express request object
 * @returns {Promise<void>}
 * @throws {Object} Error object with status and message
 */
const logoutUserData = async (req) => {
  return new Promise((resolve, reject) => {
    req.session.destroy((err) => {
      if (err) reject({ status: 500, message: 'Logout failed' });
      else resolve();
    });
  });
};

/**
 * Gets the profile of a user by userId.
 * @param {number} userId - User ID from session
 * @param {Object} pool - Database connection pool
 * @returns {Promise<Object>} User profile object
 * @throws {Object} Error object with status and message
 */
const getUserProfileData = async (userId, pool) => {
  const [users] = await pool.query(
    'SELECT UserId, fname, lname, Email, address, city, zip, phone FROM members WHERE UserId = ?',
    [userId]
  );
  if (users.length === 0) throw { status: 404, message: 'User not found' };
  return users[0];
};

module.exports = { registerUserData, loginUserData, logoutUserData, getUserProfileData };