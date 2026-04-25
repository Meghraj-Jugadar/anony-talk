const { pool } = require('../config/db');
const { v4: uuidv4 } = require('uuid');

const generateRecoveryCode = () => {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  const segment = () => Array.from({ length: 4 }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
  return `${segment()}-${segment()}-${segment()}`;
};

// Create or restore identity
exports.getOrCreateIdentity = async (req, res, next) => {
  try {
    const cookieSessionId = req.cookies?.anony_session;

    if (cookieSessionId) {
      // Verify it exists in DB
      const { rows } = await pool.query(
        `UPDATE identities SET last_seen = NOW() WHERE session_id = $1 RETURNING session_id, recovery_code`,
        [cookieSessionId]
      );
      if (rows.length) {
        res.cookie('anony_session', rows[0].session_id, {
          maxAge: 365 * 24 * 60 * 60 * 1000,
          httpOnly: true,
          sameSite: 'none',
          secure: true,
        });
        return res.json({ session_id: rows[0].session_id, recovery_code: rows[0].recovery_code, isNew: false });
      }
    }

    // Create new identity
    const session_id = uuidv4();
    const recovery_code = generateRecoveryCode();

    await pool.query(
      `INSERT INTO identities (session_id, recovery_code) VALUES ($1, $2)`,
      [session_id, recovery_code]
    );

    res.cookie('anony_session', session_id, {
      maxAge: 365 * 24 * 60 * 60 * 1000,
      httpOnly: true,
      sameSite: 'none',
      secure: true,
    });

    res.json({ session_id, recovery_code, isNew: true });
  } catch (err) {
    next(err);
  }
};

// Recover identity using recovery code
exports.recoverIdentity = async (req, res, next) => {
  try {
    const { recovery_code } = req.body;
    if (!recovery_code) return res.status(400).json({ error: 'Recovery code required' });

    const { rows } = await pool.query(
      `UPDATE identities SET last_seen = NOW() WHERE recovery_code = $1 RETURNING session_id, recovery_code`,
      [recovery_code.toUpperCase().trim()]
    );

    if (!rows.length) return res.status(404).json({ error: 'Invalid recovery code' });

    res.cookie('anony_session', rows[0].session_id, {
      maxAge: 365 * 24 * 60 * 60 * 1000,
      httpOnly: true,
      sameSite: 'none',
      secure: true,
    });

    res.json({ session_id: rows[0].session_id, recovery_code: rows[0].recovery_code, isNew: false });
  } catch (err) {
    next(err);
  }
};
