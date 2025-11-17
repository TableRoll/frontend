-- Migration 003: Fix Campaign Delete Behavior
-- When deleting a campaign, set map references to NULL instead of cascade deleting

-- Step 1: Drop the existing foreign key constraint on maps.campaign_id
ALTER TABLE maps 
DROP CONSTRAINT IF EXISTS maps_campaign_id_fkey;

-- Step 2: Make campaign_id nullable if it isn't already
ALTER TABLE maps 
ALTER COLUMN campaign_id DROP NOT NULL;

-- Step 3: Re-add the foreign key with ON DELETE SET NULL
ALTER TABLE maps 
ADD CONSTRAINT maps_campaign_id_fkey 
FOREIGN KEY (campaign_id) 
REFERENCES campaigns(id) 
ON DELETE SET NULL;

-- Step 4: Add a proper foreign key constraint for campaigns.current_map_id
-- First, ensure any invalid references are set to NULL
UPDATE campaigns 
SET current_map_id = NULL 
WHERE current_map_id IS NOT NULL 
AND current_map_id NOT IN (SELECT id FROM maps);

-- Add the foreign key constraint
ALTER TABLE campaigns
ADD CONSTRAINT campaigns_current_map_id_fkey
FOREIGN KEY (current_map_id)
REFERENCES maps(id)
ON DELETE SET NULL;

-- Step 5: Create indexes for the relationships
CREATE INDEX IF NOT EXISTS idx_maps_campaign ON maps(campaign_id);
CREATE INDEX IF NOT EXISTS idx_campaigns_current_map ON campaigns(current_map_id);

-- Note: With these changes:
-- - Deleting a campaign will set campaign_id to NULL in maps (maps remain)
-- - Deleting a map will set current_map_id to NULL in campaigns (campaigns remain)
-- - Maps can exist without a campaign (campaign_id = NULL)









