/**
 * @module bookService
 * @description Provides functions for searching books in the database.
 * @exports searchBooks
 */
const db = require('../../config/db')


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
    const offset = (page = 1) * limit
    const params = []
    let where = 'WHERE 1=1'

    if(author) {
        where += ' AND LOWER(author) LIKE ?'
        params.push(`${author.toLowerCase()}%`)
    }
    if(title){
        where +=' AND LOWER(title) LIKE ?'
        params.push(`%${title.toLowerCase()}%`) 
    }
    if (subject) {
        where += ' AND LOWER(subject) LIKE ?'
        params.push(`%${subject.toLowerCase()}%`)
    }
    
    const dataQuery = `SELECT isbn, author, title, price, subject FROM books ${where} ORDER BY title LIMIT ? OFFSET ?`
    params.push(Number(limit), Number(offset))

    const countParams = params.slice(0, params.length - 2)
    const countQuery = `SELECT COUNT(*) AS total FROM books ${where}`

    const [rows] = await db.query(dataQuery. params)
    const [countRows] = await db.query(countQuery, countParams)
    const total = countRows && countRows[0] ? Number(countRows[0].total) : 0

    return {
        items: rows || [],
        page: Number(page),
        limit: Number(limit),
        total
    }
}

module.exports = { searchBooks }

