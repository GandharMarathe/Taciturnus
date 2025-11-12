-- Rooms table
CREATE TABLE rooms (
  id SERIAL PRIMARY KEY,
  room_id VARCHAR(8) UNIQUE NOT NULL,
  name VARCHAR(255) NOT NULL,
  participants TEXT[] DEFAULT '{}',
  ai_mode VARCHAR(50) DEFAULT 'summarizer',
  last_summary TIMESTAMP DEFAULT NOW(),
  created_at TIMESTAMP DEFAULT NOW()
);

-- Messages table
CREATE TABLE messages (
  id SERIAL PRIMARY KEY,
  room_id VARCHAR(8) REFERENCES rooms(room_id),
  sender VARCHAR(255) NOT NULL,
  text TEXT NOT NULL,
  is_ai BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_messages_room_id ON messages(room_id);
CREATE INDEX idx_messages_created_at ON messages(created_at);