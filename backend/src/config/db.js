const { Pool } = require('pg');
require('dotenv').config();
const logger = require('../utils/logger');

const pool = new Pool(
  process.env.DATABASE_URL
    ? { 
        connectionString: process.env.DATABASE_URL, 
        ssl: { rejectUnauthorized: false }
      }
    : {
        host: process.env.DB_HOST,
        port: process.env.DB_PORT,
        database: process.env.DB_NAME,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
      }
);

const initDB = async () => {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS posts (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      anonymous_name VARCHAR(50) NOT NULL,
      session_id VARCHAR(100),
      title VARCHAR(255) NOT NULL,
      content TEXT NOT NULL,
      tags TEXT[] DEFAULT '{}',
      upvotes INT DEFAULT 0,
      downvotes INT DEFAULT 0,
      sentiment VARCHAR(20) DEFAULT 'neutral',
      ai_reply TEXT,
      is_deleted BOOLEAN DEFAULT FALSE,
      created_at TIMESTAMP DEFAULT NOW(),
      expires_at TIMESTAMP DEFAULT NOW() + INTERVAL '24 hours'
    );

    CREATE TABLE IF NOT EXISTS comments (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      post_id UUID REFERENCES posts(id) ON DELETE CASCADE,
      anonymous_name VARCHAR(50) NOT NULL,
      content TEXT NOT NULL,
      upvotes INT DEFAULT 0,
      downvotes INT DEFAULT 0,
      created_at TIMESTAMP DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS votes (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      target_id UUID NOT NULL,
      target_type VARCHAR(10) NOT NULL,
      session_id VARCHAR(100) NOT NULL,
      vote_type VARCHAR(10) NOT NULL,
      created_at TIMESTAMP DEFAULT NOW(),
      UNIQUE(target_id, session_id)
    );

    CREATE TABLE IF NOT EXISTS reports (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      target_id UUID NOT NULL,
      target_type VARCHAR(10) NOT NULL,
      reason TEXT NOT NULL,
      session_id VARCHAR(100) NOT NULL,
      created_at TIMESTAMP DEFAULT NOW()
    );
    CREATE TABLE IF NOT EXISTS notifications (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      session_id VARCHAR(100) NOT NULL,
      type VARCHAR(30) NOT NULL,
      message TEXT NOT NULL,
      post_id UUID REFERENCES posts(id) ON DELETE CASCADE,
      is_read BOOLEAN DEFAULT FALSE,
      created_at TIMESTAMP DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS identities (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      session_id VARCHAR(100) UNIQUE NOT NULL,
      recovery_code VARCHAR(20) UNIQUE NOT NULL,
      created_at TIMESTAMP DEFAULT NOW(),
      last_seen TIMESTAMP DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS chat_messages (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      post_id UUID REFERENCES posts(id) ON DELETE CASCADE,
      session_id VARCHAR(100) NOT NULL,
      role VARCHAR(10) NOT NULL,
      content TEXT NOT NULL,
      created_at TIMESTAMP DEFAULT NOW()
    );
  `);
  // Migrations - add columns if not exist
  await pool.query(`
    ALTER TABLE posts ADD COLUMN IF NOT EXISTS session_id VARCHAR(100);
  `);

  console.log('Database initialized');
};

module.exports = { pool, initDB };
