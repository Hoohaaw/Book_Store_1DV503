
const express = require('express');
const router = express.Router();
const cartController = require('../controllers/cartController');
const asyncHandler = require('../middleware/asyncHandler');
const { isAuthenticated } = require('../middleware/auth');

/**
 * @route GET /cart
 * @desc Get the current user's cart
 * @access Private
 */
router.get('/cart', isAuthenticated, asyncHandler(cartController.getCart.bind(cartController)));

/**
 * @route POST /cart/add
 * @desc Add an item to the cart or update quantity
 * @access Private
 */
router.post('/cart/add', isAuthenticated, asyncHandler(cartController.addToCart.bind(cartController)));

/**
 * @route DELETE /cart/remove/:isbn
 * @desc Remove an item from the cart by ISBN
 * @access Private  
 */
router.delete('/cart/remove/:isbn', isAuthenticated, asyncHandler(cartController.removeFromCart.bind(cartController)));

/**
 * @route POST /cart/checkout
 * @desc Checkout and create an order from the cart
 * @access Private
 */
router.post('/cart/checkout', isAuthenticated, asyncHandler(cartController.checkout.bind(cartController)));

module.exports = router;
