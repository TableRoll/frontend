const express = require('express');
const { body, validationResult } = require('express-validator');
const { query, transaction } = require('../config/database');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// Get all characters for a user
router.get('/', authenticateToken, async (req, res) => {
  try {
    const { campaignId } = req.query;
    
    let queryText = `
      SELECT c.*, r.name as race_name, cl.name as class_name, b.name as background_name
      FROM characters c
      LEFT JOIN races r ON c.race_id = r.id
      LEFT JOIN classes cl ON c.class_id = cl.id
      LEFT JOIN backgrounds b ON c.background_id = b.id
      WHERE c.owner_id = $1
    `;
    
    const params = [req.user.userId];
    
    if (campaignId) {
      queryText += ' AND c.campaign_id = $2';
      params.push(campaignId);
    }
    
    queryText += ' ORDER BY c.created_at DESC';
    
    const result = await query(queryText, params);
    
    res.json({
      characters: result.rows.map(char => ({
        id: char.id,
        name: char.name,
        description: char.description,
        imageUrl: char.image_url,
        campaignId: char.campaign_id,
        race: char.race_name,
        class: char.class_name,
        background: char.background_name,
        level: char.level,
        hp: {
          current: char.hp_current,
          max: char.hp_max,
          temporary: char.hp_temporary
        },
        armorClass: char.armor_class,
        speed: char.speed,
        size: char.size,
        abilityScores: {
          str: char.strength,
          dex: char.dexterity,
          con: char.constitution,
          int: char.intelligence,
          wis: char.wisdom,
          cha: char.charisma
        },
        modifiers: {
          str: char.str_modifier,
          dex: char.dex_modifier,
          con: char.con_modifier,
          int: char.int_modifier,
          wis: char.wis_modifier,
          cha: char.cha_modifier
        },
        proficiencyBonus: char.proficiency_bonus,
        gold: char.gold,
        experiencePoints: char.experience_points,
        createdAt: char.created_at,
        updatedAt: char.updated_at
      }))
    });

  } catch (error) {
    console.error('Get characters error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get character by ID
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    
    const result = await query(`
      SELECT c.*, r.name as race_name, cl.name as class_name, b.name as background_name
      FROM characters c
      LEFT JOIN races r ON c.race_id = r.id
      LEFT JOIN classes cl ON c.class_id = cl.id
      LEFT JOIN backgrounds b ON c.background_id = b.id
      WHERE c.id = $1 AND c.owner_id = $2
    `, [id, req.user.userId]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Character not found' });
    }

    const char = result.rows[0];
    
    // Get character inventory
    const inventoryResult = await query(`
      SELECT ci.*, ii.name, ii.description, ii.damage_dice, ii.damage_type, 
             ii.armor_class_bonus, ii.weight, ii.value, ii.properties, ii.rarity,
             it.name as item_type, it.category
      FROM character_inventory ci
      JOIN inventory_items ii ON ci.item_id = ii.id
      JOIN item_types it ON ii.item_type_id = it.id
      WHERE ci.character_id = $1
      ORDER BY ci.is_equipped DESC, ii.name
    `, [id]);

    res.json({
      character: {
        id: char.id,
        name: char.name,
        description: char.description,
        imageUrl: char.image_url,
        campaignId: char.campaign_id,
        race: char.race_name,
        class: char.class_name,
        background: char.background_name,
        level: char.level,
        hp: {
          current: char.hp_current,
          max: char.hp_max,
          temporary: char.hp_temporary
        },
        armorClass: char.armor_class,
        speed: char.speed,
        size: char.size,
        abilityScores: {
          str: char.strength,
          dex: char.dexterity,
          con: char.constitution,
          int: char.intelligence,
          wis: char.wisdom,
          cha: char.charisma
        },
        modifiers: {
          str: char.str_modifier,
          dex: char.dex_modifier,
          con: char.con_modifier,
          int: char.int_modifier,
          wis: char.wis_modifier,
          cha: char.cha_modifier
        },
        proficiencyBonus: char.proficiency_bonus,
        savingThrowProficiencies: char.saving_throw_proficiencies,
        skillProficiencies: char.skill_proficiencies,
        toolProficiencies: char.tool_proficiencies,
        languageProficiencies: char.language_proficiencies,
        spells: char.spells_known,
        spellSlots: char.spell_slots,
        classFeatures: char.class_features,
        gold: char.gold,
        experiencePoints: char.experience_points,
        inventory: inventoryResult.rows.map(item => ({
          id: item.id,
          itemId: item.item_id,
          name: item.name,
          description: item.description,
          type: item.item_type,
          category: item.category,
          damageDice: item.damage_dice,
          damageType: item.damage_type,
          armorClassBonus: item.armor_class_bonus,
          weight: item.weight,
          value: item.value,
          properties: item.properties,
          rarity: item.rarity,
          quantity: item.quantity,
          isEquipped: item.is_equipped,
          notes: item.notes
        })),
        createdAt: char.created_at,
        updatedAt: char.updated_at
      }
    });

  } catch (error) {
    console.error('Get character error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Create new character
router.post('/', authenticateToken, [
  body('name').isLength({ min: 1, max: 100 }).trim(),
  body('raceId').notEmpty(),
  body('classId').notEmpty(),
  body('backgroundId').notEmpty(),
  body('level').isInt({ min: 1, max: 20 }),
  body('abilityScores').isObject(),
  body('abilityScores.str').isInt({ min: 1, max: 30 }),
  body('abilityScores.dex').isInt({ min: 1, max: 30 }),
  body('abilityScores.con').isInt({ min: 1, max: 30 }),
  body('abilityScores.int').isInt({ min: 1, max: 30 }),
  body('abilityScores.wis').isInt({ min: 1, max: 30 }),
  body('abilityScores.cha').isInt({ min: 1, max: 30 })
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const {
      name,
      description,
      imageUrl,
      campaignId,
      raceId,
      classId,
      backgroundId,
      level,
      abilityScores,
      hpMax,
      armorClass,
      speed,
      size
    } = req.body;

    // Look up race, class, and background IDs by name if they're not UUIDs
    let actualRaceId = raceId;
    let actualClassId = classId;
    let actualBackgroundId = backgroundId;

    // Check if raceId is a name (not UUID) and look it up
    if (!raceId.match(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i)) {
      const raceResult = await query('SELECT id FROM races WHERE name = $1', [raceId]);
      if (raceResult.rows.length === 0) {
        return res.status(400).json({ error: `Race '${raceId}' not found` });
      }
      actualRaceId = raceResult.rows[0].id;
    }

    // Check if classId is a name (not UUID) and look it up
    if (!classId.match(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i)) {
      const classResult = await query('SELECT id FROM classes WHERE name = $1', [classId]);
      if (classResult.rows.length === 0) {
        return res.status(400).json({ error: `Class '${classId}' not found` });
      }
      actualClassId = classResult.rows[0].id;
    }

    // Check if backgroundId is a name (not UUID) and look it up
    if (!backgroundId.match(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i)) {
      const backgroundResult = await query('SELECT id FROM backgrounds WHERE name = $1', [backgroundId]);
      if (backgroundResult.rows.length === 0) {
        return res.status(400).json({ error: `Background '${backgroundId}' not found` });
      }
      actualBackgroundId = backgroundResult.rows[0].id;
    }

    // Calculate HP if not provided
    const calculatedHp = hpMax || (8 + Math.floor((abilityScores.con - 10) / 2));

    const result = await query(`
      INSERT INTO characters (
        name, description, image_url, campaign_id, owner_id, race_id, class_id, background_id,
        level, strength, dexterity, constitution, intelligence, wisdom, charisma,
        hp_current, hp_max, armor_class, speed, size
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20)
      RETURNING *
    `, [
      name, description || '', imageUrl || null, campaignId || null, req.user.id,
      actualRaceId, actualClassId, actualBackgroundId, level,
      abilityScores.str, abilityScores.dex, abilityScores.con,
      abilityScores.int, abilityScores.wis, abilityScores.cha,
      calculatedHp, calculatedHp, armorClass || 10, speed || 30, size || 'medium'
    ]);

    const character = result.rows[0];

    res.status(201).json({
      message: 'Character created successfully',
      character: {
        id: character.id,
        name: character.name,
        description: character.description,
        imageUrl: character.image_url,
        campaignId: character.campaign_id,
        level: character.level,
        hp: {
          current: character.hp_current,
          max: character.hp_max,
          temporary: character.hp_temporary
        },
        armorClass: character.armor_class,
        speed: character.speed,
        size: character.size,
        abilityScores: {
          str: character.strength,
          dex: character.dexterity,
          con: character.constitution,
          int: character.intelligence,
          wis: character.wisdom,
          cha: character.charisma
        },
        createdAt: character.created_at
      }
    });

  } catch (error) {
    console.error('Create character error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update character
router.put('/:id', authenticateToken, [
  body('name').optional().isLength({ min: 1, max: 100 }).trim(),
  body('level').optional().isInt({ min: 1, max: 20 })
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { id } = req.params;
    const updates = req.body;

    // Check if character exists and belongs to user
    const existingChar = await query(
      'SELECT id FROM characters WHERE id = $1 AND owner_id = $2',
      [id, req.user.userId]
    );

    if (existingChar.rows.length === 0) {
      return res.status(404).json({ error: 'Character not found' });
    }

    // Build update query dynamically
    const updateFields = [];
    const values = [];
    let paramCount = 1;

    const allowedFields = [
      'name', 'description', 'image_url', 'level', 'strength', 'dexterity',
      'constitution', 'intelligence', 'wisdom', 'charisma', 'hp_current',
      'hp_max', 'hp_temporary', 'armor_class', 'speed', 'size', 'gold',
      'experience_points'
    ];

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
    const queryText = `UPDATE characters SET ${updateFields.join(', ')}, updated_at = NOW() WHERE id = $${paramCount} RETURNING *`;
    
    const result = await query(queryText, values);
    const character = result.rows[0];

    res.json({
      message: 'Character updated successfully',
      character: {
        id: character.id,
        name: character.name,
        description: character.description,
        imageUrl: character.image_url,
        level: character.level,
        hp: {
          current: character.hp_current,
          max: character.hp_max,
          temporary: character.hp_temporary
        },
        armorClass: character.armor_class,
        speed: character.speed,
        size: character.size,
        abilityScores: {
          str: character.strength,
          dex: character.dexterity,
          con: character.constitution,
          int: character.intelligence,
          wis: character.wisdom,
          cha: character.charisma
        },
        gold: character.gold,
        experiencePoints: character.experience_points,
        updatedAt: character.updated_at
      }
    });

  } catch (error) {
    console.error('Update character error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Delete character
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;

    // Check if character exists and belongs to user
    const existingChar = await query(
      'SELECT id FROM characters WHERE id = $1 AND owner_id = $2',
      [id, req.user.userId]
    );

    if (existingChar.rows.length === 0) {
      return res.status(404).json({ error: 'Character not found' });
    }

    // Delete character (cascade will handle inventory)
    await query('DELETE FROM characters WHERE id = $1', [id]);

    res.json({ message: 'Character deleted successfully' });

  } catch (error) {
    console.error('Delete character error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get reference data (races, classes, backgrounds)
router.get('/reference/races', async (req, res) => {
  try {
    const result = await query('SELECT * FROM races ORDER BY name');
    res.json({ races: result.rows });
  } catch (error) {
    console.error('Get races error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.get('/reference/classes', async (req, res) => {
  try {
    const result = await query('SELECT * FROM classes ORDER BY name');
    res.json({ classes: result.rows });
  } catch (error) {
    console.error('Get classes error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.get('/reference/backgrounds', async (req, res) => {
  try {
    const result = await query('SELECT * FROM backgrounds ORDER BY name');
    res.json({ backgrounds: result.rows });
  } catch (error) {
    console.error('Get backgrounds error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
