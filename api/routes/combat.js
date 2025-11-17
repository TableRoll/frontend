const express = require('express');
const { body, validationResult } = require('express-validator');
const { query, transaction } = require('../config/database');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// Get combat session
router.get('/session/:sessionId', authenticateToken, async (req, res) => {
  try {
    const { sessionId } = req.params;
    
    // Check if user is participant in session
    const sessionCheck = await query(`
      SELECT s.*, c.name as campaign_name
      FROM sessions s
      JOIN campaigns c ON s.campaign_id = c.id
      JOIN session_participants sp ON s.id = sp.session_id
      WHERE s.id = $1 AND sp.user_id = $2
    `, [sessionId, req.user.userId]);

    if (sessionCheck.rows.length === 0) {
      return res.status(404).json({ error: 'Session not found or access denied' });
    }

    // Get combat session
    const combatResult = await query(`
      SELECT cs.*, m.name as map_name
      FROM combat_sessions cs
      LEFT JOIN maps m ON cs.map_id = m.id
      WHERE cs.session_id = $1
    `, [sessionId]);

    if (combatResult.rows.length === 0) {
      return res.json({
        combat: {
          isActive: false,
          round: 1,
          currentTurnIndex: 0,
          participants: []
        }
      });
    }

    const combat = combatResult.rows[0];

    // Get combat participants
    const participantsResult = await query(`
      SELECT cp.*, t.name as token_name, t.x_position, t.y_position,
             ch.name as character_name, ch.hp_current, ch.hp_max,
             a.file_path as token_image
      FROM combat_participants cp
      JOIN tokens t ON cp.token_id = t.id
      LEFT JOIN characters ch ON t.character_id = ch.id
      LEFT JOIN assets a ON t.asset_id = a.id
      WHERE cp.combat_session_id = $1
      ORDER BY cp.initiative DESC, cp.turn_order
    `, [combat.id]);

    res.json({
      combat: {
        id: combat.id,
        isActive: combat.is_active,
        round: combat.round,
        currentTurnIndex: combat.current_turn_index,
        mapId: combat.map_id,
        mapName: combat.map_name,
        participants: participantsResult.rows.map(p => ({
          id: p.id,
          tokenId: p.token_id,
          tokenName: p.token_name,
          characterName: p.character_name,
          initiative: p.initiative,
          hasAction: p.has_action,
          hasBonusAction: p.has_bonus_action,
          turnOrder: p.turn_order,
          position: {
            x: p.x_position,
            y: p.y_position
          },
          hp: p.character_name ? {
            current: p.hp_current,
            max: p.hp_max
          } : null,
          tokenImage: p.token_image
        }))
      }
    });

  } catch (error) {
    console.error('Get combat session error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Start combat
router.post('/session/:sessionId/start', authenticateToken, [
  body('participants').isArray({ min: 1 }),
  body('participants.*.tokenId').isUUID(),
  body('participants.*.initiative').isInt({ min: 1, max: 30 })
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { sessionId } = req.params;
    const { participants, mapId } = req.body;

    // Check if user is GM in session
    const sessionCheck = await query(`
      SELECT s.*, sp.role
      FROM sessions s
      JOIN session_participants sp ON s.id = sp.session_id
      WHERE s.id = $1 AND sp.user_id = $2 AND sp.role = 'gm'
    `, [sessionId, req.user.userId]);

    if (sessionCheck.rows.length === 0) {
      return res.status(403).json({ error: 'Only GMs can start combat' });
    }

    const result = await transaction(async (client) => {
      // Create or update combat session
      let combatSessionId;
      const existingCombat = await client.query(
        'SELECT id FROM combat_sessions WHERE session_id = $1',
        [sessionId]
      );

      if (existingCombat.rows.length > 0) {
        combatSessionId = existingCombat.rows[0].id;
        await client.query(
          'UPDATE combat_sessions SET is_active = true, current_round = 1, current_turn_index = 0, map_id = $1 WHERE id = $2',
          [mapId || null, combatSessionId]
        );
      } else {
        const combatResult = await client.query(`
          INSERT INTO combat_sessions (session_id, map_id, is_active, current_round, current_turn_index)
          VALUES ($1, $2, true, 1, 0)
          RETURNING id
        `, [sessionId, mapId || null]);
        combatSessionId = combatResult.rows[0].id;
      }

      // Clear existing participants
      await client.query('DELETE FROM combat_participants WHERE combat_session_id = $1', [combatSessionId]);

      // Add new participants
      for (let i = 0; i < participants.length; i++) {
        const participant = participants[i];
        await client.query(`
          INSERT INTO combat_participants (combat_session_id, token_id, initiative, has_action, has_bonus_action, turn_order)
          VALUES ($1, $2, $3, true, true, $4)
        `, [combatSessionId, participant.tokenId, participant.initiative, i]);
      }

      return combatSessionId;
    });

    res.json({
      message: 'Combat started successfully',
      combatSessionId: result
    });

  } catch (error) {
    console.error('Start combat error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// End combat
router.post('/session/:sessionId/end', authenticateToken, async (req, res) => {
  try {
    const { sessionId } = req.params;

    // Check if user is GM in session
    const sessionCheck = await query(`
      SELECT s.*, sp.role
      FROM sessions s
      JOIN session_participants sp ON s.id = sp.session_id
      WHERE s.id = $1 AND sp.user_id = $2 AND sp.role = 'gm'
    `, [sessionId, req.user.userId]);

    if (sessionCheck.rows.length === 0) {
      return res.status(403).json({ error: 'Only GMs can end combat' });
    }

    // End combat session
    await query(
      'UPDATE combat_sessions SET is_active = false WHERE session_id = $1',
      [sessionId]
    );

    res.json({ message: 'Combat ended successfully' });

  } catch (error) {
    console.error('End combat error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Next turn
router.post('/session/:sessionId/next-turn', authenticateToken, async (req, res) => {
  try {
    const { sessionId } = req.params;

    // Check if user is GM in session
    const sessionCheck = await query(`
      SELECT s.*, sp.role
      FROM sessions s
      JOIN session_participants sp ON s.id = sp.session_id
      WHERE s.id = $1 AND sp.user_id = $2 AND sp.role = 'gm'
    `, [sessionId, req.user.userId]);

    if (sessionCheck.rows.length === 0) {
      return res.status(403).json({ error: 'Only GMs can advance turns' });
    }

    const result = await transaction(async (client) => {
      // Get current combat state
      const combatResult = await client.query(`
        SELECT cs.*, COUNT(cp.id) as participant_count
        FROM combat_sessions cs
        LEFT JOIN combat_participants cp ON cs.id = cp.combat_session_id
        WHERE cs.session_id = $1 AND cs.is_active = true
        GROUP BY cs.id
      `, [sessionId]);

      if (combatResult.rows.length === 0) {
        throw new Error('No active combat session found');
      }

      const combat = combatResult.rows[0];
      const participantCount = parseInt(combat.participant_count);

      if (participantCount === 0) {
        throw new Error('No participants in combat');
      }

      // Calculate next turn
      const nextTurnIndex = (combat.current_turn_index + 1) % participantCount;
      const isNewRound = nextTurnIndex === 0;

      // Update combat session
      await client.query(`
        UPDATE combat_sessions 
        SET current_turn_index = $1, 
            current_round = CASE WHEN $2 THEN current_round + 1 ELSE current_round END,
            updated_at = NOW()
        WHERE id = $3
      `, [nextTurnIndex, isNewRound, combat.id]);

      // Reset all participants' actions for new round
      if (isNewRound) {
        await client.query(`
          UPDATE combat_participants 
          SET has_action = true, has_bonus_action = true
          WHERE combat_session_id = $1
        `, [combat.id]);
      }

      return {
        round: isNewRound ? combat.round + 1 : combat.round,
        currentTurnIndex: nextTurnIndex
      };
    });

    res.json({
      message: 'Turn advanced successfully',
      round: result.round,
      currentTurnIndex: result.currentTurnIndex
    });

  } catch (error) {
    console.error('Next turn error:', error);
    res.status(500).json({ error: error.message || 'Internal server error' });
  }
});

// Use action
router.post('/session/:sessionId/use-action', authenticateToken, [
  body('tokenId').isUUID()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { sessionId } = req.params;
    const { tokenId } = req.body;

    // Check if user is GM in session
    const sessionCheck = await query(`
      SELECT s.*, sp.role
      FROM sessions s
      JOIN session_participants sp ON s.id = sp.session_id
      WHERE s.id = $1 AND sp.user_id = $2 AND sp.role = 'gm'
    `, [sessionId, req.user.userId]);

    if (sessionCheck.rows.length === 0) {
      return res.status(403).json({ error: 'Only GMs can manage actions' });
    }

    // Update participant action
    const result = await query(`
      UPDATE combat_participants 
      SET has_action = false
      WHERE combat_session_id = (SELECT id FROM combat_sessions WHERE session_id = $1)
        AND token_id = $2
      RETURNING *
    `, [sessionId, tokenId]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Participant not found' });
    }

    res.json({ message: 'Action used successfully' });

  } catch (error) {
    console.error('Use action error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Use bonus action
router.post('/session/:sessionId/use-bonus-action', authenticateToken, [
  body('tokenId').isUUID()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { sessionId } = req.params;
    const { tokenId } = req.body;

    // Check if user is GM in session
    const sessionCheck = await query(`
      SELECT s.*, sp.role
      FROM sessions s
      JOIN session_participants sp ON s.id = sp.session_id
      WHERE s.id = $1 AND sp.user_id = $2 AND sp.role = 'gm'
    `, [sessionId, req.user.userId]);

    if (sessionCheck.rows.length === 0) {
      return res.status(403).json({ error: 'Only GMs can manage actions' });
    }

    // Update participant bonus action
    const result = await query(`
      UPDATE combat_participants 
      SET has_bonus_action = false
      WHERE combat_session_id = (SELECT id FROM combat_sessions WHERE session_id = $1)
        AND token_id = $2
      RETURNING *
    `, [sessionId, tokenId]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Participant not found' });
    }

    res.json({ message: 'Bonus action used successfully' });

  } catch (error) {
    console.error('Use bonus action error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
