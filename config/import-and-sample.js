// import-and-sample.js
const fs = require('fs');
const Database = require('better-sqlite3');

try {
  // Läs SQL‑filen
  let sql = fs.readFileSync('books_new.sql', 'utf8');

  // Ta bort USE‑rad (MySQL‑specifik)
  sql = sql.replace(/^\s*USE\s+\w+;\s*/im, '');

  // Om INSERT utan kolumnnamn och tabellen inte finns, skapa enkel books‑tabell först
  // (kolumnordning: isbn, author, title, price, subject)
  const createTable = `
    CREATE TABLE IF NOT EXISTS books (
      isbn TEXT PRIMARY KEY,
      author TEXT,
      title TEXT,
      price REAL,
      subject TEXT
    );
  `;

  const db = new Database(':memory:');

  // Skapa tabell och kör import
  db.exec(createTable);
  db.exec(sql);

  // Hämta antal rader
  const countRow = db.prepare('SELECT COUNT(*) AS cnt FROM books').get();
  const total = countRow ? countRow.cnt : 0;

  if (total === 0) {
    console.log('Inga böcker hittades i importen.');
  } else {
    // Hämta två slumpmälla rader (om färre än 2, hämta alla)
    const limit = Math.min(2, total);
    // SQLite: ORDER BY RANDOM()
    const rows = db.prepare(`SELECT isbn, author, title, price, subject FROM books ORDER BY RANDOM() LIMIT ?`).all(limit);
    console.log(`Hämtade ${rows.length} slumpmälla bok(er):`);
    rows.forEach((r, i) => {
      console.log(`${i + 1}. ${r.title} — ${r.author} (ISBN: ${r.isbn}) ${r.price ? '‑ ' + r.price + ' SEK' : ''}`);
    });
  }

  db.close();
} catch (err) {
  console.error('Fel vid import eller läsning:', err.message);
  process.exit(1);
}
