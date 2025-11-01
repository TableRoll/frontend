#!/usr/bin/env node

// Database inspection script
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const checkDatabase = async () => {
  const dbPath = path.join(__dirname, 'dnd_campaign.db');
  
  console.log('🔍 Inspecting SQLite database...\n');
  console.log('=' .repeat(80));
  
  const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
      console.error('❌ Failed to connect to database:', err.message);
      process.exit(1);
    }
  });

  // Get all tables
  const tables = await new Promise((resolve, reject) => {
    db.all(`
      SELECT name FROM sqlite_master 
      WHERE type='table' 
      AND name NOT LIKE 'sqlite_%'
      ORDER BY name
    `, (err, rows) => {
      if (err) reject(err);
      else resolve(rows);
    });
  });

  console.log(`📊 Found ${tables.length} tables in the database:\n`);

  // Check each table for content
  const tableStats = [];
  
  for (const table of tables) {
    const tableName = table.name;
    
    // Get row count
    const count = await new Promise((resolve, reject) => {
      db.get(`SELECT COUNT(*) as count FROM ${tableName}`, (err, row) => {
        if (err) reject(err);
        else resolve(row.count);
      });
    });
    
    tableStats.push({ name: tableName, count });
  }

  // Display results
  console.log('┌─────────────────────────────────────┬───────────┬────────────┐');
  console.log('│ Table Name                          │ Row Count │ Has Data?  │');
  console.log('├─────────────────────────────────────┼───────────┼────────────┤');
  
  tableStats.forEach(({ name, count }) => {
    const hasData = count > 0 ? '✅ Yes' : '❌ No';
    const paddedName = name.padEnd(35);
    const paddedCount = count.toString().padStart(9);
    console.log(`│ ${paddedName} │ ${paddedCount} │ ${hasData.padEnd(10)} │`);
  });
  
  console.log('└─────────────────────────────────────┴───────────┴────────────┘');
  console.log();

  // Check if maps table has data and show first item
  const mapsCount = tableStats.find(t => t.name === 'maps')?.count || 0;
  
  if (mapsCount > 0) {
    console.log('\n' + '='.repeat(80));
    console.log('🗺️  MAPS TABLE - First Item:');
    console.log('='.repeat(80));
    
    const firstMap = await new Promise((resolve, reject) => {
      db.get('SELECT * FROM maps LIMIT 1', (err, row) => {
        if (err) reject(err);
        else resolve(row);
      });
    });
    
    if (firstMap) {
      console.log(JSON.stringify(firstMap, null, 2));
    }
  } else {
    console.log('\n⚠️  Maps table is empty - no map data to display');
  }

  // Summary
  console.log('\n' + '='.repeat(80));
  console.log('📈 DATABASE SUMMARY:');
  console.log('='.repeat(80));
  
  const totalTables = tableStats.length;
  const tablesWithData = tableStats.filter(t => t.count > 0).length;
  const totalRows = tableStats.reduce((sum, t) => sum + t.count, 0);
  
  console.log(`Total Tables: ${totalTables}`);
  console.log(`Tables with Data: ${tablesWithData} (${((tablesWithData/totalTables)*100).toFixed(1)}%)`);
  console.log(`Tables without Data: ${totalTables - tablesWithData}`);
  console.log(`Total Rows: ${totalRows}`);
  console.log();
  
  // List tables without data
  const emptyTables = tableStats.filter(t => t.count === 0);
  if (emptyTables.length > 0) {
    console.log('📋 Empty Tables:');
    emptyTables.forEach(t => console.log(`   - ${t.name}`));
    console.log();
  }

  // Close database
  db.close((err) => {
    if (err) {
      console.error('Error closing database:', err.message);
    }
    console.log('✅ Database inspection complete!\n');
  });
};

// Run check
checkDatabase().catch(err => {
  console.error('❌ Error:', err.message);
  process.exit(1);
});

