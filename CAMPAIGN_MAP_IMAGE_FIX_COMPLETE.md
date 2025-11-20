# Campaign-Map Image Loading - Complete Fix

## Date: November 2, 2025

## Issues Identified and Fixed

### Problem 1: Maps Not Assigned to Campaigns
**Issue:** When creating a campaign with a map, the bidirectional relationship wasn't established.

**Root Cause:**
- Campaign had `current_map_id` set
- But map didn't have `campaign_id` set back to the campaign

**Fix Applied:**
✅ Updated `POST /api/campaigns` to set both directions:
```javascript
// Create campaign
INSERT INTO campaigns (..., current_map_id) VALUES (..., mapId)

// Assign map to campaign
UPDATE maps SET campaign_id = campaign.id WHERE id = mapId
```

---

### Problem 2: Map Images Not Loading
**Issue:** When viewing a campaign's map, no image was displayed.

**Root Causes:**
1. Campaign GET endpoint didn't return full map data with image URLs
2. Frontend transformation didn't build proper asset URLs
3. API returned file paths, not full URLs

**Fix Applied:**
✅ **API** - Campaign GET endpoint now includes:
- Full map details (width, height, grid settings)
- Asset file path and thumbnail
- Complete map object in response

✅ **Frontend** - Map transformation now:
- Builds full URL using `assetsAPI.getFileUrl(assetId)`
- Sets both `thumbnail` and `tileSource` to the asset URL
- Handles missing assets gracefully

---

### Problem 3: Multiple Campaigns Sharing Same Map
**Issue:** One map was assigned to multiple campaigns, causing conflicts.

**Root Cause:**
- Multiple campaigns had same `current_map_id`
- Map could only have ONE `campaign_id`
- Created inconsistent state

**Fix Applied:**
✅ Migration 007 enforces one-map-one-campaign rule:
- Keeps assignment for the first (oldest) campaign
- Clears `current_map_id` from other campaigns
- Sets map's `campaign_id` correctly

---

## Complete Solution

### Database Schema (Maps Table)

```sql
CREATE TABLE maps (
  id          UUID PRIMARY KEY,
  name        VARCHAR(100) NOT NULL,
  campaign_id UUID REFERENCES campaigns(id) ON DELETE SET NULL,  -- Which campaign owns this map
  asset_id    UUID REFERENCES assets(id),                         -- Image file for the map
  owner_id    UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE, -- Who created this map
  width_px    INTEGER NOT NULL,
  height_px   INTEGER NOT NULL,
  grid_size   INTEGER DEFAULT 50,
  grid_type   VARCHAR(10) DEFAULT 'square',
  ...
);
```

### Relationship Rules

1. **User → Map (owner_id)**
   - User owns many maps
   - Maps can only have one owner
   - Deleting user deletes their maps (CASCADE)

2. **Campaign → Map (current_map_id)**
   - Campaign can have one current map (active map)
   - Map can belong to one campaign (campaign_id)
   - **Bidirectional:** Both fields must match
   - Deleting campaign clears map's campaign_id (SET NULL)

3. **Asset → Map (asset_id)**
   - Map uses one asset as background image
   - Many maps can use the same asset
   - Asset stores the actual image file

---

## API Endpoints Updated

### POST /api/campaigns
**Required:** `name`, `currentMapId`

**Process:**
1. Validate map exists and belongs to user
2. Create campaign with `current_map_id`
3. Update map with `campaign_id`
4. Return campaign with map data

**Example:**
```json
POST /api/campaigns
{
  "name": "Curse of Strahd",
  "currentMapId": "map-uuid"
}

Response:
{
  "campaign": {
    "id": "campaign-uuid",
    "currentMapId": "map-uuid",
    ...
  }
}
```

### GET /api/campaigns/:id
**Returns:**
- Campaign details
- Full map object with image URLs
- Map dimensions and grid settings
- Characters and sessions

**Response Structure:**
```json
{
  "campaign": {
    "id": "...",
    "name": "...",
    "currentMapId": "map-uuid",
    "currentMapName": "Dragon's Lair",
    "map": {
      "id": "map-uuid",
      "name": "Dragon's Lair",
      "widthPx": 2048,
      "heightPx": 1536,
      "gridSize": 50,
      "gridType": "square",
      "assetId": "asset-uuid",
      "imageUrl": "http://localhost:3001/api/assets/file/asset-uuid",
      "thumbnail": "..."
    },
    "characters": [...],
    "sessions": [...]
  }
}
```

### PUT /api/campaigns/:id
**Map Change Logic:**
```javascript
// When changing current_map_id:
1. Unassign old map: UPDATE maps SET campaign_id = NULL WHERE id = old_map_id
2. Assign new map: UPDATE maps SET campaign_id = campaign_id WHERE id = new_map_id
3. Update campaign: UPDATE campaigns SET current_map_id = new_map_id
```

---

## Frontend Updates

### mapStoreWithAPI.ts

**transformMapFromAPI():**
```typescript
const transformMapFromAPI = (m: any): Map => {
  // Build full image URL from asset ID
  const imageUrl = m.assetId ? assetsAPI.getFileUrl(m.assetId) : '';
  
  return {
    ...
    thumbnail: imageUrl,    // Full URL for image
    tileSource: imageUrl,   // Full URL for PixiJS
    ...
  };
};
```

**setCurrentCampaign():**
- Loads maps for the campaign
- Finds campaign's current map
- Sets it as currentMap
- Falls back to fetching from API if not in cache

---

## Migrations Applied

1. ✅ **003_fix_campaign_delete.sql**
   - Changed map FK to `ON DELETE SET NULL`

2. ✅ **004_add_dev_user.sql**
   - Added development user

3. ✅ **005_add_maps_owner_id.sql**
   - Added `owner_id` to maps table

4. ✅ **006_fix_existing_campaign_map_links.sql**
   - Fixed bidirectional relationships for existing data

5. ✅ **007_enforce_unique_campaign_map.sql**
   - Enforced one-map-one-campaign rule
   - Cleaned up duplicate assignments

---

## Testing Workflow

### Create Campaign with Map:
1. Upload image → Creates asset
2. Create map with asset → Map has owner_id and asset_id
3. Create campaign → Select the map
   - ✅ Campaign gets current_map_id
   - ✅ Map gets campaign_id
   - ✅ Bidirectional link established

### View Campaign Map:
1. Select campaign in dashboard
2. Click "Map" tab
3. ✅ Campaign loads with full map data
4. ✅ Map image URL constructed from asset_id
5. ✅ PixiJS loads and displays the image
6. ✅ Grid overlay appears based on map settings

### Change Campaign Map:
1. Go to campaign in dashboard
2. Change map dropdown
3. Save changes
4. ✅ Old map becomes unassigned (campaign_id = NULL)
5. ✅ New map assigned (campaign_id = campaign.id)
6. ✅ Campaign's current_map_id updated
7. ✅ Clicking "Map" tab shows new map image

---

## Verification Commands

### Check Campaign-Map Links:
```sql
SELECT 
  c.name as campaign,
  c.current_map_id,
  m.name as map,
  m.campaign_id,
  CASE 
    WHEN c.current_map_id = m.id AND m.campaign_id = c.id THEN '✅ OK'
    WHEN c.current_map_id IS NULL THEN '⚠️ No map'
    ELSE '❌ ERROR'
  END as status
FROM campaigns c
LEFT JOIN maps m ON c.current_map_id = m.id;
```

### Check Map Image URLs:
```sql
SELECT 
  m.name as map,
  a.file_path as image_file,
  a.mime_type
FROM maps m
JOIN assets a ON m.asset_id = a.id;
```

### Test Image URL (from browser):
```
http://localhost:3001/api/assets/file/{asset-id}?token={your-token}
```

---

## What Should Work Now

✅ Create campaign with map → Map assigned bidirectionally
✅ View campaign map → Image loads correctly  
✅ Change campaign map → Old map unassigned, new map assigned
✅ Delete campaign → Map preserved, becomes unassigned
✅ Map canvas → Displays image with PixiJS
✅ Grid overlay → Renders on top of image
✅ Zoom/pan controls → Work with loaded image

---

## Common Issues & Solutions

### Issue: "No map image available"
**Check:**
- Does map have `asset_id` set?
- Does asset exist in database?
- Does asset file exist in `uploads/` folder?

**Fix:**
```sql
SELECT m.*, a.file_path 
FROM maps m 
LEFT JOIN assets a ON m.asset_id = a.id 
WHERE m.id = 'your-map-id';
```

### Issue: Map not assigned to campaign
**Check:**
```sql
SELECT campaign_id FROM maps WHERE id = 'your-map-id';
```

**Fix:**
```sql
UPDATE maps SET campaign_id = 'your-campaign-id' WHERE id = 'your-map-id';
UPDATE campaigns SET current_map_id = 'your-map-id' WHERE id = 'your-campaign-id';
```

### Issue: PixiJS CSP error
**Solution:** Already fixed with PixiJS v8 upgrade

---

## Files Modified

### Backend:
- `api/routes/campaigns.js` - Campaign creation & map assignment
- `api/routes/maps.js` - Map ownership queries
- `database/migrations/003-007` - Database schema fixes

### Frontend:
- `src/stores/mapStoreWithAPI.ts` - Map URL transformation
- `src/components/MapCanvas.tsx` - PixiJS v8 upgrade
- `src/App.tsx` - Notification positioning
- `src/index.css` - Notification styles

---

## Next Steps

1. **Test the complete workflow:**
   - Upload an image
   - Create a map
   - Create a campaign with that map
   - View the map in the "Map" tab
   - Image should load ✅

2. **Test map changing:**
   - Create another map
   - Change campaign's map
   - View should update to new map

3. **Verify in browser console:**
   - Check for any PixiJS errors
   - Check network tab for failed image loads
   - Verify asset URLs are correct

The frontend is currently rebuilding with all fixes applied! 🚀










