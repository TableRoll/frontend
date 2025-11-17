const express = require('express');
const router = express.Router();
const { query } = require('../config/database');
const { authenticateToken } = require('../middleware/auth');

// Get database statistics
router.get('/stats', authenticateToken, async (req, res) => {
  try {
    // Query counts for each table
    const tableNames = [
      'users',
      'campaigns',
      'characters',
      'character_inventory',
      'assets',
      'maps',
      'tokens',
      'races',
      'classes',
      'backgrounds',
      'item_types',
      'inventory_items',
      'sessions',
      'session_participants',
      'combat_sessions',
      'combat_participants'
    ];

    const tableStats = await Promise.all(
      tableNames.map(async (tableName) => {
        try {
          const result = await query(`SELECT COUNT(*) as count FROM ${tableName}`);
          const count = parseInt(result.rows[0].count, 10);
          return {
            name: tableName,
            count,
            hasData: count > 0
          };
        } catch (err) {
          // If table doesn't exist or query fails, return 0
          console.warn(`Failed to query table ${tableName}:`, err.message);
          return {
            name: tableName,
            count: 0,
            hasData: false
          };
        }
      })
    );

    // Calculate summary stats
    const totalTables = tableStats.length;
    const tablesWithData = tableStats.filter(t => t.hasData).length;
    const totalRows = tableStats.reduce((sum, t) => sum + t.count, 0);
    const emptyTables = tableStats.filter(t => !t.hasData).map(t => t.name);

    res.json({
      success: true,
      stats: {
        tables: tableStats,
        totalTables,
        tablesWithData,
        totalRows,
        emptyTables
      }
    });
  } catch (error) {
    console.error('Error fetching database stats:', error);
    res.status(500).json({
      error: 'Failed to fetch database statistics'
    });
  }
});

module.exports = router;

