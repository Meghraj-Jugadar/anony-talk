const { pool } = require('../config/db');

exports.getChatHistory = async (req, res, next) => {
  try {
    const { postId } = req.params;
    const { session_id } = req.query;
    if (!session_id) return res.status(400).json({ error: 'session_id required' });

    const { rows } = await pool.query(
      `SELECT * FROM chat_messages WHERE post_id = $1 AND session_id = $2 ORDER BY created_at ASC`,
      [postId, session_id]
    );
    res.json(rows);
  } catch (err) {
    next(err);
  }
};

exports.saveChatMessage = async (postId, sessionId, role, content) => {
  try {
    await pool.query(
      `INSERT INTO chat_messages (post_id, session_id, role, content) VALUES ($1, $2, $3, $4)`,
      [postId, sessionId, role, content]
    );
  } catch (err) {
    console.error('Save chat message error:', err.message);
  }
};
