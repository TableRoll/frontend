#!/usr/bin/env node

// SQLite setup script for quick testing
const sqlite3 = require('sqlite3').verbose();
const fs = require('fs');
const path = require('path');

const setupSQLiteDatabase = async () => {
  const dbPath = path.join(__dirname, 'dnd_campaign.db');
  
  try {
    // Remove existing database if it exists
    if (fs.existsSync(dbPath)) {
      fs.unlinkSync(dbPath);
    }

    console.log('📦 Creating SQLite database...');
    const db = new sqlite3.Database(dbPath);

    // Enable foreign keys
    await new Promise((resolve, reject) => {
      db.run('PRAGMA foreign_keys = ON', (err) => {
        if (err) reject(err);
        else resolve();
      });
    });

    // Read and execute schema
    const schemaPath = path.join(__dirname, 'migrations', '001_initial_schema.sql');
    const schemaSQL = fs.readFileSync(schemaPath, 'utf8');
    
    // Convert PostgreSQL syntax to SQLite
    const sqliteSchema = schemaSQL
      .replace(/UUID PRIMARY KEY DEFAULT uuid_generate_v4\(\)/g, 'INTEGER PRIMARY KEY AUTOINCREMENT')
      .replace(/VARCHAR\(\d+\)/g, 'TEXT')
      .replace(/TIMESTAMP WITH TIME ZONE DEFAULT NOW\(\)/g, 'DATETIME DEFAULT CURRENT_TIMESTAMP')
      .replace(/BOOLEAN DEFAULT/g, 'INTEGER DEFAULT')
      .replace(/JSONB/g, 'TEXT')
      .replace(/DECIMAL\(\d+,\d+\)/g, 'REAL')
      .replace(/BIGINT/g, 'INTEGER')
      .replace(/GENERATED ALWAYS AS.*STORED/g, '') // Remove generated columns
      .replace(/CREATE EXTENSION IF NOT EXISTS.*;/g, '') // Remove extensions
      .replace(/CREATE OR REPLACE FUNCTION.*\$\$.*\$\$ language 'plpgsql';/gs, '') // Remove functions
      .replace(/CREATE TRIGGER.*EXECUTE FUNCTION.*;/g, '') // Remove triggers
      .split(';')
      .filter(sql => sql.trim().length > 0);

    for (const sql of sqliteSchema) {
      if (sql.trim()) {
        await new Promise((resolve, reject) => {
          db.run(sql, (err) => {
            if (err) {
              console.warn('Warning:', err.message);
              console.warn('SQL:', sql.substring(0, 100) + '...');
            }
            resolve();
          });
        });
      }
    }

    console.log('✅ Database schema created successfully');

    // Read and execute seed data
    const seedPath = path.join(__dirname, 'migrations', '002_seed_data.sql');
    const seedSQL = fs.readFileSync(seedPath, 'utf8');
    
    // Convert PostgreSQL syntax to SQLite
    const sqliteSeed = seedSQL
      .replace(/uuid_generate_v4\(\)/g, 'NULL') // Will be auto-generated
      .replace(/NOW\(\)/g, 'CURRENT_TIMESTAMP')
      .split(';')
      .filter(sql => sql.trim().length > 0);

    for (const sql of sqliteSeed) {
      if (sql.trim()) {
        await new Promise((resolve, reject) => {
          db.run(sql, (err) => {
            if (err) {
              console.warn('Warning:', err.message);
              console.warn('SQL:', sql.substring(0, 100) + '...');
            }
            resolve();
          });
        });
      }
    }

    console.log('✅ Seed data inserted successfully');

    // Close database
    await new Promise((resolve, reject) => {
      db.close((err) => {
        if (err) reject(err);
        else resolve();
      });
    });

    console.log('🎉 SQLite database setup completed successfully!');
    console.log(`📁 Database file: ${dbPath}`);
    console.log('\n📋 Next steps:');
    console.log('1. Update your API to use SQLite instead of PostgreSQL');
    console.log('2. Start your application server');
    console.log('3. The database is ready for use!');

  } catch (err) {
    console.error('❌ SQLite setup failed:', err.message);
    process.exit(1);
  }
};

// Run setup
setupSQLiteDatabase();
