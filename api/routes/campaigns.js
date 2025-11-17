const express = require('express');
const { body, validationResult } = require('express-validator');
const { query, transaction } = require('../config/database');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// Get all campaigns for a user
router.get('/', authenticateToken, async (req, res) => {
  try {
    const result = await query(`
      SELECT c.*, m.name as map_name, m.id as map_id,
             COUNT(DISTINCT ch.id) as character_count,
             COUNT(DISTINCT s.id) as session_count
      FROM campaigns c
      LEFT JOIN maps m ON c.current_map_id = m.id
      LEFT JOIN characters ch ON c.id = ch.campaign_id
      LEFT JOIN sessions s ON c.id = s.campaign_id
      WHERE c.owner_id = $1
      GROUP BY c.id, m.name, m.id
      ORDER BY c.created_at DESC
    `, [req.user.userId]);

    res.json({
      campaigns: result.rows.map(campaign => ({
        id: campaign.id,
        name: campaign.name,
        description: campaign.description,
        currentMapId: campaign.map_id,
        currentMapName: campaign.map_name,
        sessionNumber: campaign.session_number,
        isActive: campaign.is_active,
        characterCount: parseInt(campaign.character_count),
        sessionCount: parseInt(campaign.session_count),
        tokens: [],
        createdAt: campaign.created_at,
        updatedAt: campaign.updated_at
      }))
    });

  } catch (error) {
    console.error('Get campaigns error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get campaign by ID
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    
    // Get campaign with full map details including image URL
    const result = await query(`
      SELECT c.*, 
             m.name as map_name, 
             m.id as map_id,
             m.width_px,
             m.height_px,
             m.grid_size,
             m.grid_type,
             m.asset_id,
             a.file_path as map_image_url,
             a.thumbnail_path as map_thumbnail
      FROM campaigns c
      LEFT JOIN maps m ON c.current_map_id = m.id
      LEFT JOIN assets a ON m.asset_id = a.id
      WHERE c.id = $1 AND c.owner_id = $2
    `, [id, req.user.userId]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Campaign not found' });
    }

    const campaign = result.rows[0];

    // Get campaign characters
    const charactersResult = await query(`
      SELECT ch.*, r.name as race_name, cl.name as class_name
      FROM characters ch
      LEFT JOIN races r ON ch.race_id = r.id
      LEFT JOIN classes cl ON ch.class_id = cl.id
      WHERE ch.campaign_id = $1
      ORDER BY ch.created_at
    `, [id]);

    // Get campaign sessions
    const sessionsResult = await query(`
      SELECT s.*, COUNT(sp.id) as participant_count
      FROM sessions s
      LEFT JOIN session_participants sp ON s.id = sp.session_id
      WHERE s.campaign_id = $1
      GROUP BY s.id
      ORDER BY s.created_at DESC
    `, [id]);

    // Build map object if map exists
    let mapData = null;
    if (campaign.map_id) {
      mapData = {
        id: campaign.map_id,
        name: campaign.map_name,
        widthPx: campaign.width_px,
        heightPx: campaign.height_px,
        gridSize: campaign.grid_size,
        gridType: campaign.grid_type,
        assetId: campaign.asset_id,
        imageUrl: campaign.map_image_url,
        thumbnail: campaign.map_thumbnail
      };
    }

    res.json({
      campaign: {
        id: campaign.id,
        name: campaign.name,
        description: campaign.description,
        currentMapId: campaign.map_id,
        currentMapName: campaign.map_name,
        map: mapData,  // Include full map data
        sessionNumber: campaign.session_number,
        isActive: campaign.is_active,
        characters: charactersResult.rows.map(char => ({
          id: char.id,
          name: char.name,
          race: char.race_name,
          class: char.class_name,
          level: char.level,
          hp: {
            current: char.hp_current,
            max: char.hp_max
          }
        })),
        sessions: sessionsResult.rows.map(session => ({
          id: session.id,
          name: session.name,
          description: session.description,
          isActive: session.is_active,
          maxPlayers: session.max_players,
          currentPlayers: parseInt(session.participant_count),
          createdAt: session.created_at
        })),
        createdAt: campaign.created_at,
        updatedAt: campaign.updated_at
      }
    });

  } catch (error) {
    console.error('Get campaign error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Create new campaign
router.post('/', authenticateToken, [
  body('name').isLength({ min: 1, max: 100 }).trim(),
  body('description').optional().isLength({ max: 1000 }).trim(),
  body('currentMapId').isUUID().withMessage('Map is required for campaign creation')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const errorMessages = errors.array().map(err => `${err.param}: ${err.msg}`).join(', ');
      return res.status(400).json({ 
        error: `Validation failed: ${errorMessages}`,
        errors: errors.array() 
      });
    }

    const { name, description, currentMapId } = req.body;

    // Verify map exists and belongs to user
    const mapCheck = await query(
      'SELECT id FROM maps WHERE id = $1 AND owner_id = $2',
      [currentMapId, req.user.userId]
    );

    if (mapCheck.rows.length === 0) {
      return res.status(404).json({ error: 'Map not found or does not belong to you' });
    }

    // Create campaign
    const result = await query(`
      INSERT INTO campaigns (name, description, owner_id, current_map_id)
      VALUES ($1, $2, $3, $4)
      RETURNING *
    `, [name, description || '', req.user.userId, currentMapId]);

    const campaign = result.rows[0];

    // Assign the map to the campaign (set map's campaign_id)
    await query(
      'UPDATE maps SET campaign_id = $1, updated_at = NOW() WHERE id = $2',
      [campaign.id, currentMapId]
    );

    res.status(201).json({
      message: 'Campaign created successfully with assigned map',
      campaign: {
        id: campaign.id,
        name: campaign.name,
        description: campaign.description,
        currentMapId: campaign.current_map_id,
        sessionNumber: campaign.session_number,
        isActive: campaign.is_active,
        tokens: [],
        createdAt: campaign.created_at
      }
    });

  } catch (error) {
    console.error('Create campaign error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update campaign
router.put('/:id', authenticateToken, [
  body('name').optional().isLength({ min: 1, max: 100 }).trim(),
  body('description').optional().isLength({ max: 1000 }).trim(),
  body('current_map_id').optional().isUUID()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { id } = req.params;
    const updates = req.body;

    // Check if campaign exists and belongs to user
    const existingCampaign = await query(
      'SELECT id, current_map_id FROM campaigns WHERE id = $1 AND owner_id = $2',
      [id, req.user.userId]
    );

    if (existingCampaign.rows.length === 0) {
      return res.status(404).json({ error: 'Campaign not found' });
    }

    const oldMapId = existingCampaign.rows[0].current_map_id;

    // If changing the map, verify new map exists and belongs to user
    if (updates.current_map_id && updates.current_map_id !== oldMapId) {
      const mapCheck = await query(
        'SELECT id FROM maps WHERE id = $1 AND owner_id = $2',
        [updates.current_map_id, req.user.userId]
      );

      if (mapCheck.rows.length === 0) {
        return res.status(404).json({ error: 'Map not found or does not belong to you' });
      }

      // Unassign old map from campaign
      if (oldMapId) {
        await query(
          'UPDATE maps SET campaign_id = NULL, updated_at = NOW() WHERE id = $1',
          [oldMapId]
        );
      }

      // Assign new map to campaign
      await query(
        'UPDATE maps SET campaign_id = $1, updated_at = NOW() WHERE id = $2',
        [id, updates.current_map_id]
      );
    }

    // Build update query dynamically
    const updateFields = [];
    const values = [];
    let paramCount = 1;

    const allowedFields = ['name', 'description', 'session_number', 'is_active', 'current_map_id'];

    for (const [key, value] of Object.entries(updates)) {
      if (allowedFields.includes(key) && value !== undefined) {
        updateFields.push(`${key} = $${paramCount}`);
        values.push(value);
        paramCount++;
      }
    }

    if (updateFields.length === 0) {
      return res.status(400).json({ error: 'No valid fields to update' });
    }

    values.push(id);
    const queryText = `UPDATE campaigns SET ${updateFields.join(', ')}, updated_at = NOW() WHERE id = $${paramCount} RETURNING *`;
    
    const result = await query(queryText, values);
    const campaign = result.rows[0];

    res.json({
      message: 'Campaign updated successfully',
      campaign: {
        id: campaign.id,
        name: campaign.name,
        description: campaign.description,
        currentMapId: campaign.current_map_id,
        sessionNumber: campaign.session_number,
        isActive: campaign.is_active,
        updatedAt: campaign.updated_at
      }
    });

  } catch (error) {
    console.error('Update campaign error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Delete campaign
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;

    // Check if campaign exists and belongs to user
    const existingCampaign = await query(
      'SELECT id, name FROM campaigns WHERE id = $1 AND owner_id = $2',
      [id, req.user.userId]
    );

    if (existingCampaign.rows.length === 0) {
      return res.status(404).json({ error: 'Campaign not found' });
    }

    // Delete campaign
    // Note: Maps will have their campaign_id set to NULL (not deleted)
    // Characters, sessions, and other campaign data will be cascade deleted
    await query('DELETE FROM campaigns WHERE id = $1', [id]);

    console.log(`Campaign deleted: ${existingCampaign.rows[0].name} (${id})`);

    res.json({ 
      message: 'Campaign deleted successfully',
      info: 'Associated maps have been preserved and are now unassigned'
    });

  } catch (error) {
    console.error('Delete campaign error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Create session for campaign
router.post('/:id/sessions', authenticateToken, [
  body('name').isLength({ min: 1, max: 100 }).trim(),
  body('description').optional().isLength({ max: 1000 }).trim(),
  body('maxPlayers').optional().isInt({ min: 1, max: 20 })
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { id: campaignId } = req.params;
    const { name, description, maxPlayers = 6 } = req.body;

    // Check if campaign exists and belongs to user
    const campaign = await query(
      'SELECT id FROM campaigns WHERE id = $1 AND owner_id = $2',
      [campaignId, req.user.userId]
    );

    if (campaign.rows.length === 0) {
      return res.status(404).json({ error: 'Campaign not found' });
    }

    const result = await query(`
      INSERT INTO sessions (campaign_id, name, description, max_players)
      VALUES ($1, $2, $3, $4)
      RETURNING *
    `, [campaignId, name, description || '', maxPlayers]);

    const session = result.rows[0];

    // Add creator as GM
    await query(`
      INSERT INTO session_participants (session_id, user_id, role)
      VALUES ($1, $2, 'gm')
    `, [session.id, req.user.userId]);

    res.status(201).json({
      message: 'Session created successfully',
      session: {
        id: session.id,
        name: session.name,
        description: session.description,
        isActive: session.is_active,
        maxPlayers: session.max_players,
        currentPlayers: 1,
        createdAt: session.created_at
      }
    });

  } catch (error) {
    console.error('Create session error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
