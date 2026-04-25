const { pool } = require('../config/db');
const { v4: uuidv4 } = require('uuid');

const ADJECTIVES = ['Anonymous', 'Silent', 'Hidden', 'Quiet', 'Brave', 'Gentle', 'Calm', 'Wise'];
const NOUNS = ['Panda', 'Fox', 'Owl', 'Wolf', 'Bear', 'Eagle', 'Tiger', 'Deer'];

const generateName = () => {
  const adj = ADJECTIVES[Math.floor(Math.random() * ADJECTIVES.length)];
  const noun = NOUNS[Math.floor(Math.random() * NOUNS.length)];
  const num = Math.floor(Math.random() * 999);
  return `${adj}${noun}${num}`;
};

const detectSentiment = (text) => {
  const lower = text.toLowerCase();
  const sadWords = ['sad', 'depressed', 'hopeless', 'cry', 'alone', 'hurt', 'pain', 'lost'];
  const angryWords = ['angry', 'hate', 'furious', 'rage', 'mad', 'frustrated', 'annoyed'];
  const happyWords = ['happy', 'excited', 'grateful', 'love', 'joy', 'great', 'amazing'];

  const sad = sadWords.filter(w => lower.includes(w)).length;
  const angry = angryWords.filter(w => lower.includes(w)).length;
  const happy = happyWords.filter(w => lower.includes(w)).length;

  if (sad > angry && sad > happy) return 'sad';
  if (angry > sad && angry > happy) return 'angry';
  if (happy > sad && happy > angry) return 'happy';
  return 'neutral';
};

const { getAIReply } = require('../utils/groq');

exports.getAllPosts = async (req, res, next) => {
  try {
    const { tag, sort = 'new', page = 1, limit = 10 } = req.query;
    const offset = (page - 1) * limit;

    let query = `SELECT p.*, COUNT(c.id)::int AS comment_count 
      FROM posts p 
      LEFT JOIN comments c ON c.post_id = p.id 
      WHERE p.is_deleted = FALSE AND p.expires_at > NOW()`;
    const params = [];

    if (tag) {
      params.push(tag);
      query += ` AND $${params.length} = ANY(p.tags)`;
    }

    const orderMap = {
      new: 'p.created_at DESC',
      top: 'p.upvotes DESC',
      controversial: '(p.upvotes + p.downvotes) DESC',
    };
    query += ` GROUP BY p.id ORDER BY ${orderMap[sort] || 'p.created_at DESC'}`;
    params.push(limit, offset);
    query += ` LIMIT $${params.length - 1} OFFSET $${params.length}`;

    const { rows } = await pool.query(query, params);
    res.json(rows);
  } catch (err) {
    next(err);
  }
};

exports.getPostById = async (req, res, next) => {
  try {
    const { rows } = await pool.query(
      `SELECT * FROM posts WHERE id = $1 AND is_deleted = FALSE AND expires_at > NOW()`,
      [req.params.id]
    );
    if (!rows.length) return res.status(404).json({ error: 'Post not found' });
    res.json(rows[0]);
  } catch (err) {
    next(err);
  }
};

exports.createPost = async (req, res, next) => {
  try {
    const { title, content, tags = [], session_id } = req.body;
    if (!title || !content) return res.status(400).json({ error: 'Title and content are required' });

    const anonymous_name = generateName();
    const sentiment = detectSentiment(`${title} ${content}`);
    const ai_reply = process.env.GROQ_API_KEY ? await getAIReply(title, content) : null;

    const { rows } = await pool.query(
      `INSERT INTO posts (anonymous_name, session_id, title, content, tags, sentiment, ai_reply)
       VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
      [anonymous_name, session_id || null, title, content, tags, sentiment, ai_reply]
    );
    res.status(201).json(rows[0]);
  } catch (err) {
    next(err);
  }
};

exports.votePost = async (req, res, next) => {
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
        `UPDATE posts SET ${col} = GREATEST(${col} - 1, 0) WHERE id = $1 RETURNING upvotes, downvotes`,
        [id]
      );
      return res.json({ ...rows[0], voted: null });
    }

    await pool.query(
      `INSERT INTO votes (target_id, target_type, session_id, vote_type) VALUES ($1, 'post', $2, $3)`,
      [id, session_id, vote_type]
    );

    const col = vote_type === 'up' ? 'upvotes' : 'downvotes';
    const { rows } = await pool.query(
      `UPDATE posts SET ${col} = ${col} + 1 WHERE id = $1 RETURNING upvotes, downvotes`,
      [id]
    );
    res.json({ ...rows[0], voted: vote_type });
  } catch (err) {
    next(err);
  }
};

exports.deleteExpiredPosts = async () => {
  await pool.query(`UPDATE posts SET is_deleted = TRUE WHERE expires_at < NOW() AND is_deleted = FALSE`);
};
