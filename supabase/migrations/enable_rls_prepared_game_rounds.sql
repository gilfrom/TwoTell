-- Enable RLS on prepared_game_rounds table
ALTER TABLE prepared_game_rounds ENABLE ROW LEVEL SECURITY;

-- Allow authenticated users to read all rounds
CREATE POLICY "Allow authenticated users to read game rounds"
ON prepared_game_rounds
FOR SELECT
TO authenticated
USING (true);

-- Allow authenticated users to delete rounds
CREATE POLICY "Allow authenticated users to delete game rounds"
ON prepared_game_rounds
FOR DELETE
TO authenticated
USING (true);

-- Allow authenticated users to update rounds (for image changes)
CREATE POLICY "Allow authenticated users to update game rounds"
ON prepared_game_rounds
FOR UPDATE
TO authenticated
USING (true);

-- Allow service role to do everything (for Edge Functions)
CREATE POLICY "Allow service role full access"
ON prepared_game_rounds
FOR ALL
TO service_role
USING (true);
