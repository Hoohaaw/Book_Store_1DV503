// db.test.js
const Database = require('better-sqlite3');

// skapa en in-memory databas
const db = new Database(':memory:');

// skapa tabeller (enkelt schema som liknar ditt)
db.exec(`
  CREATE TABLE members (
    userid INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT UNIQUE,
    password TEXT,
    fname TEXT,
    lname TEXT,
    address TEXT,
    city TEXT,
    zip INTEGER,
    phone TEXT
  );

  CREATE TABLE books (
    isbn TEXT PRIMARY KEY,
    title TEXT,
    author TEXT,
    subject TEXT,
    price REAL
  );
`);

// lägg in testdata
const insertBook = db.prepare('INSERT INTO books (isbn, title, author, subject, price) VALUES (?, ?, ?, ?, ?)');
insertBook.run('0000000001', 'Testbok', 'Författare', 'Humour', 99.9);

const insertMember = db.prepare('INSERT INTO members (email, password, fname, lname) VALUES (?, ?, ?, ?)');
insertMember.run('test@example.com', 'hashedpw', 'Test', 'User');

// kör en enkel query
const rows = db.prepare('SELECT 1 + 1 AS result').all();
console.log('DB test:', rows); // [{ result: 2 }]

// exempel: hämta böcker
const books = db.prepare('SELECT * FROM books').all();
console.log('Books:', books);

// stäng db (better-sqlite3 stänger när processen avslutas, men vi kan explicit)
db.close();
