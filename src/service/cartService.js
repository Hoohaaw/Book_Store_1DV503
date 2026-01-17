/**
 * @module cartService
 * @description Provides functions for managing the shopping cart and order creation.
 * @exports getCartItems
 * @exports addOrUpdateCartItem
 * @exports removeCartItem
 * @exports clearCart
 * @exports checkoutCart
 */
const db = require('../../config/db');

/**
 * Get all items in a user's cart.
 * @param {number} userId - The user's ID
 * @returns {Promise<Array>} List of items
 */
async function getCartItems(userId) {
  const query = `
    SELECT c.isbn, c.qty, b.title, b.price
    FROM cart c
    JOIN books b ON c.isbn = b.isbn
    WHERE c.userid = ?
  `;
  const [rows] = await db.query(query, [userId]);
  return rows || [];
}

/**
 * Add or update an item in the cart.
 * @param {number} userId - The user's ID
 * @param {string} isbn - Book ISBN
 * @param {number} qty - Quantity
 * @returns {Promise<Object>} Object with isbn and qty
 */
async function addOrUpdateCartItem(userId, isbn, qty) {
  const [existing] = await db.query(
    'SELECT qty FROM cart WHERE userid = ? AND isbn = ?',
    [userId, isbn]
  );

  if (existing && existing.length > 0) {
    const currentQty = Number(existing[0].qty) || 0;
    const newQty = currentQty + Number(qty);
    await db.query(
      'UPDATE cart SET qty = ? WHERE userid = ? AND isbn = ?',
      [newQty, userId, isbn]
    );
    return { isbn, qty: newQty };
  } else {
    await db.query(
      'INSERT INTO cart (userid, isbn, qty) VALUES (?, ?, ?)',
      [userId, isbn, Number(qty)]
    );
    return { isbn, qty: Number(qty) };
  }
}

/**
 * Remove an item from the cart.
 * @param {number} userId - The user's ID
 * @param {string} isbn - Book ISBN
 * @returns {Promise<void>}
 */
async function removeCartItem(userId, isbn) {
  await db.query('DELETE FROM cart WHERE userid = ? AND isbn = ?', [userId, isbn]);
}

/**
 * Clear the entire cart for a user.
 * @param {number} userId - The user's ID
 * @returns {Promise<void>}
 */
async function clearCart(userId) {
  await db.query('DELETE FROM cart WHERE userid = ?', [userId]);
}

/**
 * Create an order from the cart and clear it.
 * @param {number} userId - The user's ID
 * @param {Object} shipping - Shipping information
 * @returns {Promise<Object>} Order info
 */
async function checkoutCart(userId, shipping) {
  const connection = await db.getConnection();
  let transactionStarted = false;

  try {
    await connection.beginTransaction();
    transactionStarted = true;

    const [cartRows] = await connection.query(
      `SELECT c.isbn, c.qty, b.price, b.title
       FROM cart c
       JOIN books b ON c.isbn = b.isbn
       WHERE c.userid = ?`,
      [userId]
    );

    if (!cartRows || cartRows.length === 0) {
      throw new Error('Cart is empty');
    }

    const [orderResult] = await connection.query(
      `INSERT INTO orders (userid, created, shipAddress, shipCity, shipZip)
       VALUES (?, NOW(), ?, ?, ?)`,
      [userId, shipping.address, shipping.city, shipping.zip]
    );
    const ono = orderResult.insertId;

    // Hämta created från databasen (så vi returnerar exakt värde DB satte)
    const [orderRows] = await connection.query('SELECT created FROM orders WHERE ono = ?', [ono]);
    const created = orderRows && orderRows[0] ? orderRows[0].created : null;

    for (const row of cartRows) {
      const amount = Number(row.price) * Number(row.qty);
      await connection.query(
        'INSERT INTO order_details (ono, isbn, qty, amount) VALUES (?, ?, ?, ?)',
        [ono, row.isbn, row.qty, amount]
      );
    }

    await connection.query('DELETE FROM cart WHERE userid = ?', [userId]);

    await connection.commit();
    transactionStarted = false;

    const total = cartRows.reduce((s, r) => s + Number(r.price) * Number(r.qty), 0);
    return { ono, created, items: cartRows, total };
  } catch (err) {
    if (transactionStarted) {
      try { await connection.rollback(); } catch (e) { /* ignore rollback error */ }
    }
    throw err;
  } finally {
    try { connection.release(); } catch (e) { /* ignore release error */ }
  }
}

module.exports = { getCartItems, addOrUpdateCartItem, removeCartItem, clearCart, checkoutCart };
