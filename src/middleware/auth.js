// Middleware to check if user is authenticated
const isAuthenticated = (req, res, next) => {
  if (req.session && req.session.userId) {
    return next();
  }
  return res.status(401).json({
    success: false,
    message: 'Authentication required'
  });
};

// Middleware to check if user is NOT authenticated (for login/register pages)
const isNotAuthenticated = (req, res, next) => {
  if (req.session && req.session.userId) {
    return res.status(400).json({
      success: false,
      message: 'Already logged in'
    });
  }
  return next();
};

module.exports = {
  isAuthenticated,
  isNotAuthenticated
};
