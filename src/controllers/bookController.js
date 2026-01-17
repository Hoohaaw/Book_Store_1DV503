/**
 * @module bookController
 * @description Controller for handling book search operations.
 * @exports BookController
 */

const bookService = require('../service/bookService');

class BookController {
  /**
   * Search for books using query parameters.
   * @param {import('express').Request} req
   * @param {import('express').Response} res
   */
  async search(req, res) {
    try {
      const rawPage = Number(req.query.page) || 1;
      const rawLimit = Number(req.query.limit) || 5;
      const limit = Math.min(Math.max(rawLimit, 1), 50);
      const page = Math.max(rawPage, 1);

      const params = {
        author: req.query.author,
        title: req.query.title,
        subject: req.query.subject,
        page,
        limit
      };

      const result = await bookService.searchBooks(params);

      const totalPages = result && result.limit > 0
        ? Math.ceil(result.total / result.limit)
        : 0;

      res.json({
        items: (result && result.items) || [],
        page: (result && result.page) || page,
        limit: (result && result.limit) || limit,
        total: (result && result.total) || 0,
        totalPages
      });
    } catch (err) {
      console.error('BookController.search error:', err);
      res.status(500).json({ message: 'Server Error at book fetch' });
    }
  }
}

module.exports = new BookController();
