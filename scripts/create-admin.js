const { Pool } = require('pg');
const bcrypt = require('bcryptjs');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

async function createAdmin() {
  if (!process.env.DATABASE_URL || process.env.DATABASE_URL.includes('USER:PASSWORD')) {
    console.error('Error: Please set a valid DATABASE_URL in your .env file first.');
    process.exit(1);
  }

  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
  });

  const email = 'admin@rewoven.org';
  const password = 'admin';

  try {
    console.log(`Checking if admin user '${email}' exists...`);
    const existing = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    
    if (existing.rows.length > 0) {
      console.log('Admin user already exists!');
      process.exit(0);
    }

    console.log('Hashing password...');
    const passwordHash = await bcrypt.hash(password, 12);

    console.log('Creating user in DB...');
    const userRes = await pool.query(
      'INSERT INTO users (id, email, password_hash) VALUES (gen_random_uuid(), $1, $2) RETURNING id',
      [email, passwordHash]
    );
    const userId = userRes.rows[0].id;

    console.log('Creating admin profile...');
    await pool.query(
      `INSERT INTO profiles (id, user_type, name, contact_person, email, address, city, state, pincode)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
      [userId, 'admin', 'Platform Admin', 'Admin', email, 'Admin Office', 'Mumbai', 'Maharashtra', '400001']
    );

    console.log(`✅ Admin successfully created!`);
    console.log(`Email: ${email}`);
    console.log(`Password: ${password}`);

  } catch (error) {
    console.error('❌ Error creating admin:', error.message);
  } finally {
    await pool.end();
  }
}

createAdmin();
