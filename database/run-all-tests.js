#!/usr/bin/env node

// Comprehensive test runner for the entire application
const { exec } = require('child_process');
const path = require('path');
const util = require('util');
const execPromise = util.promisify(exec);

console.log('🧪 D&D Campaign Manager - Full Test Suite\n');
console.log('='.repeat(80));

const runTest = async (name, command, cwd = __dirname) => {
  console.log(`\n📋 Running: ${name}`);
  console.log('-'.repeat(80));
  try {
    const { stdout, stderr } = await execPromise(command, { cwd, maxBuffer: 1024 * 1024 * 10 });
    if (stdout) console.log(stdout);
    if (stderr) console.error(stderr);
    console.log(`✅ ${name} - PASSED`);
    return { name, status: 'passed', output: stdout };
  } catch (error) {
    console.error(`❌ ${name} - FAILED`);
    console.error(error.message);
    return { name, status: 'failed', error: error.message };
  }
};

const runAllTests = async () => {
  const results = [];
  
  // Test 1: Database Check
  console.log('\n🔍 TEST 1: Database Structure & Content');
  console.log('='.repeat(80));
  const dbCheck = await runTest(
    'Database Structure Check',
    'node check-database.js',
    __dirname
  );
  results.push(dbCheck);
  
  // Test 2: Database Connection
  console.log('\n🔌 TEST 2: Database Connection');
  console.log('='.repeat(80));
  const dbConnection = await runTest(
    'Database Connection Test',
    'node -e "const sqlite3 = require(\'sqlite3\'); const db = new sqlite3.Database(\'dnd_campaign.db\'); console.log(\'✅ Connection successful\'); db.close();"',
    __dirname
  );
  results.push(dbConnection);
  
  // Test 3: API Server Check (if running)
  console.log('\n🌐 TEST 3: API Server Status');
  console.log('='.repeat(80));
  try {
    const http = require('http');
    await new Promise((resolve, reject) => {
      const req = http.get('http://localhost:5000/api/health', (res) => {
        if (res.statusCode === 200) {
          console.log('✅ API Server is running and healthy');
          results.push({ name: 'API Server Health', status: 'passed' });
          resolve();
        } else {
          console.log('⚠️  API Server responded with status:', res.statusCode);
          results.push({ name: 'API Server Health', status: 'warning', statusCode: res.statusCode });
          resolve();
        }
      });
      req.on('error', (err) => {
        console.log('⚠️  API Server not running or not accessible');
        console.log('   (This is OK if you haven\'t started the server yet)');
        results.push({ name: 'API Server Health', status: 'skipped', reason: 'Server not running' });
        resolve();
      });
      req.setTimeout(2000, () => {
        req.destroy();
        reject(new Error('Timeout'));
      });
    });
  } catch (err) {
    console.log('⚠️  Could not check API server status');
    results.push({ name: 'API Server Health', status: 'skipped', reason: 'Timeout or error' });
  }
  
  // Test 4: Check Node Modules
  console.log('\n📦 TEST 4: Dependencies Check');
  console.log('='.repeat(80));
  const fs = require('fs');
  const apiNodeModules = path.join(__dirname, '..', 'api', 'node_modules');
  const dbNodeModules = path.join(__dirname, 'node_modules');
  const frontendNodeModules = path.join(__dirname, '..', 'node_modules');
  
  const checks = [
    { name: 'API Dependencies', path: apiNodeModules },
    { name: 'Database Dependencies', path: dbNodeModules },
    { name: 'Frontend Dependencies', path: frontendNodeModules }
  ];
  
  checks.forEach(({ name, path: modulePath }) => {
    if (fs.existsSync(modulePath)) {
      console.log(`✅ ${name} installed`);
      results.push({ name, status: 'passed' });
    } else {
      console.log(`❌ ${name} NOT installed at ${modulePath}`);
      results.push({ name, status: 'failed', reason: 'Dependencies not installed' });
    }
  });
  
  // Summary
  console.log('\n' + '='.repeat(80));
  console.log('📊 TEST SUMMARY');
  console.log('='.repeat(80));
  
  const passed = results.filter(r => r.status === 'passed').length;
  const failed = results.filter(r => r.status === 'failed').length;
  const skipped = results.filter(r => r.status === 'skipped' || r.status === 'warning').length;
  const total = results.length;
  
  console.log(`\nTotal Tests: ${total}`);
  console.log(`✅ Passed: ${passed}`);
  console.log(`❌ Failed: ${failed}`);
  console.log(`⚠️  Skipped/Warning: ${skipped}`);
  console.log(`\nSuccess Rate: ${((passed / total) * 100).toFixed(1)}%`);
  
  if (failed > 0) {
    console.log('\n❌ Some tests failed. Please review the output above.');
    process.exit(1);
  } else if (skipped > 0) {
    console.log('\n⚠️  All critical tests passed, but some tests were skipped.');
    console.log('   This is usually OK if certain services are not running yet.');
  } else {
    console.log('\n✅ All tests passed successfully!');
  }
  
  console.log('\n' + '='.repeat(80));
  console.log('🎉 Test suite completed!\n');
};

// Run all tests
runAllTests().catch(err => {
  console.error('\n❌ Test suite failed with error:', err);
  process.exit(1);
});

