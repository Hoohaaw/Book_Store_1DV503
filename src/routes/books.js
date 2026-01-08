const express = require('express');
const router = express.Router();
const db = require('../../config/db');

// Search books (MySQL syntax)
router.get('/search', async (req, res) => {
    const { author, title, subject, page = 1, limit = 5 } = req.query;
    const offset = (page - 1) * limit;
    let query = `SELECT * FROM books WHERE 1=1`;
    let params = [];

    if (author) {
        query += ` AND LOWER(author) LIKE ?`;
        params.push(author.toLowerCase() + '%');
    }

    if (title) {
        query += ` AND LOWER(title) LIKE ?`;
        params.push('%' + title.toLowerCase() + '%');
    }

    if (subject) {
        query += ` AND LOWER(subject) = ?`;
        params.push(subject.toLowerCase());
    }
    query += ` ORDER BY title LIMIT ? OFFSET ?`;
    params.push(Number(limit), Number(offset));

    try {
        const [rows] = await db.query(query, params);
        if (!rows || rows.length === 0) {
            return res.json({ message: 'Inga böcker hittades' });
        }
        res.json(rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Serverfel vid bokhämtning' });
    }
});

module.exports = router;
