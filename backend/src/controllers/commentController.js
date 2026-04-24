const { pool } = require('../config/db');

const ADJECTIVES = ['Anonymous', 'Silent', 'Hidden', 'Quiet', 'Brave', 'Gentle', 'Calm', 'Wise'];
const NOUNS = ['Panda', 'Fox', 'Owl', 'Wolf', 'Bear', 'Eagle', 'Tiger', 'Deer'];

const generateName = () => {
  const adj = ADJECTIVES[Math.floor(Math.random() * ADJECTIVES.length)];
  const noun = NOUNS[Math.floor(Math.random() * NOUNS.length)];
  const num = Math.floor(Math.random() * 999);
  return `${adj}${noun}${num}`;
};

exports.getComments = async (req, res, next) => {
  try {
    const { rows } = await pool.query(
      `SELECT * FROM comments WHERE post_id = $1 ORDER BY created_at ASC`,
      [req.params.postId]
    );
    res.json(rows);
  } catch (err) {
    next(err);
  }
};

exports.createComment = async (req, res, next) => {
  try {
    const { content } = req.body;
    const { postId } = req.params;

    if (!content) return res.status(400).json({ error: 'Content is required' });

    const post = await pool.query(
      `SELECT id FROM posts WHERE id = $1 AND is_deleted = FALSE AND expires_at > NOW()`,
      [postId]
    );
    if (!post.rows.length) return res.status(404).json({ error: 'Post not found or expired' });

    const anonymous_name = generateName();
    const { rows } = await pool.query(
      `INSERT INTO comments (post_id, anonymous_name, content) VALUES ($1, $2, $3) RETURNING *`,
      [postId, anonymous_name, content]
    );
    res.status(201).json(rows[0]);
  } catch (err) {
    next(err);
  }
};

exports.voteComment = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { vote_type, session_id } = req.body;

    if (!['up', 'down'].includes(vote_type)) return res.status(400).json({ error: 'Invalid vote type' });
    if (!session_id) return res.status(400).json({ error: 'session_id required' });

    const existing = await pool.query(
      `SELECT * FROM votes WHERE target_id = $1 AND session_id = $2`,
      [id, session_id]
    );

    if (existing.rows.length) {
      const prev = existing.rows[0].vote_type;
      await pool.query(`DELETE FROM votes WHERE target_id = $1 AND session_id = $2`, [id, session_id]);
      const col = prev === 'up' ? 'upvotes' : 'downvotes';
      const { rows } = await pool.query(
        `UPDATE comments SET ${col} = GREATEST(${col} - 1, 0) WHERE id = $1 RETURNING upvotes, downvotes`,
        [id]
      );
      return res.json({ ...rows[0], voted: null });
    }

    await pool.query(
      `INSERT INTO votes (target_id, target_type, session_id, vote_type) VALUES ($1, 'comment', $2, $3)`,
      [id, session_id, vote_type]
    );

    const col = vote_type === 'up' ? 'upvotes' : 'downvotes';
    const { rows } = await pool.query(
      `UPDATE comments SET ${col} = ${col} + 1 WHERE id = $1 RETURNING upvotes, downvotes`,
      [id]
    );
    res.json({ ...rows[0], voted: vote_type });
  } catch (err) {
    next(err);
  }
};
