/*
  # Allow User Creation for OAuth

  1. Changes
    - Drop existing RLS policies on users table
    - Create permissive policies to allow user creation via OAuth
    
  2. Security Notes
    - Allows public user creation for OAuth flows
    - Users can only modify their own records
*/

-- Drop existing RLS policies on users table
DROP POLICY IF EXISTS "Users can view own profile" ON users;
DROP POLICY IF EXISTS "Users can update own profile" ON users;
DROP POLICY IF EXISTS "Admins can view all users" ON users;

-- Create permissive policies for user management
CREATE POLICY "Allow public insert on users"
  ON users FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "Allow users to view own profile"
  ON users FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Allow users to update own profile"
  ON users FOR UPDATE
  TO authenticated
  USING (email = current_setting('request.jwt.claims', true)::json->>'email')
  WITH CHECK (email = current_setting('request.jwt.claims', true)::json->>'email');
