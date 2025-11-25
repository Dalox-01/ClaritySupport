/*
  # Disable RLS for Demo Mode

  1. Changes
    - Temporarily disable RLS policies that require authentication
    - Allow public access to emails table for demo purposes
    
  2. Security Notes
    - This is for demo purposes only
    - In production, proper authentication should be implemented
*/

-- Drop existing RLS policies on emails table
DROP POLICY IF EXISTS "Users can view own emails" ON emails;
DROP POLICY IF EXISTS "Users can create own emails" ON emails;
DROP POLICY IF EXISTS "Users can delete own emails" ON emails;
DROP POLICY IF EXISTS "Admins can view all emails" ON emails;

-- Create permissive policies for demo
CREATE POLICY "Allow public read on emails"
  ON emails FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Allow public insert on emails"
  ON emails FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "Allow public delete on emails"
  ON emails FOR DELETE
  TO anon, authenticated
  USING (true);
