-- Migration 005: Add owner_id to maps table
-- Maps should be owned by users AND belong to campaigns

-- Add owner_id column to maps table
ALTER TABLE maps 
ADD COLUMN IF NOT EXISTS owner_id UUID REFERENCES users(id) ON DELETE CASCADE;

-- Update existing maps to have an owner (set to campaign owner if exists)
UPDATE maps m
SET owner_id = c.owner_id
FROM campaigns c
WHERE m.campaign_id = c.id AND m.owner_id IS NULL;

-- For orphaned maps (no campaign), set owner from asset owner
UPDATE maps m
SET owner_id = a.owner_id
FROM assets a
WHERE m.asset_id = a.id AND m.owner_id IS NULL;

-- Make owner_id NOT NULL after updating existing data
ALTER TABLE maps 
ALTER COLUMN owner_id SET NOT NULL;

-- Add index for performance
CREATE INDEX IF NOT EXISTS idx_maps_owner ON maps(owner_id);

-- Log the change
DO $$
BEGIN
  RAISE NOTICE 'Maps table now has owner_id column. Maps are owned by users AND can belong to campaigns.';
END $$;










