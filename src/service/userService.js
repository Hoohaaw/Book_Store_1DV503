const bcrypt = require('bcrypt');
const pool = require('../../config/db');

const registerUserData = async (data) => {
  const { firstname, lastname, address, city, zipCode, phoneNumber, email, password } = data;

  // Validering
  if (!firstname || !lastname || !address || !city || !zipCode || !phoneNumber || !email || !password) {
    throw { status: 400, message: 'Alla fält måste fyllas i' };
  }
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    throw { status: 400, message: 'Ogiltigt e-postformat' };
  }
  const zipRegex = /^\d{5}$/;
  if (!zipRegex.test(zipCode)) {
    throw { status: 400, message: 'Ogiltigt postnummer. Måste vara 5 siffror' };
  }

  // Finns användaren redan
  const [existingUsers] = await pool.query('SELECT UserId FROM members WHERE Email = ?', [email]);
  if (existingUsers.length > 0) {
    throw { status: 409, message: 'E-postadressen är redan registrerad' };
  }

  // Hasha lösenord
  const saltRounds = 10;
  const hashedPassword = await bcrypt.hash(password, saltRounds);

  // Spara i databas
  const [result] = await pool.query(
    `INSERT INTO members (fname, lname, address, city, zip, phone, Email, Password)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    [firstname, lastname, address, city, zipCode, phoneNumber, email, hashedPassword]
  );

  return { userId: result.insertId };
};

const loginUserData = async (email, password) => {
  if (!email || !password) {
    throw { status: 400, message: 'E-post och lösenord krävs' };
  }
  const [users] = await pool.query('SELECT * FROM members WHERE Email = ?', [email]);
  if (users.length === 0) {
    throw { status: 401, message: 'Fel e-post eller lösenord' };
  }
  const user = users[0];
  const isPasswordValid = await bcrypt.compare(password, user.Password);
  if (!isPasswordValid) {
    throw { status: 401, message: 'Fel e-post eller lösenord' };
  }
  return user;
};

const logoutUserData = async (req) => {
  return new Promise((resolve, reject) => {
    req.session.destroy((err) => {
      if (err) reject({ status: 500, message: 'Logout failed' });
      else resolve();
    });
  });
};

const getUserProfileData = async (userId, pool) => {
  const [users] = await pool.query(
    'SELECT UserId, fname, lname, Email, address, city, zip, phone FROM members WHERE UserId = ?',
    [userId]
  );
  if (users.length === 0) throw { status: 404, message: 'User not found' };
  return users[0];
};

module.exports = { registerUserData, loginUserData, logoutUserData, getUserProfileData };
module.exports = { registerUserData, loginUserData };