-- Add metadata columns to predictions table
ALTER TABLE predictions 
ADD COLUMN home_team TEXT,
ADD COLUMN away_team TEXT,
ADD COLUMN match_date TIMESTAMP WITH TIME ZONE;

-- Add metadata columns to match_history table
ALTER TABLE match_history
ADD COLUMN home_team TEXT,
ADD COLUMN away_team TEXT,
ADD COLUMN match_date TIMESTAMP WITH TIME ZONE;
