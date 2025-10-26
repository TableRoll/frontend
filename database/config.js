// Database configuration for D&D Campaign Management System
const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

// Database configuration
const dbConfig = {
  user: process.env.DB_USER || 'postgres',
  host: process.env.DB_HOST || 'localhost',
  database: process.env.DB_NAME || 'dnd_campaign_db',
  password: process.env.DB_PASSWORD || 'password',
  port: process.env.DB_PORT || 5432,
  max: 20, // Maximum number of clients in the pool
  idleTimeoutMillis: 30000, // Close idle clients after 30 seconds
  connectionTimeoutMillis: 2000, // Return an error after 2 seconds if connection could not be established
};

// Create connection pool
const pool = new Pool(dbConfig);

// Test database connection
const testConnection = async () => {
  try {
    const client = await pool.connect();
    console.log('✅ Database connected successfully');
    client.release();
    return true;
  } catch (err) {
    console.error('❌ Database connection failed:', err.message);
    return false;
  }
};

// Run migrations
const runMigrations = async () => {
  try {
    const client = await pool.connect();
    
    // Read migration files
    const migrationFiles = [
      '001_initial_schema.sql',
      '002_seed_data.sql'
    ];
    
    for (const file of migrationFiles) {
      const migrationPath = path.join(__dirname, 'migrations', file);
      const migrationSQL = fs.readFileSync(migrationPath, 'utf8');
      
      console.log(`🔄 Running migration: ${file}`);
      await client.query(migrationSQL);
      console.log(`✅ Migration completed: ${file}`);
    }
    
    client.release();
    console.log('🎉 All migrations completed successfully');
  } catch (err) {
    console.error('❌ Migration failed:', err.message);
    throw err;
  }
};

// Database query helper
const query = async (text, params) => {
  const start = Date.now();
  try {
    const res = await pool.query(text, params);
    const duration = Date.now() - start;
    console.log('Query executed', { text, duration, rows: res.rowCount });
    return res;
  } catch (err) {
    console.error('Query error', { text, err: err.message });
    throw err;
  }
};

// Close database connection
const closeConnection = async () => {
  await pool.end();
  console.log('Database connection closed');
};

module.exports = {
  pool,
  query,
  testConnection,
  runMigrations,
  closeConnection
};
