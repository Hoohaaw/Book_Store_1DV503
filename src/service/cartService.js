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
    SELECT c.ISBN as isbn, c.Quantity as qty, b.Title as title, b.Price as price
    FROM cart c
    JOIN books b ON c.ISBN = b.ISBN
    WHERE c.UserId = ?
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
    'SELECT Quantity FROM cart WHERE UserId = ? AND ISBN = ?',
    [userId, isbn]
  );

  if (existing && existing.length > 0) {
    const currentQty = Number(existing[0].Quantity) || 0;
    const newQty = currentQty + Number(qty);
    await db.query(
      'UPDATE cart SET Quantity = ? WHERE UserId = ? AND ISBN = ?',
      [newQty, userId, isbn]
    );
    return { isbn, qty: newQty };
  } else {
    await db.query(
      'INSERT INTO cart (UserId, ISBN, Quantity) VALUES (?, ?, ?)',
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
  await db.query('DELETE FROM cart WHERE UserId = ? AND ISBN = ?', [userId, isbn]);
}

/**
 * Clear the entire cart for a user.
 * @param {number} userId - The user's ID
 * @returns {Promise<void>}
 */
async function clearCart(userId) {
  await db.query('DELETE FROM cart WHERE UserId = ?', [userId]);
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
      `SELECT c.ISBN as isbn, c.Quantity as qty, b.Price as price, b.Title as title
       FROM cart c
       JOIN books b ON c.ISBN = b.ISBN
       WHERE c.UserId = ?`,
      [userId]
    );

    if (!cartRows || cartRows.length === 0) {
      throw new Error('Cart is empty');
    }

    const [orderResult] = await connection.query(
      `INSERT INTO orders (UserId, OrderDate)
       VALUES (?, NOW())`,
      [userId]
    );
    const ono = orderResult.insertId;

    // Hämta OrderDate från databasen (så vi returnerar exakt värde DB satte)
    const [orderRows] = await connection.query('SELECT OrderDate FROM orders WHERE OrderId = ?', [ono]);
    const created = orderRows && orderRows[0] ? orderRows[0].OrderDate : null;

    for (const row of cartRows) {
      await connection.query(
        'INSERT INTO orderdetails (OrderId, ISBN, Quantity) VALUES (?, ?, ?)',
        [ono, row.isbn, row.qty]
      );
    }

    await connection.query('DELETE FROM cart WHERE UserId = ?', [userId]);

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
