const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

async function applySchema() {
  if (!process.env.DATABASE_URL || process.env.DATABASE_URL.includes('USER:PASSWORD')) {
    console.error('Error: Please set a valid DATABASE_URL in your .env file first.');
    process.exit(1);
  }

  console.log('Connecting to database...');
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
  });

  try {
    const schemaPath = path.join(__dirname, 'neon_schema.sql');
    console.log(`Reading schema from ${schemaPath}...`);
    const schemaSql = fs.readFileSync(schemaPath, 'utf8');

    console.log('Applying schema...');
    await pool.query(schemaSql);
    
    console.log('✅ Schema successfully applied to Neon Postgres!');
  } catch (error) {
    console.error('❌ Error applying schema:', error.message);
  } finally {
    await pool.end();
  }
}

applySchema();
