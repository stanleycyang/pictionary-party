-- Pictionary Party Database Schema
-- Run this in your Supabase SQL Editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Rooms table
CREATE TABLE IF NOT EXISTS rooms (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  code VARCHAR(6) UNIQUE NOT NULL,
  host_id VARCHAR(100) NOT NULL,
  status VARCHAR(20) DEFAULT 'lobby' CHECK (status IN ('lobby', 'playing', 'finished')),
  settings JSONB DEFAULT '{"timer_seconds": 60, "difficulty": "medium", "max_players": 8, "allow_tag_team": true}'::jsonb,
  current_round INT DEFAULT 0,
  total_rounds INT DEFAULT 10,
  current_word VARCHAR(100),
  drawing_team INT DEFAULT 1 CHECK (drawing_team IN (1, 2)),
  round_start_time TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Players table
CREATE TABLE IF NOT EXISTS players (
  id VARCHAR(100) PRIMARY KEY,
  room_id UUID REFERENCES rooms(id) ON DELETE CASCADE,
  name VARCHAR(50) NOT NULL,
  team INT CHECK (team IN (1, 2)),
  is_drawing BOOLEAN DEFAULT FALSE,
  score INT DEFAULT 0,
  is_ready BOOLEAN DEFAULT FALSE,
  is_host BOOLEAN DEFAULT FALSE,
  connected_at TIMESTAMPTZ DEFAULT NOW(),
  last_seen TIMESTAMPTZ DEFAULT NOW()
);

-- Drawing strokes (for replay/reconnect)
CREATE TABLE IF NOT EXISTS drawing_strokes (
  id SERIAL PRIMARY KEY,
  room_id UUID REFERENCES rooms(id) ON DELETE CASCADE,
  round INT NOT NULL,
  player_id VARCHAR(100) NOT NULL,
  stroke_data JSONB NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Chat messages
CREATE TABLE IF NOT EXISTS chat_messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  room_id UUID REFERENCES rooms(id) ON DELETE CASCADE,
  player_id VARCHAR(100) NOT NULL,
  player_name VARCHAR(50) NOT NULL,
  text TEXT NOT NULL,
  is_correct_guess BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_rooms_code ON rooms(code);
CREATE INDEX IF NOT EXISTS idx_rooms_status ON rooms(status);
CREATE INDEX IF NOT EXISTS idx_players_room_id ON players(room_id);
CREATE INDEX IF NOT EXISTS idx_drawing_strokes_room_id ON drawing_strokes(room_id);
CREATE INDEX IF NOT EXISTS idx_chat_messages_room_id ON chat_messages(room_id);

-- Row Level Security (RLS) policies
ALTER TABLE rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE players ENABLE ROW LEVEL SECURITY;
ALTER TABLE drawing_strokes ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;

-- Allow anyone to read/write (for simplicity in game context)
-- In production, you'd want more restrictive policies
CREATE POLICY "Allow all access to rooms" ON rooms FOR ALL USING (true);
CREATE POLICY "Allow all access to players" ON players FOR ALL USING (true);
CREATE POLICY "Allow all access to drawing_strokes" ON drawing_strokes FOR ALL USING (true);
CREATE POLICY "Allow all access to chat_messages" ON chat_messages FOR ALL USING (true);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for rooms updated_at
CREATE TRIGGER rooms_updated_at
  BEFORE UPDATE ON rooms
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

-- Function to clean up old rooms (run periodically)
CREATE OR REPLACE FUNCTION cleanup_old_rooms()
RETURNS void AS $$
BEGIN
  DELETE FROM rooms 
  WHERE created_at < NOW() - INTERVAL '24 hours'
  AND status = 'finished';
  
  DELETE FROM rooms 
  WHERE created_at < NOW() - INTERVAL '2 hours'
  AND status = 'lobby';
END;
$$ LANGUAGE plpgsql;

-- Enable Realtime for tables
ALTER PUBLICATION supabase_realtime ADD TABLE rooms;
ALTER PUBLICATION supabase_realtime ADD TABLE players;
ALTER PUBLICATION supabase_realtime ADD TABLE chat_messages;

COMMENT ON TABLE rooms IS 'Game rooms for Pictionary Party';
COMMENT ON TABLE players IS 'Players currently in rooms';
COMMENT ON TABLE drawing_strokes IS 'Drawing data for replay/reconnect';
COMMENT ON TABLE chat_messages IS 'Chat messages for guessing';
