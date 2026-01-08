const express = require('express');
<<<<<<< HEAD
const router = express.Router();
=======
const Router = express.Router();
>>>>>>> 79be934922b1bbff67baf0576719aac081b5fa3b
const db = require('../../config/db');

//Search books
Router.get('/search', async (req, res) => {
    const { author, title, subject, page = 1, limit = 5} = req.query;
    const offset = (page - 1) * limit;
    let query = `SELECT * FROM books WHERE 1=1`;
    let params = [];
    let idx = 1;

    if (author) {
        query += ` AND LOWER(author_first_name) LIKE LOWER($${idx} || '%')`;
        params.push(author);
        idx++;
    }

    if (title) {
        query += ` AND LOWER(title) LIKE '%' || LOWER($${idx}) || '%'`;
        params.push(title);
        idx++;
    }

    if (subject) {
        query += ` AND LOWER(subject) = LOWER($${idx})`;
        params.push(subject);
        idx++;
    }
    query += ` ORDER BY title LIMIT $${idx} OFFSET $${idx +1}`;
    params.push(limit, offset);

    try {
        const { rows } = await db.query(query, params);
        if (rows.length === 0 ) {
            return res.json({ message: 'Inga böcker hittades'});
        }
        res.json(rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Serverfel vid bokhämtning' });
    }

<<<<<<< HEAD

module.exports = router;
})

=======
});

module.exports = Router;
>>>>>>> 79be934922b1bbff67baf0576719aac081b5fa3b
