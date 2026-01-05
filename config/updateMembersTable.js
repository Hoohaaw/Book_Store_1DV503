const pool = require('./db');

async function updateMembersTable() {
  try {
    console.log('Adding missing columns to members table...');

    // Add fname column
    try {
      await pool.query('ALTER TABLE members ADD COLUMN fname VARCHAR(100) AFTER UserId');
      console.log('✓ Added fname column');
    } catch (e) {
      if (e.code !== 'ER_DUP_FIELDNAME') throw e;
      console.log('- fname column already exists');
    }

    // Add lname column
    try {
      await pool.query('ALTER TABLE members ADD COLUMN lname VARCHAR(100) AFTER fname');
      console.log('✓ Added lname column');
    } catch (e) {
      if (e.code !== 'ER_DUP_FIELDNAME') throw e;
      console.log('- lname column already exists');
    }

    // Add address column
    try {
      await pool.query('ALTER TABLE members ADD COLUMN address VARCHAR(255) AFTER lname');
      console.log('✓ Added address column');
    } catch (e) {
      if (e.code !== 'ER_DUP_FIELDNAME') throw e;
      console.log('- address column already exists');
    }

    // Add city column
    try {
      await pool.query('ALTER TABLE members ADD COLUMN city VARCHAR(100) AFTER address');
      console.log('✓ Added city column');
    } catch (e) {
      if (e.code !== 'ER_DUP_FIELDNAME') throw e;
      console.log('- city column already exists');
    }

    // Add zip column
    try {
      await pool.query('ALTER TABLE members ADD COLUMN zip VARCHAR(10) AFTER city');
      console.log('✓ Added zip column');
    } catch (e) {
      if (e.code !== 'ER_DUP_FIELDNAME') throw e;
      console.log('- zip column already exists');
    }

    // Add phone column
    try {
      await pool.query('ALTER TABLE members ADD COLUMN phone VARCHAR(20) AFTER zip');
      console.log('✓ Added phone column');
    } catch (e) {
      if (e.code !== 'ER_DUP_FIELDNAME') throw e;
      console.log('- phone column already exists');
    }

    // Verify the changes
    const [columns] = await pool.query('DESCRIBE members');
    console.log('\nUpdated members table structure:');
    console.table(columns);

    await pool.end();
    console.log('\n✓ Members table updated successfully!');
  } catch (error) {
    console.error('Error updating table:', error);
    process.exit(1);
  }
}

updateMembersTable();
