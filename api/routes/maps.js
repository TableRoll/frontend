const express = require('express');const { body, validationResult } = require('express-validator');
const { query, transaction } = require('../config/database');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// Get all maps for a user
router.get('/', authenticateToken, async (req, res) => {
  try {
    const { campaignId } = req.query;
    
    // Maps are owned by users (owner_id) and can belong to campaigns (campaign_id)
    let queryText = `
      SELECT m.*, a.file_path as image_url, a.thumbnail_path, c.name as campaign_name
      FROM maps m
      LEFT JOIN assets a ON m.asset_id = a.id
      LEFT JOIN campaigns c ON m.campaign_id = c.id
      WHERE m.owner_id = $1
    `;
    const queryParams = [req.user.userId];

    if (campaignId) {
      queryParams.push(campaignId);
      queryText += ` AND m.campaign_id = $${queryParams.length}`;
    }

    queryText += ' ORDER BY m.created_at DESC';

    const result = await query(queryText, queryParams);

    res.json({
      maps: result.rows.map(m => ({
        id: m.id,
        name: m.name,
        description: m.description,
        campaignId: m.campaign_id,
        campaignName: m.campaign_name,
        assetId: m.asset_id,
        imageUrl: m.image_url,
        thumbnailPath: m.thumbnail_path,
        widthPx: m.width_px,
        heightPx: m.height_px,
        gridSize: m.grid_size,
        gridType: m.grid_type,
        isActive: m.is_active,
        createdAt: m.created_at,
        updatedAt: m.updated_at
      }))
    });

  } catch (error) {
    console.error('Get maps error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get single map by ID
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    
    // Check ownership directly on map
    const result = await query(`
      SELECT m.*, a.file_path as image_url, a.thumbnail_path, c.name as campaign_name
      FROM maps m
      LEFT JOIN assets a ON m.asset_id = a.id
      LEFT JOIN campaigns c ON m.campaign_id = c.id
      WHERE m.id = $1 AND m.owner_id = $2
    `, [id, req.user.userId]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Map not found' });
    }

    const m = result.rows[0];

    res.json({
      map: {
        id: m.id,
        name: m.name,
        description: m.description,
        campaignId: m.campaign_id,
        campaignName: m.campaign_name,
        assetId: m.asset_id,
        imageUrl: m.image_url,
        thumbnailPath: m.thumbnail_path,
        widthPx: m.width_px,
        heightPx: m.height_px,
        gridSize: m.grid_size,
        gridType: m.grid_type,
        isActive: m.is_active,
        createdAt: m.created_at,
        updatedAt: m.updated_at
      }
    });

  } catch (error) {
    console.error('Get map error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Create new map
router.post('/', authenticateToken, [
  body('name').isLength({ min: 1, max: 100 }).trim(),
  body('description').optional().isLength({ max: 1000 }).trim(),
  body('campaignId').optional().isUUID(),
  body('assetId').optional().isUUID(),
  body('widthPx').isInt({ min: 1 }),
  body('heightPx').isInt({ min: 1 }),
  body('gridSize').optional().isInt({ min: 1 }).default(50),
  body('gridType').optional().isIn(['square', 'hex']).default('square')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { name, description, campaignId, assetId, widthPx, heightPx, gridSize, gridType } = req.body;

    // Verify campaign exists and user has access (only if campaignId provided)
    if (campaignId) {
      const campaignCheck = await query(
        'SELECT id FROM campaigns WHERE id = $1 AND owner_id = $2',
        [campaignId, req.user.userId]
      );

      if (campaignCheck.rows.length === 0) {
        return res.status(404).json({ error: 'Campaign not found or access denied' });
      }
    }

    // If assetId provided, verify asset exists
    if (assetId) {
      const assetCheck = await query(
        'SELECT id FROM assets WHERE id = $1',
        [assetId]
      );

      if (assetCheck.rows.length === 0) {
        return res.status(404).json({ error: 'Asset not found' });
      }
    }

    // Maps have owner_id (user) and campaign_id (campaign)
    const result = await query(`
      INSERT INTO maps (name, description, campaign_id, asset_id, width_px, height_px, grid_size, grid_type, owner_id)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      RETURNING *
    `, [name, description || '', campaignId || null, assetId || null, widthPx, heightPx, gridSize || 50, gridType || 'square', req.user.userId]);

    const map = result.rows[0];

    res.status(201).json({
      message: 'Map created successfully',
      map: {
        id: map.id,
        name: map.name,
        description: map.description,
        campaignId: map.campaign_id,
        assetId: map.asset_id,
        widthPx: map.width_px,
        heightPx: map.height_px,
        gridSize: map.grid_size,
        gridType: map.grid_type,
        isActive: map.is_active,
        createdAt: map.created_at,
        updatedAt: map.updated_at
      }
    });

  } catch (error) {
    console.error('Create map error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update map
router.put('/:id', authenticateToken, [
  body('name').optional().isLength({ min: 1, max: 100 }).trim(),
  body('description').optional().isLength({ max: 1000 }).trim(),
  body('assetId').optional().isUUID(),
  body('gridSize').optional().isInt({ min: 1 }),
  body('gridType').optional().isIn(['square', 'hex']),
  body('isActive').optional().isBoolean()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { id } = req.params;
    const updates = req.body;

    // Check if map exists and belongs to user
    const existingMap = await query(`
      SELECT m.* FROM maps m
      WHERE m.id = $1 AND m.owner_id = $2
    `, [id, req.user.userId]);

    if (existingMap.rows.length === 0) {
      return res.status(404).json({ error: 'Map not found or access denied' });
    }

    // Build dynamic update query
    const updateFields = [];
    const updateValues = [];
    let paramCount = 1;

    if (updates.name !== undefined) {
      updateFields.push(`name = $${paramCount++}`);
      updateValues.push(updates.name);
    }
    if (updates.description !== undefined) {
      updateFields.push(`description = $${paramCount++}`);
      updateValues.push(updates.description);
    }
    if (updates.assetId !== undefined) {
      updateFields.push(`asset_id = $${paramCount++}`);
      updateValues.push(updates.assetId);
    }
    if (updates.gridSize !== undefined) {
      updateFields.push(`grid_size = $${paramCount++}`);
      updateValues.push(updates.gridSize);
    }
    if (updates.gridType !== undefined) {
      updateFields.push(`grid_type = $${paramCount++}`);
      updateValues.push(updates.gridType);
    }
    if (updates.isActive !== undefined) {
      updateFields.push(`is_active = $${paramCount++}`);
      updateValues.push(updates.isActive);
    }

    if (updateFields.length === 0) {
      return res.status(400).json({ error: 'No fields to update' });
    }

    updateValues.push(id);

    const result = await query(`
      UPDATE maps
      SET ${updateFields.join(', ')}
      WHERE id = $${paramCount}
      RETURNING *
    `, updateValues);

    const map = result.rows[0];

    res.json({
      message: 'Map updated successfully',
      map: {
        id: map.id,
        name: map.name,
        description: map.description,
        campaignId: map.campaign_id,
        assetId: map.asset_id,
        widthPx: map.width_px,
        heightPx: map.height_px,
        gridSize: map.grid_size,
        gridType: map.grid_type,
        isActive: map.is_active,
        createdAt: map.created_at,
        updatedAt: map.updated_at
      }
    });

  } catch (error) {
    console.error('Update map error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Delete map
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;

    // Check if map exists and belongs to user
    const existingMap = await query(`
      SELECT m.* FROM maps m
      WHERE m.id = $1 AND m.owner_id = $2
    `, [id, req.user.userId]);

    if (existingMap.rows.length === 0) {
      return res.status(404).json({ error: 'Map not found or access denied' });
    }

    await query('DELETE FROM maps WHERE id = $1', [id]);

    res.json({ message: 'Map deleted successfully' });

  } catch (error) {
    console.error('Delete map error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;

