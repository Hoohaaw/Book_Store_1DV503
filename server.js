require('dotenv').config();
const express = require('express');
const session = require('express-session');
const path = require('path');
const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Session configuration
app.use(session({
  secret: process.env.SESSION_SECRET || 'your-secret-key-change-this-in-production',
  resave: false,
  saveUninitialized: false,
  cookie: {
    maxAge: 1000 * 60 * 60 * 24, // 24 hours
    httpOnly: true,
    secure: false // Set to true if using HTTPS
  }
}));

// Serve static files from src directory
app.use(express.static(path.join(__dirname, 'src')));

// Import middleware
const { isAuthenticated } = require('./src/middleware/auth');

// Routes
const userRoutes = require('./src/routes/user');
const booksRoutes = require('./src/routes/books');

// Middeware for session check (login/register routes excluded)
app.use ('/api/users', (req, res, next) => {
    if(['/login', '/register'].includes(req.path)){
        return next();
    }
    return isAuthenticated(req, res, next);
}, userRoutes);
app.use('/api/books', booksRoutes);

// Serve HTML pages
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'src', 'html', 'index.html'));
});

app.get('/register', (req, res) => {
  res.sendFile(path.join(__dirname, 'src', 'html', 'register.html'));
});

app.get('/login', (req, res) => {
  res.sendFile(path.join(__dirname, 'src', 'html', 'login.html'));
});

app.get('/search', (req, res) => {
  res.sendFile(path.join(__dirname, 'src', 'html', 'bookSearch.html'));
});

app.get('/cart', (req, res) => {
  res.sendFile(path.join(__dirname, 'src', 'html', 'cart.html'));
});


// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    message: 'Something went wrong!'
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});

module.exports = app;
