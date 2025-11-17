#!/usr/bin/env node

/**
 * Diagnostic script to test map image loading issues
 * Run with: node test-map-image-loading.js
 */

const fs = require('fs');
const path = require('path');

console.log('=== Map Image Loading Diagnostic ===\n');

// 1. Check if uploads directory exists
const uploadPath = process.env.UPLOAD_PATH || './uploads';
const uploadsDir = path.join(__dirname, 'api', uploadPath.replace('./', ''));

console.log('1. Checking uploads directory...');
console.log('   Path:', uploadsDir);

if (fs.existsSync(uploadsDir)) {
  console.log('   ✓ Uploads directory exists');
  
  // List files in uploads
  try {
    const files = fs.readdirSync(uploadsDir);
    console.log(`   ✓ Found ${files.length} files in uploads directory`);
    
    if (files.length > 0) {
      console.log('   Files:');
      files.slice(0, 5).forEach(file => {
        const filePath = path.join(uploadsDir, file);
        const stats = fs.statSync(filePath);
        console.log(`     - ${file} (${(stats.size / 1024).toFixed(2)} KB)`);
      });
      if (files.length > 5) {
        console.log(`     ... and ${files.length - 5} more`);
      }
    } else {
      console.log('   ⚠ No files found in uploads directory');
    }
  } catch (err) {
    console.log('   ✗ Error reading uploads directory:', err.message);
  }
} else {
  console.log('   ✗ Uploads directory does not exist!');
  console.log('   Creating uploads directory...');
  try {
    fs.mkdirSync(uploadsDir, { recursive: true });
    console.log('   ✓ Uploads directory created');
  } catch (err) {
    console.log('   ✗ Failed to create uploads directory:', err.message);
  }
}

console.log();

// 2. Check database for maps and assets
console.log('2. Checking database for maps with assets...');

const dbPath = path.join(__dirname, 'database', 'dnd_campaign.db');
console.log('   Database path:', dbPath);

if (fs.existsSync(dbPath)) {
  console.log('   ✓ Database file exists');
  
  try {
    const Database = require('better-sqlite3');
    const db = new Database(dbPath);
    
    // Check maps
    const maps = db.prepare('SELECT * FROM maps').all();
    console.log(`   ✓ Found ${maps.length} maps in database`);
    
    if (maps.length > 0) {
      maps.forEach((map, idx) => {
        console.log(`\n   Map ${idx + 1}:`);
        console.log(`     - ID: ${map.id}`);
        console.log(`     - Name: ${map.name}`);
        console.log(`     - Asset ID: ${map.asset_id || 'None'}`);
        console.log(`     - Campaign ID: ${map.campaign_id || 'None'}`);
        console.log(`     - Dimensions: ${map.width_px}x${map.height_px}px`);
        
        // Check if asset exists
        if (map.asset_id) {
          const asset = db.prepare('SELECT * FROM assets WHERE id = ?').get(map.asset_id);
          if (asset) {
            console.log(`     - Asset found:`);
            console.log(`       • Name: ${asset.name}`);
            console.log(`       • File path: ${asset.file_path}`);
            console.log(`       • Type: ${asset.asset_type}`);
            
            // Check if file exists
            const assetFilePath = path.isAbsolute(asset.file_path)
              ? asset.file_path
              : path.join(__dirname, 'api', asset.file_path);
            
            if (fs.existsSync(assetFilePath)) {
              const stats = fs.statSync(assetFilePath);
              console.log(`       • File exists ✓ (${(stats.size / 1024).toFixed(2)} KB)`);
            } else {
              console.log(`       • File NOT FOUND ✗`);
              console.log(`       • Expected at: ${assetFilePath}`);
            }
          } else {
            console.log(`     - Asset NOT FOUND in database ✗`);
          }
        }
      });
    }
    
    db.close();
  } catch (err) {
    console.log('   ✗ Error reading database:', err.message);
    console.log('   Tip: Run "npm install" in the database directory if better-sqlite3 is missing');
  }
} else {
  console.log('   ✗ Database file does not exist!');
  console.log('   Run database setup first: cd database && npm run setup');
}

console.log();

// 3. Check API server configuration
console.log('3. Checking API server configuration...');

const apiEnvPath = path.join(__dirname, 'api', '.env');
const rootEnvPath = path.join(__dirname, '.env');

if (fs.existsSync(apiEnvPath)) {
  console.log('   ✓ API .env file exists');
} else {
  console.log('   ⚠ API .env file not found (using defaults)');
}

if (fs.existsSync(rootEnvPath)) {
  console.log('   ✓ Root .env file exists');
} else {
  console.log('   ⚠ Root .env file not found (using defaults)');
}

console.log();

// 4. Provide recommendations
console.log('4. Recommendations:');
console.log();
console.log('   To fix map image loading issues:');
console.log();
console.log('   a) Make sure the API server is running:');
console.log('      cd api && npm start');
console.log();
console.log('   b) Check browser console for errors:');
console.log('      - Open browser DevTools (F12)');
console.log('      - Look for errors related to map image loading');
console.log('      - Check Network tab for failed image requests');
console.log();
console.log('   c) Verify the image URL format:');
console.log('      - Should be: http://localhost:3001/api/assets/file/{asset-id}?token=...');
console.log('      - Check if the URL returns 401 (auth issue) or 404 (file not found)');
console.log();
console.log('   d) Test image loading directly:');
console.log('      - Copy the image URL from the console');
console.log('      - Paste it in a new browser tab');
console.log('      - See if the image loads or what error you get');
console.log();

console.log('=== End of Diagnostic ===\n');






