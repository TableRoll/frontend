const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// SQLite database configuration
const dbPath = path.join(__dirname, '../../database/dnd_campaign.db');

// Create database connection
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('❌ SQLite connection failed:', err.message);
  } else {
    console.log('✅ SQLite database connected successfully');
  }
});

// Enable foreign keys
db.run('PRAGMA foreign_keys = ON');

// Test database connection
const testConnection = async () => {
  return new Promise((resolve) => {
    db.get('SELECT 1 as test', (err, row) => {
      if (err) {
        console.error('❌ Database connection test failed:', err.message);
        resolve(false);
      } else {
        console.log('✅ Database connection test successful');
        resolve(true);
      }
    });
  });
};

// Database query helper
const query = async (text, params = []) => {
  const start = Date.now();
  return new Promise((resolve, reject) => {
    if (text.trim().toUpperCase().startsWith('SELECT')) {
      db.all(text, params, (err, rows) => {
        const duration = Date.now() - start;
        if (err) {
          console.error('Query error', { text: text.substring(0, 100) + '...', err: err.message });
          reject(err);
        } else {
          console.log('Query executed', { text: text.substring(0, 100) + '...', duration, rows: rows.length });
          resolve({ rows, rowCount: rows.length });
        }
      });
    } else {
      db.run(text, params, function(err) {
        const duration = Date.now() - start;
        if (err) {
          console.error('Query error', { text: text.substring(0, 100) + '...', err: err.message });
          reject(err);
        } else {
          console.log('Query executed', { text: text.substring(0, 100) + '...', duration, rows: this.changes });
          resolve({ rows: [], rowCount: this.changes, lastID: this.lastID });
        }
      });
    }
  });
};

// Transaction helper
const transaction = async (callback) => {
  return new Promise((resolve, reject) => {
    db.serialize(() => {
      db.run('BEGIN TRANSACTION');
      
      callback({
        query: (text, params) => query(text, params),
        run: (text, params) => query(text, params)
      }).then((result) => {
        db.run('COMMIT', (err) => {
          if (err) {
            reject(err);
          } else {
            resolve(result);
          }
        });
      }).catch((err) => {
        db.run('ROLLBACK', (rollbackErr) => {
          if (rollbackErr) {
            console.error('Rollback error:', rollbackErr.message);
          }
          reject(err);
        });
      });
    });
  });
};

// Close database connection
const closeConnection = async () => {
  return new Promise((resolve) => {
    db.close((err) => {
      if (err) {
        console.error('Error closing database:', err.message);
      } else {
        console.log('Database connection closed');
      }
      resolve();
    });
  });
};

module.exports = {
  db,
  query,
  transaction,
  testConnection,
  closeConnection
};
