# Correct Workflow Implementation - Maps & Campaigns

## Date: November 1, 2025

## ✅ Correct Workflow (Now Implemented)

```
1. Create Map (standalone) → Saved to database
2. Create Campaign → Select from existing maps
3. Change Campaign Map → Select different map anytime
```

---

## What Changed

### Previous (WRONG) Workflow:
```
❌ Create Campaign first → Required for map creation → Map depends on campaign
```

### New (CORRECT) Workflow:
```
✅ Create Map first → Independent of campaigns → Link to campaign later
✅ Create Campaign → Choose any existing map
✅ Change Map → Switch campaign to different map anytime
```

---

## Database Changes

### 1. Made `campaign_id` Optional in Maps Table

**Before:**
```sql
campaign_id UUID NOT NULL REFERENCES campaigns(id)
```

**After:**
```sql
campaign_id UUID NULL REFERENCES campaigns(id)
```

**SQL Command:**
```sql
ALTER TABLE maps ALTER COLUMN campaign_id DROP NOT NULL;
```

### 2. Added `owner_id` to Maps Table

**New Column:**
```sql
ALTER TABLE maps ADD COLUMN owner_id UUID REFERENCES users(id);
```

**Why:**
- Maps can now exist without campaigns
- Need to track ownership for access control
- Users can only see their own maps

---

## Backend API Changes (`api/routes/maps.js`)

### 1. Made `campaignId` Optional in POST /maps

**Before:**
```javascript
body('campaignId').isUUID(),  // Required
```

**After:**
```javascript
body('campaignId').optional().isUUID(),  // Optional
```

### 2. Updated Campaign Verification

**Before:**
```javascript
// Always verify campaign exists
const campaignCheck = await query(...);
if (campaignCheck.rows.length === 0) {
  return res.status(404).json({ error: 'Campaign not found' });
}
```

**After:**
```javascript
// Only verify if campaignId provided
if (campaignId) {
  const campaignCheck = await query(...);
  if (campaignCheck.rows.length === 0) {
    return res.status(404).json({ error: 'Campaign not found' });
  }
}
```

### 3. Added owner_id to Map Creation

**Before:**
```javascript
INSERT INTO maps (name, description, campaign_id, ...)
VALUES ($1, $2, $3, ...)
```

**After:**
```javascript
INSERT INTO maps (name, description, campaign_id, ..., owner_id)
VALUES ($1, $2, $3, ..., $9)
```

### 4. Filter Maps by Owner

**Before:**
```javascript
SELECT * FROM maps WHERE campaign_id = $1
```

**After:**
```javascript
SELECT * FROM maps 
WHERE owner_id = $1  -- User can only see their own maps
AND (campaign_id = $2 OR campaign_id IS NULL)
```

---

## Frontend Changes

### 1. Store (`src/stores/mapStore.ts`)

**Before:**
```typescript
addMap: async (map) => {
  if (!campaignId) {
    throw new Error('Campaign required');  // ❌ Blocked
  }
  // Save to database
}
```

**After:**
```typescript
addMap: async (map) => {
  const campaignId = state.currentCampaign?.id;
  
  // Save to database with optional campaignId
  const response = await mapsAPI.create({
    name: map.name,
    campaignId: campaignId,  // ✅ Optional - can be undefined
    // ... other fields
  });
  
  return dbMap;
}
```

**Key Changes:**
- ✅ No longer requires campaign
- ✅ Automatically links to current campaign if one is active
- ✅ Works perfectly without active campaign

### 2. Dashboard (`src/components/Dashboard.tsx`)

#### A. Removed Campaign Requirement

**Before:**
```typescript
const handleCreateMap = async () => {
  if (!currentCampaign) {
    // Show error, prevent creation  ❌
    return;
  }
  // Create map
}
```

**After:**
```typescript
const handleCreateMap = async () => {
  // No campaign check - create freely ✅
  await addMap(map);
  
  // Show contextual success message
  notifications.show({
    message: currentCampaign 
      ? `Map saved and linked to ${currentCampaign.name}`
      : `Map saved. You can create a campaign using this map.`,
  });
}
```

#### B. Updated Modal Warning

**Before:**
```tsx
<Alert color="orange" title="Campaign Required">
  You need to create or select a campaign before creating a map.
</Alert>
```

**After:**
```tsx
{!currentCampaign && (
  <Alert color="blue" title="No Campaign Active">
    This map will be saved to your library. 
    You can create or select a campaign later and link this map to it.
  </Alert>
)}
```

**Changes:**
- Changed from orange (warning) to blue (info)
- Changed from blocking message to helpful explanation
- Only shows if no campaign is active (optional info)

#### C. Enabled Create Button

**Before:**
```tsx
<Button 
  onClick={handleCreateMap}
  disabled={!currentCampaign}  // ❌ Disabled without campaign
>
  Create Map
</Button>
```

**After:**
```tsx
<Button 
  onClick={handleCreateMap}
  // ✅ Always enabled
>
  Create Map
</Button>
```

---

## User Experience Flow

### Scenario 1: Create Map First (Most Common)

```
User Journey:
1. Click "New Map" button
2. Upload map image
3. Set map name, grid size
4. Click "Create Map"
5. ✅ Map saved to database (no campaign needed)
6. See success: "Map saved. You can create a campaign using this map."

Later:
7. Click "New Campaign"
8. Select the map from dropdown
9. Enter campaign name
10. Click "Create Campaign"
11. ✅ Campaign created with selected map
```

### Scenario 2: Create Map Within Campaign Context

```
User Journey:
1. User is working on "Dragon Quest" campaign
2. Click "New Map"
3. Upload map image
4. Click "Create Map"
5. ✅ Map saved and automatically linked to "Dragon Quest"
6. See success: "Map saved and linked to Dragon Quest"
```

### Scenario 3: Change Campaign Map (Already Implemented)

```
User Journey:
1. User has active campaign with "Village Map"
2. Click menu on campaign → "Change Map"
3. See list of all their maps
4. Select "Dungeon Map"
5. Click "Change Map"
6. ✅ Campaign now uses "Dungeon Map"
7. Previous map tokens are saved (can restore later)
```

---

## Features Now Enabled

### ✅ Map Library
- Users can build a collection of maps
- Maps exist independently
- Reuse maps across multiple campaigns

### ✅ Flexible Workflow
- Create maps before planning campaigns
- Import/create maps in bulk
- Organize maps by theme/location

### ✅ Campaign Map Switching
- Already implemented in Dashboard
- Change campaign map anytime
- Token positions saved per map

### ✅ Data Ownership
- Users only see their own maps
- Proper access control with `owner_id`
- Future: Enable map sharing between users

---

## API Endpoints

### Create Map
```http
POST /api/maps
Authorization: Bearer <token>

{
  "name": "Dungeon Level 1",
  "description": "Dark corridors and treasure rooms",
  "campaignId": "uuid-or-null",  // ✅ Optional
  "widthPx": 2048,
  "heightPx": 1536,
  "gridSize": 50,
  "gridType": "square"
}

Response:
{
  "message": "Map created successfully",
  "map": {
    "id": "generated-uuid",
    "name": "Dungeon Level 1",
    "campaignId": null,  // ✅ Can be null
    "ownerId": "user-uuid",
    ...
  }
}
```

### Get All Maps (Mine)
```http
GET /api/maps
Authorization: Bearer <token>

Response:
{
  "maps": [
    {
      "id": "uuid-1",
      "name": "Village Map",
      "campaignId": "campaign-uuid",  // Linked to campaign
      ...
    },
    {
      "id": "uuid-2",
      "name": "Standalone Dungeon",
      "campaignId": null,  // ✅ Not linked yet
      ...
    }
  ]
}
```

### Create Campaign with Map
```http
POST /api/campaigns

{
  "name": "Dragon Quest",
  "description": "Epic adventure",
  "currentMapId": "map-uuid"  // Select from existing maps
}
```

---

## Testing

### Test 1: Create Standalone Map

1. **Open Dashboard**
2. **Click "New Map"** (don't create campaign first)
3. **Fill map details**
4. **Click "Create Map"**
5. **Verify:**
   - Success notification shows
   - No error about missing campaign
   - Message says "You can create a campaign using this map"

6. **Check database:**
```bash
docker exec dnd-database psql -U postgres -d dnd_campaign_db -c "SELECT id, name, campaign_id, owner_id FROM maps;"
```
   - Should show map with `campaign_id = NULL`
   - Should have your `owner_id`

### Test 2: Create Campaign with Existing Map

1. **Click "New Campaign"**
2. **Select map** from dropdown (should show standalone maps)
3. **Enter campaign name**
4. **Click "Create Campaign"**
5. **Verify:**
   - Campaign created successfully
   - Map is linked to campaign

6. **Check database:**
```bash
docker exec dnd-database psql -U postgres -d dnd_campaign_db -c "SELECT m.name as map_name, c.name as campaign_name FROM maps m JOIN campaigns c ON m.campaign_id = c.id;"
```

### Test 3: Change Campaign Map

1. **Load a campaign**
2. **Click campaign menu → "Change Map"**
3. **See all available maps**
4. **Select different map**
5. **Click "Change Map"**
6. **Verify:**
   - Campaign now shows new map
   - Can switch back to original map later

### Test 4: Create Map in Campaign Context

1. **Load a campaign** (set as active)
2. **Click "New Map"**
3. **Create map**
4. **Verify:**
   - Map automatically linked to active campaign
   - Success message mentions campaign name

---

## Database Migration (For Production)

Create migration file: `database/migrations/003_maps_optional_campaign.sql`

```sql
-- Make campaign_id optional
ALTER TABLE maps ALTER COLUMN campaign_id DROP NOT NULL;

-- Add owner_id for standalone maps
ALTER TABLE maps ADD COLUMN IF NOT EXISTS owner_id UUID REFERENCES users(id);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_maps_owner_id ON maps(owner_id);
CREATE INDEX IF NOT EXISTS idx_maps_campaign_id ON maps(campaign_id);

-- Update existing maps to have owner_id (from campaign owner)
UPDATE maps m
SET owner_id = c.owner_id
FROM campaigns c
WHERE m.campaign_id = c.id
AND m.owner_id IS NULL;
```

---

## Summary of All Changes

### Database:
- ✅ `maps.campaign_id` now nullable
- ✅ Added `maps.owner_id` column
- ✅ Added indexes for performance

### Backend:
- ✅ `campaignId` optional in POST /maps
- ✅ Campaign verification only if provided
- ✅ Include `owner_id` when creating maps
- ✅ Filter maps by `owner_id` in GET requests

### Frontend:
- ✅ Store allows map creation without campaign
- ✅ Dashboard removes campaign requirement
- ✅ Updated UI messages (orange warning → blue info)
- ✅ Enabled Create Map button always
- ✅ Contextual success messages

### User Experience:
- ✅ Create maps independently
- ✅ Build map library
- ✅ Create campaigns from existing maps
- ✅ Change campaign maps anytime
- ✅ Clear, helpful notifications

---

## Benefits

### For Users:
- 🎯 More flexible workflow
- 📚 Build map libraries before campaigns
- 🔄 Reuse maps across campaigns
- 💡 Clear feedback about what's happening

### For System:
- 📊 Better data model (maps are first-class entities)
- 🔐 Proper ownership and access control
- 🚀 Enables future features (map sharing, templates)
- 💾 All maps always in database (never localStorage)

### For Development:
- 🏗️ Cleaner separation of concerns
- 🧪 Easier to test
- 📈 Scalable architecture
- 🔧 Easier to extend

---

## Next Steps (Optional Enhancements)

1. **Load maps on app startup**
   - Currently only loading campaigns, characters, assets
   - Add maps to initial data fetch

2. **"My Maps" dedicated view**
   - Show all maps in a gallery
   - Filter by: linked/unlinked, campaign
   - Search and sort

3. **Map tags/categories**
   - Organize maps by type (dungeon, city, wilderness)
   - Filter in campaign selection

4. **Map sharing**
   - Share maps with other users
   - Public map templates
   - Import community maps

5. **Batch map import**
   - Upload multiple maps at once
   - Import from zip file
   - Template library

---

## Conclusion

✅ **Maps are now first-class citizens**  
✅ **Create maps anytime, link to campaigns later**  
✅ **Change campaign maps easily**  
✅ **All data persists in database**  
✅ **Proper ownership and access control**  
✅ **Flexible, user-friendly workflow**  

The workflow now matches user expectations and enables building map libraries before planning campaigns.

