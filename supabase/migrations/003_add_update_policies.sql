-- 003_add_update_policies.sql

-- Add missing UPDATE policies for RLS (idempotent: drop-if-exists first)

-- predictions
DROP POLICY IF EXISTS "Users can update own predictions" ON predictions;
CREATE POLICY "Users can update own predictions"
  ON predictions FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- favorites
DROP POLICY IF EXISTS "Users can update own favorites" ON favorites;
CREATE POLICY "Users can update own favorites"
  ON favorites FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- match_history
DROP POLICY IF EXISTS "Users can update own history" ON match_history;
CREATE POLICY "Users can update own history"
  ON match_history FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
