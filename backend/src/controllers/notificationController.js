const { pool } = require('../config/db');

exports.getNotifications = async (req, res, next) => {
  try {
    const { session_id } = req.query;
    if (!session_id) return res.status(400).json({ error: 'session_id required' });

    const { rows } = await pool.query(
      `SELECT * FROM notifications WHERE session_id = $1 ORDER BY created_at DESC LIMIT 20`,
      [session_id]
    );
    res.json(rows);
  } catch (err) {
    next(err);
  }
};

exports.markAllRead = async (req, res, next) => {
  try {
    const { session_id } = req.body;
    if (!session_id) return res.status(400).json({ error: 'session_id required' });

    await pool.query(
      `UPDATE notifications SET is_read = TRUE WHERE session_id = $1`,
      [session_id]
    );
    res.json({ message: 'All notifications marked as read' });
  } catch (err) {
    next(err);
  }
};

exports.createNotification = async (session_id, type, message, post_id) => {
  try {
    await pool.query(
      `INSERT INTO notifications (session_id, type, message, post_id) VALUES ($1, $2, $3, $4)`,
      [session_id, type, message, post_id]
    );
  } catch (err) {
    console.error('Notification error:', err.message);
  }
};
