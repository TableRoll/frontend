-- Migration 006: Fix existing campaign-map bidirectional relationships
-- For campaigns that have current_map_id but the map doesn't have campaign_id set

-- Update maps to point back to their campaigns
UPDATE maps m
SET campaign_id = c.id, updated_at = NOW()
FROM campaigns c
WHERE c.current_map_id = m.id 
  AND m.campaign_id IS NULL;

-- Log the changes
DO $$
DECLARE
  updated_count INTEGER;
BEGIN
  GET DIAGNOSTICS updated_count = ROW_COUNT;
  RAISE NOTICE 'Fixed % maps to have proper campaign_id set', updated_count;
END $$;

-- Verify: Show campaigns and their maps
DO $$
BEGIN
  RAISE NOTICE 'Current campaign-map relationships:';
END $$;

SELECT 
  c.id as campaign_id,
  c.name as campaign_name,
  c.current_map_id,
  m.name as map_name,
  m.campaign_id as maps_campaign_id,
  CASE 
    WHEN c.current_map_id = m.id AND m.campaign_id = c.id THEN 'OK - Bidirectional'
    WHEN c.current_map_id = m.id AND m.campaign_id IS NULL THEN 'ERROR - Map missing campaign_id'
    WHEN c.current_map_id = m.id AND m.campaign_id != c.id THEN 'ERROR - Map points to different campaign'
    WHEN c.current_map_id IS NULL THEN 'OK - No map assigned'
    ELSE 'OK'
  END as status
FROM campaigns c
LEFT JOIN maps m ON c.current_map_id = m.id
ORDER BY c.created_at DESC;








