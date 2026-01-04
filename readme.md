Vad som lades till
config/db.js

Exporterar en mysql2/promise pool och läser anslutningsvärden från .env.

config/db.test.js

Enkel testfil som kör SELECT 1 + 1 mot poolen, loggar resultat eller fel och stänger poolen med await pool.end().

In‑memory SQLite test (db.test.js)

Valfritt test som använder better-sqlite3 för att skapa en temporär databas i minnet, skapa tabeller, lägga in testdata och köra queries.

package.json

Flyttade better-sqlite3 till devDependencies. Lagt till scripts för start och DB‑test.

fixade ett till test, läser in books_new.sql och sen listar den 2 random böcker, gör köra med node ./config/import-and-sample.js
skulle bara testa så vi kunde läsa in filen och att det funkade.