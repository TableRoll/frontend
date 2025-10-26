#!/usr/bin/env node

// Database setup script for D&D Campaign Management System
const { Client } = require('pg');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const setupDatabase = async () => {
  // Connect to PostgreSQL server (not to a specific database)
  const client = new Client({
    user: process.env.DB_USER || 'postgres',
    host: process.env.DB_HOST || 'localhost',
    password: process.env.DB_PASSWORD || 'password',
    port: process.env.DB_PORT || 5432,
  });

  try {
    await client.connect();
    console.log('🔌 Connected to PostgreSQL server');

    // Check if database exists
    const dbName = process.env.DB_NAME || 'dnd_campaign_db';
    const result = await client.query(
      'SELECT 1 FROM pg_database WHERE datname = $1',
      [dbName]
    );

    if (result.rows.length === 0) {
      // Create database
      console.log(`📦 Creating database: ${dbName}`);
      await client.query(`CREATE DATABASE ${dbName}`);
      console.log(`✅ Database '${dbName}' created successfully`);
    } else {
      console.log(`✅ Database '${dbName}' already exists`);
    }

    // Close connection to create new one to the specific database
    await client.end();

    // Now connect to the specific database and run migrations
    const dbClient = new Client({
      user: process.env.DB_USER || 'postgres',
      host: process.env.DB_HOST || 'localhost',
      database: dbName,
      password: process.env.DB_PASSWORD || 'password',
      port: process.env.DB_PORT || 5432,
    });

    await dbClient.connect();
    console.log(`🔌 Connected to database: ${dbName}`);

    // Run migrations
    const migrationFiles = [
      '001_initial_schema.sql',
      '002_seed_data.sql'
    ];

    for (const file of migrationFiles) {
      const migrationPath = path.join(__dirname, 'migrations', file);
      if (fs.existsSync(migrationPath)) {
        const migrationSQL = fs.readFileSync(migrationPath, 'utf8');
        console.log(`🔄 Running migration: ${file}`);
        await dbClient.query(migrationSQL);
        console.log(`✅ Migration completed: ${file}`);
      } else {
        console.log(`⚠️  Migration file not found: ${file}`);
      }
    }

    await dbClient.end();
    console.log('🎉 Database setup completed successfully!');
    console.log('\n📋 Next steps:');
    console.log('1. Update your .env file with database credentials');
    console.log('2. Start your application server');
    console.log('3. The database is ready for use!');

  } catch (err) {
    console.error('❌ Database setup failed:', err.message);
    process.exit(1);
  }
};

// Run setup
setupDatabase();
