-- Migration 007: Enforce unique campaign-map relationship
-- A map can only belong to ONE campaign at a time

-- Find and fix campaigns that share the same map
-- Keep the first campaign's assignment, clear others

-- Temporary table to track the "primary" campaign for each map
CREATE TEMP TABLE map_primary_campaign AS
SELECT DISTINCT ON (current_map_id) 
  id as campaign_id, 
  current_map_id as map_id
FROM campaigns
WHERE current_map_id IS NOT NULL
ORDER BY current_map_id, created_at ASC; -- First created campaign wins

-- Clear current_map_id from campaigns that don't "own" the map
UPDATE campaigns c
SET current_map_id = NULL, updated_at = NOW()
WHERE current_map_id IS NOT NULL
  AND NOT EXISTS (
    SELECT 1 FROM map_primary_campaign mpc
    WHERE mpc.campaign_id = c.id AND mpc.map_id = c.current_map_id
  );

-- Set campaign_id on maps to match their primary campaign
UPDATE maps m
SET campaign_id = mpc.campaign_id, updated_at = NOW()
FROM map_primary_campaign mpc
WHERE m.id = mpc.map_id;

-- Log results
DO $$
DECLARE
  cleared_count INTEGER;
  assigned_count INTEGER;
BEGIN
  -- Count campaigns that lost their map
  SELECT COUNT(*) INTO cleared_count
  FROM campaigns
  WHERE current_map_id IS NULL;
  
  -- Count maps now properly assigned
  SELECT COUNT(*) INTO assigned_count
  FROM maps
  WHERE campaign_id IS NOT NULL;
  
  RAISE NOTICE 'Enforced unique campaign-map relationships:';
  RAISE NOTICE '  - % campaigns with no map assigned', cleared_count;
  RAISE NOTICE '  - % maps properly assigned to campaigns', assigned_count;
  RAISE NOTICE 'Rule: One map can only belong to one campaign at a time';
END $$;

-- Display final state
SELECT 
  c.id as campaign_id,
  c.name as campaign_name,
  c.current_map_id,
  m.name as map_name,
  m.campaign_id as maps_campaign_id,
  CASE 
    WHEN c.current_map_id = m.id AND m.campaign_id = c.id THEN '✅ OK'
    WHEN c.current_map_id IS NULL THEN '⚠️ No map'
    ELSE '❌ ERROR'
  END as status
FROM campaigns c
LEFT JOIN maps m ON c.current_map_id = m.id
ORDER BY c.created_at DESC;








