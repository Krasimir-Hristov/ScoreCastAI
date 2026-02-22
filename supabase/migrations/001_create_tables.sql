-- 001_create_tables.sql

-- predictions: stores AI-generated deep dive results per user per match
CREATE TABLE IF NOT EXISTS predictions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  match_id TEXT NOT NULL,
  prediction_data JSONB NOT NULL, -- { outcome, confidence, reasoning }
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- favorites: user-bookmarked matches
CREATE TABLE IF NOT EXISTS favorites (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  match_id TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  UNIQUE (user_id, match_id)
);

-- match_history: recently viewed matches
CREATE TABLE IF NOT EXISTS match_history (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  match_id TEXT NOT NULL,
  viewed_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- Enable RLS
ALTER TABLE predictions ENABLE ROW LEVEL SECURITY;
ALTER TABLE favorites ENABLE ROW LEVEL SECURITY;
ALTER TABLE match_history ENABLE ROW LEVEL SECURITY;

-- RLS policies: users can only access their own rows
DROP POLICY IF EXISTS "Users can select own predictions" ON predictions;
DROP POLICY IF EXISTS "Users can insert own predictions" ON predictions;
DROP POLICY IF EXISTS "Users can delete own predictions" ON predictions;

CREATE POLICY "Users can select own predictions"
  ON predictions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own predictions"
  ON predictions FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete own predictions"
  ON predictions FOR DELETE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can select own favorites" ON favorites;
DROP POLICY IF EXISTS "Users can insert own favorites" ON favorites;
DROP POLICY IF EXISTS "Users can delete own favorites" ON favorites;

CREATE POLICY "Users can select own favorites"
  ON favorites FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own favorites"
  ON favorites FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete own favorites"
  ON favorites FOR DELETE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can select own history" ON match_history;
DROP POLICY IF EXISTS "Users can insert own history" ON match_history;
DROP POLICY IF EXISTS "Users can delete own history" ON match_history;

CREATE POLICY "Users can select own history"
  ON match_history FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own history"
  ON match_history FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own history"
  ON match_history FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete own history"
  ON match_history FOR DELETE USING (auth.uid() = user_id);

-- Indexes for common queries
CREATE INDEX IF NOT EXISTS idx_predictions_user ON predictions(user_id);
CREATE INDEX IF NOT EXISTS idx_favorites_user ON favorites(user_id);
CREATE INDEX IF NOT EXISTS idx_history_user ON match_history(user_id);
CREATE INDEX IF NOT EXISTS idx_history_viewed ON match_history(user_id, viewed_at DESC);
