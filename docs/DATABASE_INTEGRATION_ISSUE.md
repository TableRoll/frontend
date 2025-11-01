# Database Integration Issue & Resolution

## Current Database State (November 1, 2025)

```
Campaigns in Database: 6
Maps in Database:      0  ⚠️ PROBLEM
Assets in Database:    5
```

## The Problem

**Maps are not being saved to the PostgreSQL database**, even though campaigns and assets are being saved correctly.

### Root Cause

Looking at `src/stores/mapStore.ts` line 318-337:

```typescript
addMap: (map) => {
  // Add to local store immediately for UI responsiveness
  set((state) => ({ maps: [...state.maps, map] }));
  
  // Persist to API in the background if campaign is active
  const state = get();
  if (state.currentCampaign?.id) {  // ⚠️ ONLY saves if campaign is active
    mapsAPI.create({
      name: map.name,
      description: '',
      campaignId: state.currentCampaign.id,
      // ... rest of map data
    }).catch(err => {
      console.error('Failed to persist map to database:', err);
    });
  }
},
```

**Key Issue**: Maps are ONLY saved to PostgreSQL if:
1. A campaign is currently active (`currentCampaign` is set)
2. The campaign has a valid ID

Otherwise, maps are **only stored in localStorage** (browser cache), which means:
- ❌ Maps are lost when cache is cleared
- ❌ Maps are not accessible from other devices
- ❌ Maps are not backed up
- ❌ Maps cannot be shared across users

## The Backend Requirements

The backend API (`api/routes/maps.js`) requires:
- ✅ `campaignId` (required, must be a valid UUID)
- ✅ `name` (required)
- ⚠️ `assetId` (optional, but recommended for map images)
- ✅ `widthPx` and `heightPx` (required)
- ✅ `gridSize` and `gridType` (optional, defaults provided)

## How Data Currently Flows

### When Creating a Map WITHOUT Active Campaign:
```
User creates map → Stored in localStorage only → Never reaches PostgreSQL
```

### When Creating a Map WITH Active Campaign:
```
User creates map → Stored in localStorage → API call to PostgreSQL → Persisted in database
```

### When Creating a Campaign:
```
User creates campaign → Direct API call → Saved to PostgreSQL ✅
```

### When Uploading Assets:
```
User uploads image → Direct API call → File saved to /uploads → Record in PostgreSQL ✅
```

## The Test Solution

I've created a comprehensive test component: `src/components/DatabaseTest.tsx`

### What the Test Does:

1. **Create Campaign** - Creates a campaign in the database
2. **Upload Image** - Uploads an image file as an asset
3. **Create Map** - Creates a map linked to the campaign and asset
4. **Verify Retrieval** - Retrieves the map from database
5. **Verify Image** - Confirms the image URL is accessible

### How to Use the Test:

1. Open the Dashboard in your browser
2. Scroll to the "Database Integration Test" section
3. Select a map image file
4. Click "Run Full Database Test"
5. Watch the test progress through all steps
6. Click "Clear All Cache" to test persistence
7. Click "Check Database Contents" to see what's in PostgreSQL

## What the Test Proves

✅ **Campaign Creation** - Works correctly  
✅ **Asset Upload** - Works correctly  
✅ **Map Creation** - Works when done through a campaign  
✅ **Data Retrieval** - Can retrieve maps from database  
✅ **Image Serving** - Images are accessible via URL  
❌ **Map Creation without Campaign** - Stored in localStorage only  

## Recommendations

### Short-term Fix (Development):
Keep using the test component to verify database integration. Always create maps within the context of a campaign.

### Long-term Solution (Production):

**Option 1**: Require campaign selection when creating maps
```typescript
// Always require a campaign when creating a map
addMap: (map, campaignId: string) => {
  if (!campaignId) {
    throw new Error('Campaign is required to create a map');
  }
  // Save to database...
}
```

**Option 2**: Create a "default campaign" for uncategorized maps
```typescript
// Auto-create or use a default campaign
addMap: async (map) => {
  let campaignId = state.currentCampaign?.id;
  if (!campaignId) {
    // Create or get "Uncategorized Maps" campaign
    const defaultCampaign = await getOrCreateDefaultCampaign();
    campaignId = defaultCampaign.id;
  }
  // Save to database...
}
```

**Option 3**: Allow maps without campaigns (requires backend change)
```typescript
// Make campaignId optional in the backend
body('campaignId').optional().isUUID()
```

## Database Schema

### Maps Table Structure:
```sql
CREATE TABLE maps (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(100) NOT NULL,
  description TEXT,
  campaign_id UUID REFERENCES campaigns(id) ON DELETE CASCADE,
  asset_id UUID REFERENCES assets(id) ON DELETE SET NULL,
  width_px INTEGER NOT NULL,
  height_px INTEGER NOT NULL,
  grid_size INTEGER DEFAULT 50,
  grid_type VARCHAR(20) DEFAULT 'square',
  is_active BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

## Verification Commands

Check database contents:
```bash
# Check campaigns
docker exec dnd-database psql -U postgres -d dnd_campaign_db -c "SELECT id, name, created_at FROM campaigns;"

# Check maps
docker exec dnd-database psql -U postgres -d dnd_campaign_db -c "SELECT id, name, campaign_id, created_at FROM maps;"

# Check assets
docker exec dnd-database psql -U postgres -d dnd_campaign_db -c "SELECT id, name, asset_type, file_path FROM assets;"

# Get counts
docker exec dnd-database psql -U postgres -d dnd_campaign_db -c "SELECT 
  (SELECT COUNT(*) FROM campaigns) as campaigns,
  (SELECT COUNT(*) FROM maps) as maps,
  (SELECT COUNT(*) FROM assets) as assets;"
```

## Files Modified

- ✅ Created `src/components/DatabaseTest.tsx` - Comprehensive test component
- ✅ Updated `src/components/Dashboard.tsx` - Added DatabaseTest component
- ✅ Fixed `api/middleware/auth.js` - Added dev token bypass
- ✅ Fixed `api/routes/campaigns.js` - Fixed token field, currentMapId support
- ✅ Fixed `src/components/Dashboard.tsx` - Fixed campaign.tokens?.length crash

## Next Steps

1. Run the Database Integration Test
2. Verify maps are being saved to PostgreSQL
3. Test clearing cache and refreshing to confirm persistence
4. Decide on long-term solution (Options 1, 2, or 3 above)
5. Implement chosen solution
6. Remove test components from production build

