
const express = require('express');
const router = express.Router();
const cartController = require('../controllers/cartController');
const asyncHandler = require('../middleware/asyncHandler');

/**
 * @route GET /api/cart
 * @desc Get the current user's cart
 * @access Private
 */
router.get('/', asyncHandler(cartController.getCart.bind(cartController)));

/**
 * @route POST /api/cart/add
 * @desc Add an item to the cart or update quantity
 * @access Private
 */
router.post('/add', asyncHandler(cartController.addToCart.bind(cartController)));

/**
 * @route DELETE /api/cart/remove/:isbn
 * @desc Remove an item from the cart by ISBN
 * @access Private
 */
router.delete('/remove/:isbn', asyncHandler(cartController.removeFromCart.bind(cartController)));

/**
 * @route POST /api/cart/checkout
 * @desc Checkout and create an order from the cart
 * @access Private
 */
router.post('/checkout', asyncHandler(cartController.checkout.bind(cartController)));

module.exports = router;
