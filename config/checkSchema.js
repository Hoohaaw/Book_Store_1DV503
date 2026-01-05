const pool = require('./db');

async function checkSchema() {
  try {
    const [columns] = await pool.query('DESCRIBE members');
    console.log('Members table columns:');
    console.table(columns);
    await pool.end();
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

checkSchema();
