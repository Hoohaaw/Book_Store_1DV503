Vad som lades till
config/db.js

Exporterar en mysql2/promise pool och läser anslutningsvärden från .env.

config/db.test.js

Enkel testfil som kör SELECT 1 + 1 mot poolen, loggar resultat eller fel och stänger poolen med await pool.end().

In‑memory SQLite test (db.test.js)

Valfritt test som använder better-sqlite3 för att skapa en temporär databas i minnet, skapa tabeller, lägga in testdata och köra queries.

package.json

Flyttade better-sqlite3 till devDependencies. Lagt till scripts för start och DB‑test.