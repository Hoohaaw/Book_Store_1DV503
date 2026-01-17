/**
 * @module bookService
 * @description Provides functions for searching books in the database.
 * @exports searchBooks
 */
const db = require('../../config/db');

/**
 * Search for books by author, title, or subject with pagination.
 * @param {Object} params - Search parameters
 * @param {string} [params.author] - Author name
 * @param {string} [params.title] - Book title
 * @param {string} [params.subject] - Book subject
 * @param {number} [params.page=1] - Page number
 * @param {number} [params.limit=5] - Items per page
 * @returns {Promise<Object>} Search result with items, page, limit, and total
 */
async function searchBooks({ author, title, subject, page = 1, limit = 5 }) {

  // Normalize and validate page/limit
  const p = Math.max(Number(page) || 1, 1);
  const l = Math.min(Math.max(Number(limit) || 5, 1), 50);

  const offset = (p - 1) * l;
  const params = [];
  let where = 'WHERE 1=1';

  if (author) {
    where += ' AND LOWER(author) LIKE ?';
    params.push(`${author.toLowerCase()}%`);
  }
  if (title) {
    where += ' AND LOWER(title) LIKE ?';
    params.push(`%${title.toLowerCase()}%`);
  }
  if (subject) {
    where += ' AND LOWER(subject) LIKE ?';
    params.push(`%${subject.toLowerCase()}%`);
  }

  // Build queries
  const dataQuery = `SELECT isbn, author, title, price, subject FROM books ${where} ORDER BY title LIMIT ? OFFSET ?`;

  // countParams = params without limit/offset
  const countParams = params.slice();

  // Add limit/offset for data-query
  params.push(l, offset);

  const countQuery = `SELECT COUNT(*) AS total FROM books ${where}`;

  // Run queries
  const [rows] = await db.query(dataQuery, params);
  const [countRows] = await db.query(countQuery, countParams);
  const total = countRows && countRows[0] ? Number(countRows[0].total) : 0;

  return {
    items: rows || [],
    page: p,
    limit: l,
    total
  };
}

/**
 * Get all distinct subjects from the books table
 * @returns {Promise<string[]>} Array of unique subject names
 */
async function getSubjects() {
  const query = 'SELECT DISTINCT subject FROM books WHERE subject IS NOT NULL ORDER BY subject';
  const [rows] = await db.query(query);
  return rows.map(row => row.subject);
}

module.exports = { searchBooks, getSubjects };
