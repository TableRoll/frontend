# Maps Ownership Structure - Fixed

## Date: November 2, 2025

## New Database Structure

### Maps Table Ownership Model

Maps now have a **dual ownership model**:

1. **`owner_id`** (User) - Required, NOT NULL
   - The user who created/owns the map
   - References: `users(id)`
   - Constraint: `ON DELETE CASCADE` (if user is deleted, their maps are deleted)

2. **`campaign_id`** (Campaign) - Optional, nullable
   - The campaign the map is currently assigned to
   - References: `campaigns(id)`
   - Constraint: `ON DELETE SET NULL` (if campaign is deleted, map becomes unassigned)

3. **`asset_id`** (Asset) - Optional, nullable
   - The image/file asset used for the map background
   - References: `assets(id)`
   - Maps can contain/reference multiple assets

### Schema Details

```sql
Table "public.maps"
   Column    |           Type           | Nullable |
-------------+--------------------------+----------+
 id          | uuid                     | not null | (PK)
 name        | varchar(100)             | not null |
 description | text                     | null     |
 campaign_id | uuid                     | null     | FK -> campaigns(id)
 asset_id    | uuid                     | null     | FK -> assets(id)
 width_px    | integer                  | not null |
 height_px   | integer                  | not null |
 grid_size   | integer                  | default: 50
 grid_type   | varchar(10)              | default: 'square'
 is_active   | boolean                  | default: false
 owner_id    | uuid                     | not null | FK -> users(id)
 created_at  | timestamp with time zone | default: now()
 updated_at  | timestamp with time zone | default: now()

Indexes:
  - idx_maps_campaign (campaign_id)
  - idx_maps_owner (owner_id)

Foreign Keys:
  - maps_owner_id_fkey: owner_id -> users(id) ON DELETE CASCADE
  - maps_campaign_id_fkey: campaign_id -> campaigns(id) ON DELETE SET NULL
  - maps_asset_id_fkey: asset_id -> assets(id)
```

## API Changes

### GET /api/maps
- Returns all maps owned by the authenticated user
- Query param: `campaignId` (optional) - filter by specific campaign

**Query:**
```sql
SELECT m.*, a.file_path as image_url, a.thumbnail_path, c.name as campaign_name
FROM maps m
LEFT JOIN assets a ON m.asset_id = a.id
LEFT JOIN campaigns c ON m.campaign_id = c.id
WHERE m.owner_id = $1 -- User's maps only
ORDER BY m.created_at DESC
```

### POST /api/maps
- Creates a new map owned by the authenticated user
- Required: `name`, `widthPx`, `heightPx`, `owner_id` (from token)
- Optional: `description`, `campaignId`, `assetId`, `gridSize`, `gridType`

**Insert:**
```sql
INSERT INTO maps (name, description, campaign_id, asset_id, 
                  width_px, height_px, grid_size, grid_type, owner_id)
VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
```

### GET /api/maps/:id
- Returns a single map if owned by authenticated user

**Query:**
```sql
SELECT m.*, a.file_path as image_url, a.thumbnail_path, c.name as campaign_name
FROM maps m
LEFT JOIN assets a ON m.asset_id = a.id
LEFT JOIN campaigns c ON m.campaign_id = c.id
WHERE m.id = $1 AND m.owner_id = $2
```

### PUT /api/maps/:id
- Updates a map if owned by authenticated user
- Checks: `WHERE m.id = $1 AND m.owner_id = $2`

### DELETE /api/maps/:id
- Deletes a map if owned by authenticated user
- Checks: `WHERE m.id = $1 AND m.owner_id = $2`

## Relationships

```
User (owner_id)
  └── owns many Maps
       ├── belongs to one Campaign (optional)
       ├── references one Asset (optional, background image)
       └── contains many Tokens
           └── each Token can reference an Asset (token sprite)

Campaign
  ├── owned by User
  ├── has many Maps assigned to it
  └── has current_map_id (active map)
```

## Migration Applied

**File:** `database/migrations/005_add_maps_owner_id.sql`

1. Added `owner_id` column to maps table
2. Updated existing maps with owner from campaign
3. Updated orphaned maps with owner from asset
4. Set `owner_id` as NOT NULL
5. Created index on `owner_id`

## Use Cases

### 1. User Creates a Map (Standalone)
```javascript
POST /api/maps
{
  "name": "Tavern Battle Map",
  "widthPx": 2048,
  "heightPx": 1536,
  "assetId": "uuid-of-uploaded-image"
  // No campaignId - map is owned but unassigned
}
```
Result: Map created with `owner_id` set, `campaign_id` = NULL

### 2. User Creates a Map for a Campaign
```javascript
POST /api/maps
{
  "name": "Dragon's Lair",
  "widthPx": 3000,
  "heightPx": 2000,
  "campaignId": "uuid-of-campaign",
  "assetId": "uuid-of-uploaded-image"
}
```
Result: Map created with `owner_id` and `campaign_id` set

### 3. User Assigns Map to Campaign
```javascript
PUT /api/maps/:mapId
{
  "campaignId": "uuid-of-campaign"
}
```
Result: Map's `campaign_id` updated

### 4. User Unassigns Map from Campaign
```javascript
PUT /api/maps/:mapId
{
  "campaignId": null
}
```
Result: Map's `campaign_id` set to NULL (map becomes standalone)

### 5. Campaign is Deleted
Database automatically sets `campaign_id` to NULL for all associated maps
Maps remain owned by user

### 6. User is Deleted
Database automatically deletes all maps owned by that user (CASCADE)

## Benefits

✅ **Clear Ownership:** Every map has a defined owner
✅ **Flexible Assignment:** Maps can exist without campaigns
✅ **Reusability:** Maps can be reassigned between campaigns
✅ **Data Integrity:** Proper foreign key constraints
✅ **User Privacy:** Users can only access their own maps
✅ **Asset Management:** Maps can reference background assets
✅ **Token Support:** Tokens on maps can reference their own assets

## Testing

Try the test again:
1. ✅ Create Campaign - should work
2. ✅ Upload Image Asset - should work
3. ✅ Create Map in Database - **should now work with owner_id**
4. ✅ Check Campaigns in DB - should work
5. ✅ Check Maps in DB - **should now work and show owner_id**

The error "column owner_id does not exist" is now fixed! 🎉










