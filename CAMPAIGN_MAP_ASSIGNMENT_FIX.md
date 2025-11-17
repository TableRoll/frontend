# Campaign-Map Assignment Fix

## Date: November 2, 2025

## Overview

Campaigns now **require** a map when created, and the map is automatically assigned to the campaign.

## Changes Made

### 1. Campaign Creation (POST /api/campaigns)

#### Before:
- `currentMapId` was optional
- Maps were not automatically assigned to campaigns
- User could create a campaign without a map

#### After:
- **`currentMapId` is REQUIRED**
- Map ownership is verified before campaign creation
- Map is automatically assigned to the campaign (map.campaign_id is set)
- Both campaign.current_map_id AND map.campaign_id are set

**Validation:**
```javascript
body('currentMapId').isUUID().withMessage('Map is required for campaign creation')
```

**Process:**
1. Validate campaign data + map UUID
2. Verify map exists and belongs to the user
3. Create campaign with `current_map_id` set
4. Update map's `campaign_id` to link it to the campaign

**Request Example:**
```json
POST /api/campaigns
{
  "name": "Lost Mines of Phandelver",
  "description": "A classic D&D adventure",
  "currentMapId": "uuid-of-map"  // REQUIRED
}
```

**Response:**
```json
{
  "message": "Campaign created successfully with assigned map",
  "campaign": {
    "id": "campaign-uuid",
    "name": "Lost Mines of Phandelver",
    "description": "A classic D&D adventure",
    "currentMapId": "uuid-of-map",
    "sessionNumber": 1,
    "isActive": true,
    "tokens": [],
    "createdAt": "2025-11-02T..."
  }
}
```

**Errors:**
- `400` - Validation failed: Map is required for campaign creation
- `404` - Map not found or does not belong to you

---

### 2. Campaign Update (PUT /api/campaigns/:id)

#### Enhanced Map Assignment

When changing a campaign's map, the system now:
1. Verifies the new map exists and belongs to the user
2. **Unassigns the old map** (sets old map's `campaign_id` to NULL)
3. **Assigns the new map** (sets new map's `campaign_id` to the campaign)

**Process:**
```javascript
// If changing current_map_id:
1. Get old map ID from campaign
2. Verify new map exists and belongs to user
3. Unassign old map: UPDATE maps SET campaign_id = NULL WHERE id = old_map_id
4. Assign new map: UPDATE maps SET campaign_id = campaign_id WHERE id = new_map_id
5. Update campaign: UPDATE campaigns SET current_map_id = new_map_id ...
```

**Request Example:**
```json
PUT /api/campaigns/campaign-uuid
{
  "current_map_id": "new-map-uuid"
}
```

**Result:**
- Old map becomes unassigned (campaign_id = NULL)
- New map is assigned to the campaign (campaign_id = campaign-uuid)
- Campaign's current_map_id is updated

---

## Database Relationships

### Before This Fix:
```
Campaign
  ├── current_map_id (reference to active map)
  └── (no bidirectional link)

Map
  └── (no campaign reference)
```

### After This Fix:
```
Campaign
  └── current_map_id (UUID) ──┐
                               ├──> Map
Map                            │
  ├── campaign_id (UUID) ──────┘
  └── owner_id (UUID) ─────> User
```

**Bidirectional Relationship:**
- Campaign has `current_map_id` (which map is active)
- Map has `campaign_id` (which campaign it belongs to)
- Both are kept in sync automatically

---

## API Endpoints Updated

### POST /api/campaigns
**Changes:**
- ✅ `currentMapId` now REQUIRED (was optional)
- ✅ Verifies map ownership
- ✅ Automatically sets map.campaign_id
- ✅ Returns error if map not found/not owned

### PUT /api/campaigns/:id
**Changes:**
- ✅ Validates map UUID if provided
- ✅ Unassigns old map when changing maps
- ✅ Assigns new map to campaign
- ✅ Maintains bidirectional relationship

### DELETE /api/campaigns/:id
**Existing Behavior (unchanged):**
- ✅ Deletes campaign
- ✅ Sets map.campaign_id to NULL (from migration 003)
- ✅ Map remains in database, becomes unassigned

---

## Use Cases

### Use Case 1: Create Campaign with Map

**Workflow:**
1. User uploads map image → Creates asset
2. User creates map with asset → Map created with owner_id
3. **User creates campaign with map → Map assigned to campaign**

```javascript
// Step 3: Create campaign
POST /api/campaigns
{
  "name": "Dragon Heist",
  "currentMapId": "map-uuid"
}

// Result:
// Campaign created with current_map_id = map-uuid
// Map updated with campaign_id = campaign-uuid
```

### Use Case 2: Change Campaign Map

**Workflow:**
```javascript
// Current state:
// Campaign A has Map 1 assigned
// campaign.current_map_id = map1-uuid
// map1.campaign_id = campaignA-uuid

// Change to Map 2:
PUT /api/campaigns/campaignA-uuid
{
  "current_map_id": "map2-uuid"
}

// New state:
// campaign.current_map_id = map2-uuid
// map1.campaign_id = NULL (unassigned)
// map2.campaign_id = campaignA-uuid (assigned)
```

### Use Case 3: Map Lifecycle

**Map States:**
1. **Created** - owner_id set, campaign_id = NULL (unassigned)
2. **Assigned** - owner_id set, campaign_id set (belongs to campaign)
3. **Unassigned** - owner_id set, campaign_id = NULL (removed from campaign)

```sql
-- Check map status:
SELECT 
  m.id, 
  m.name, 
  m.owner_id,
  m.campaign_id,
  CASE 
    WHEN m.campaign_id IS NULL THEN 'Unassigned'
    ELSE 'Assigned to: ' || c.name
  END as status
FROM maps m
LEFT JOIN campaigns c ON m.campaign_id = c.id
WHERE m.owner_id = 'user-uuid';
```

---

## Testing

### Test 1: Create Campaign Without Map
```bash
POST /api/campaigns
{
  "name": "Test Campaign"
  # No currentMapId
}

Expected: 400 Bad Request
Message: "Map is required for campaign creation"
```

### Test 2: Create Campaign With Invalid Map
```bash
POST /api/campaigns
{
  "name": "Test Campaign",
  "currentMapId": "non-existent-uuid"
}

Expected: 404 Not Found
Message: "Map not found or does not belong to you"
```

### Test 3: Create Campaign With Valid Map
```bash
POST /api/campaigns
{
  "name": "Test Campaign",
  "currentMapId": "valid-map-uuid"
}

Expected: 201 Created
Campaign created
Map assigned (check: SELECT campaign_id FROM maps WHERE id = 'valid-map-uuid')
```

### Test 4: Change Campaign Map
```bash
PUT /api/campaigns/campaign-uuid
{
  "current_map_id": "new-map-uuid"
}

Expected: 200 OK
Old map.campaign_id = NULL
New map.campaign_id = campaign-uuid
```

---

## Files Modified

1. **api/routes/campaigns.js**
   - Made `currentMapId` required in POST
   - Added map ownership verification
   - Added automatic map assignment on create
   - Added map reassignment logic on update

---

## Benefits

✅ **Data Integrity:** Maps are always properly linked to campaigns
✅ **Automatic Assignment:** No manual steps needed to link maps
✅ **Ownership Verification:** Users can only assign their own maps
✅ **Bidirectional Link:** Both campaign and map know about each other
✅ **Clean Unassignment:** Old maps are properly unlinked when changed
✅ **User Experience:** Intuitive workflow - create map, create campaign with map

---

## Migration Notes

**No database migration required** - uses existing columns:
- `campaigns.current_map_id` (already exists)
- `maps.campaign_id` (added in migration 003/005)

The changes are purely in the API logic to maintain the relationship.









