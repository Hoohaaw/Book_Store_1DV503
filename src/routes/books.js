const express = require('express');
const router = express.Router();
const asyncHandler = require('../middleware/asyncHandler');
const bookController = require('../controllers/bookController');

router.get('/search', asyncHandler(bookController.search.bind(bookController)));
router.get('/subjects', asyncHandler(bookController.getSubjects.bind(bookController)));

module.exports = router;
