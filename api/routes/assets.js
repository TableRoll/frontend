const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
const { query } = require('../config/sqlite-database');

const router = express.Router();

// JWT secret
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

// Middleware to verify JWT token
const authenticateToken = (req, res, next) => {
  const token = req.headers.authorization?.replace('Bearer ', '');
  
  if (!token) {
    return res.status(401).json({ error: 'No token provided' });
  }

  // For development, accept mock token
  if (token === 'mock-token-for-development') {
    req.user = { id: 'mock-user', email: 'dev@example.com' };
    return next();
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ error: 'Invalid token' });
  }
};

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = process.env.UPLOAD_PATH || './uploads';
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: parseInt(process.env.MAX_FILE_SIZE) || 10 * 1024 * 1024 // 10MB default
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|webp|mp3|wav|ogg/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);

    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Only image and audio files are allowed'));
    }
  }
});

// Get all assets for a user
router.get('/', authenticateToken, async (req, res) => {
  try {
    const { campaignId, assetType } = req.query;
    
    let queryText = `
      SELECT a.*, c.name as campaign_name
      FROM assets a
      LEFT JOIN campaigns c ON a.campaign_id = c.id
      WHERE a.owner_id = $1
    `;
    
    const params = [req.user.userId];
    let paramCount = 2;
    
    if (campaignId) {
      queryText += ` AND a.campaign_id = $${paramCount}`;
      params.push(campaignId);
      paramCount++;
    }
    
    if (assetType) {
      queryText += ` AND a.asset_type = $${paramCount}`;
      params.push(assetType);
      paramCount++;
    }
    
    queryText += ' ORDER BY a.created_at DESC';
    
    const result = await query(queryText, params);
    
    res.json({
      assets: result.rows.map(asset => ({
        id: asset.id,
        name: asset.name,
        filePath: asset.file_path,
        fileSize: asset.file_size,
        mimeType: asset.mime_type,
        thumbnailPath: asset.thumbnail_path,
        campaignId: asset.campaign_id,
        campaignName: asset.campaign_name,
        assetType: asset.asset_type,
        isPublic: asset.is_public,
        createdAt: asset.created_at
      }))
    });

  } catch (error) {
    console.error('Get assets error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get asset by ID
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    
    const result = await query(`
      SELECT a.*, c.name as campaign_name
      FROM assets a
      LEFT JOIN campaigns c ON a.campaign_id = c.id
      WHERE a.id = $1 AND a.owner_id = $2
    `, [id, req.user.userId]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Asset not found' });
    }

    const asset = result.rows[0];
    
    res.json({
      asset: {
        id: asset.id,
        name: asset.name,
        filePath: asset.file_path,
        fileSize: asset.file_size,
        mimeType: asset.mime_type,
        thumbnailPath: asset.thumbnail_path,
        campaignId: asset.campaign_id,
        campaignName: asset.campaign_name,
        assetType: asset.asset_type,
        isPublic: asset.is_public,
        createdAt: asset.created_at
      }
    });

  } catch (error) {
    console.error('Get asset error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Upload new asset
router.post('/upload', authenticateToken, upload.single('file'), [
  body('name').isLength({ min: 1, max: 255 }).trim(),
  body('assetType').isIn(['image', 'token', 'audio', 'map']),
  body('campaignId').optional().isUUID(),
  body('isPublic').optional().isBoolean()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const { name, assetType, campaignId, isPublic = false } = req.body;

    // Check if campaign exists and belongs to user (if provided)
    if (campaignId) {
      const campaign = await query(
        'SELECT id FROM campaigns WHERE id = $1 AND owner_id = $2',
        [campaignId, req.user.userId]
      );

      if (campaign.rows.length === 0) {
        return res.status(404).json({ error: 'Campaign not found' });
      }
    }

    // Generate thumbnail for images
    let thumbnailPath = null;
    if (assetType === 'image' || assetType === 'token') {
      // In a real implementation, you would generate a thumbnail here
      // For now, we'll just use the same file
      thumbnailPath = req.file.path;
    }

    const result = await query(`
      INSERT INTO assets (name, file_path, file_size, mime_type, thumbnail_path, owner_id, campaign_id, asset_type, is_public)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      RETURNING *
    `, [
      name,
      req.file.path,
      req.file.size,
      req.file.mimetype,
      thumbnailPath,
      req.user.userId,
      campaignId || null,
      assetType,
      isPublic
    ]);

    const asset = result.rows[0];

    res.status(201).json({
      message: 'Asset uploaded successfully',
      asset: {
        id: asset.id,
        name: asset.name,
        filePath: asset.file_path,
        fileSize: asset.file_size,
        mimeType: asset.mime_type,
        thumbnailPath: asset.thumbnail_path,
        campaignId: asset.campaign_id,
        assetType: asset.asset_type,
        isPublic: asset.is_public,
        createdAt: asset.created_at
      }
    });

  } catch (error) {
    console.error('Upload asset error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update asset
router.put('/:id', authenticateToken, [
  body('name').optional().isLength({ min: 1, max: 255 }).trim(),
  body('isPublic').optional().isBoolean()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { id } = req.params;
    const updates = req.body;

    // Check if asset exists and belongs to user
    const existingAsset = await query(
      'SELECT id FROM assets WHERE id = $1 AND owner_id = $2',
      [id, req.user.userId]
    );

    if (existingAsset.rows.length === 0) {
      return res.status(404).json({ error: 'Asset not found' });
    }

    // Build update query dynamically
    const updateFields = [];
    const values = [];
    let paramCount = 1;

    const allowedFields = ['name', 'is_public'];

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
    const queryText = `UPDATE assets SET ${updateFields.join(', ')} WHERE id = $${paramCount} RETURNING *`;
    
    const result = await query(queryText, values);
    const asset = result.rows[0];

    res.json({
      message: 'Asset updated successfully',
      asset: {
        id: asset.id,
        name: asset.name,
        filePath: asset.file_path,
        fileSize: asset.file_size,
        mimeType: asset.mime_type,
        thumbnailPath: asset.thumbnail_path,
        campaignId: asset.campaign_id,
        assetType: asset.asset_type,
        isPublic: asset.is_public,
        createdAt: asset.created_at
      }
    });

  } catch (error) {
    console.error('Update asset error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Delete asset
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;

    // Check if asset exists and belongs to user
    const existingAsset = await query(
      'SELECT file_path, thumbnail_path FROM assets WHERE id = $1 AND owner_id = $2',
      [id, req.user.userId]
    );

    if (existingAsset.rows.length === 0) {
      return res.status(404).json({ error: 'Asset not found' });
    }

    const asset = existingAsset.rows[0];

    // Delete file from filesystem
    try {
      if (fs.existsSync(asset.file_path)) {
        fs.unlinkSync(asset.file_path);
      }
      if (asset.thumbnail_path && fs.existsSync(asset.thumbnail_path)) {
        fs.unlinkSync(asset.thumbnail_path);
      }
    } catch (fileError) {
      console.warn('Could not delete file:', fileError.message);
    }

    // Delete asset from database
    await query('DELETE FROM assets WHERE id = $1', [id]);

    res.json({ message: 'Asset deleted successfully' });

  } catch (error) {
    console.error('Delete asset error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Serve asset files
router.get('/file/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    
    const result = await query(
      'SELECT file_path, mime_type FROM assets WHERE id = $1 AND (owner_id = $2 OR is_public = true)',
      [id, req.user.userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Asset not found' });
    }

    const asset = result.rows[0];

    if (!fs.existsSync(asset.file_path)) {
      return res.status(404).json({ error: 'File not found on disk' });
    }

    res.setHeader('Content-Type', asset.mime_type);
    res.sendFile(path.resolve(asset.file_path));

  } catch (error) {
    console.error('Serve asset error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
