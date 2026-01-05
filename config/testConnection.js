const pool = require('./db');

async function testConnection() {
  try {
    console.log('Testing database connection...');

    // Get a connection from the pool
    const connection = await pool.getConnection();
    console.log('✓ Successfully connected to MySQL database!');

    // Test a simple query
    const [rows] = await connection.query('SELECT 1 + 1 AS result');
    console.log('✓ Test query successful:', rows[0]);

    // Check if book_store database exists and is selected
    const [dbResult] = await connection.query('SELECT DATABASE() as db');
    console.log('✓ Connected to database:', dbResult[0].db);

    // List all tables in the database
    const [tables] = await connection.query('SHOW TABLES');
    console.log('✓ Tables in database:', tables.length > 0 ? tables : 'No tables found');

    // Release the connection back to the pool
    connection.release();

    // Close the pool
    
    await pool.end();
    console.log('✓ Connection closed successfully');

  } catch (error) {
    console.error('✗ Database connection failed:');
    console.error('Error:', error.message);

    if (error.code === 'ER_ACCESS_DENIED_ERROR') {
      console.error('\nCheck your credentials in .env file:');
      console.error('- DB_USER');
      console.error('- DB_PASSWORD');
    } else if (error.code === 'ER_BAD_DB_ERROR') {
      console.error('\nDatabase "book_store" does not exist.');
      console.error('Create it first in MySQL Workbench or run:');
      console.error('CREATE DATABASE book_store;');
    } else if (error.code === 'ECONNREFUSED') {
      console.error('\nMySQL server is not running or not accessible.');
      console.error('Make sure MySQL is running on localhost:3306');
    }

    process.exit(1);
  }
}

testConnection();
