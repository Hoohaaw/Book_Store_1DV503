/**
 * @module cartController
 * @description Controller for handling shopping cart operations and order creation.
 * @exports CartController
 */
<<<<<<< HEAD
const cartService = require('../service/cartService')
const pool = require('../../config/db')

=======

const cartService = require('../service/cartService');
const pool = require('../../config/db');
>>>>>>> a92dd03df91a4e9f7f4f7434793e8ba41756c34d

class CartController {
  /**
   * Get the user's cart
   * @param {import('express').Request} req
   * @param {import('express').Response} res
   */
  async getCart(req, res) {
    try {
      const userId = req.session.userId;
      const rows = await cartService.getCartItems(userId);

      const items = (rows || []).map(r => ({
        isbn: r.isbn,
        title: r.title,
        price: Number(r.price),
        qty: Number(r.qty),
        total: Number(r.price) * Number(r.qty)
      }));

      const total = items.reduce((s, it) => s + it.total, 0);
      res.json({ items, total });
    } catch (err) {
      console.error('CartController.getCart error', err);
      res.status(500).json({ message: 'Server error loading cart.' });
    }
  }

  /**
   * Add or update an item in the cart
   * @param {import('express').Request} req
   * @param {import('express').Response} res
   */
  async addToCart(req, res) {
    try {
      const userId = req.session.userId;
      const { isbn, qty } = req.body;
      const quantity = Number(qty);

      if (!isbn || !Number.isInteger(quantity) || quantity <= 0) {
        return res.status(400).json({ message: 'Invalid ISBN or quantity.' });
      }

      await cartService.addOrUpdateCartItem(userId, isbn, quantity);
      const rows = await cartService.getCartItems(userId);

      const items = (rows || []).map(r => ({
        isbn: r.isbn,
        title: r.title,
        price: Number(r.price),
        qty: Number(r.qty),
        total: Number(r.price) * Number(r.qty)
      }));
      const total = items.reduce((s, it) => s + it.total, 0);

      res.status(200).json({ message: 'Cart updated', items, total });
    } catch (err) {
      console.error('CartController.addToCart error', err);
      res.status(500).json({ message: 'Server error updating cart' });
    }
  }

  /**
   * Remove an item from the cart
   * @param {import('express').Request} req
   * @param {import('express').Response} res
   */
  async removeFromCart(req, res) {
    try {
      const userId = req.session.userId;
      const { isbn } = req.params;
      if (!isbn) return res.status(400).json({ message: 'ISBN missing' });

      await cartService.removeCartItem(userId, isbn);
      res.json({ message: 'Item removed.' });
    } catch (err) {
      console.error('CartController.removeFromCart error', err);
      res.status(500).json({ message: 'Server error removing from cart' });
    }
  }

  /**
   * Checkout: create order, order_details and clear cart
   * @param {import('express').Request} req
   * @param {import('express').Response} res
   */
  async checkout(req, res) {
    try {
      const userId = req.session.userId;
      if (!userId) return res.status(401).json({ message: 'User not logged in.' });

      // Use shipping from body or fallback to member address
      let shipping = req.body.shipping;
      if (!shipping || !shipping.address) {
        const [memberRows] = await pool.query(
          'SELECT address, city, zip, fname, lname FROM members WHERE userid = ?',
          [userId]
        );
        const m = memberRows && memberRows[0] ? memberRows[0] : {};
        shipping = {
          address: m.address || '',
          city: m.city || '',
          zip: m.zip || ''
        };
      }

      const result = await cartService.checkoutCart(userId, shipping);

      // Ensure created is a Date object
      const createdDate = result.created ? new Date(result.created) : new Date();

      res.status(201).json({
        message: 'Order created',
        order: {
          ono: result.ono,
          created: createdDate,
          items: result.items,
          total: result.total,
          deliveryDate: new Date(createdDate.getTime() + 7 * 24 * 60 * 60 * 1000)
        }
      });
    } catch (err) {
      console.error('CartController.checkout error', err);
      if (err && err.message === 'Cart is empty') {
        return res.status(400).json({ message: 'Cart is empty' });
      }
      res.status(500).json({ message: 'Server Error at checkout' });
    }
  }
}

module.exports = new CartController();
