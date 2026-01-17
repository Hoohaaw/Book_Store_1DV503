const express = require('express');
const router = express.Router();
const db = require('../../config/db');
const asyncHandler = require('../middleware/asyncHandler');
const bookController = require('../controllers/bookController');

router.get('/search', asyncHandler(bookController.search.bind(bookController)))

module.exports = router;
