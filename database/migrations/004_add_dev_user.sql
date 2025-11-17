-- Migration 004: Add Development User
-- Creates a test user for development with the mock token

-- Check if user already exists, insert if not
INSERT INTO users (id, email, username, display_name, password_hash, role, is_email_verified)
VALUES (
  '00000000-0000-0000-0000-000000000001',
  'dev@example.com',
  'developer',
  'Development User',
  '$2a$10$dummyhashjustfordevelopmentusage', -- Not a real bcrypt hash, but acceptable for dev
  'admin',
  true
)
ON CONFLICT (id) DO NOTHING;

-- Log the creation
DO $$
BEGIN
  RAISE NOTICE 'Development user created or already exists: dev@example.com (ID: 00000000-0000-0000-0000-000000000001)';
END $$;









