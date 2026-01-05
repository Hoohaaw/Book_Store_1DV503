// Global "middleware"-wrapper för try/catch på async routes.
// Läggs direkt på varje route/metod i route-filen.
// Fångar async-fel och skickar dem till Express error handler i server.js.
const asyncHandler = fn => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

module.exports = asyncHandler;