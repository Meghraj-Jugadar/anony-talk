const { pool } = require('../config/db');

exports.createReport = async (req, res, next) => {
  try {
    const { target_id, target_type, reason, session_id } = req.body;

    if (!target_id || !target_type || !reason || !session_id)
      return res.status(400).json({ error: 'target_id, target_type, reason and session_id are required' });

    if (!['post', 'comment'].includes(target_type))
      return res.status(400).json({ error: 'target_type must be post or comment' });

    const existing = await pool.query(
      `SELECT id FROM reports WHERE target_id = $1 AND session_id = $2`,
      [target_id, session_id]
    );
    if (existing.rows.length) return res.status(409).json({ error: 'Already reported' });

    await pool.query(
      `INSERT INTO reports (target_id, target_type, reason, session_id) VALUES ($1, $2, $3, $4)`,
      [target_id, target_type, reason, session_id]
    );

    // Auto delete if reported 5+ times
    const { rows } = await pool.query(
      `SELECT COUNT(*) FROM reports WHERE target_id = $1`,
      [target_id]
    );
    if (parseInt(rows[0].count) >= 5) {
      if (target_type === 'post') {
        await pool.query(`UPDATE posts SET is_deleted = TRUE WHERE id = $1`, [target_id]);
      } else {
        await pool.query(`DELETE FROM comments WHERE id = $1`, [target_id]);
      }
    }

    res.status(201).json({ message: 'Report submitted successfully' });
  } catch (err) {
    next(err);
  }
};
