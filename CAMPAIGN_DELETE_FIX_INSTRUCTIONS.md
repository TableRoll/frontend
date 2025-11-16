# Campaign Delete Fix - Instructions

## What Was Fixed

Previously, when you deleted a campaign, all associated maps were also deleted due to a CASCADE delete constraint. Now:

✅ **Campaigns** are properly deleted from the database
✅ **Maps** are preserved when their campaign is deleted
✅ **Map references** to deleted campaigns are set to NULL
✅ Maps become "unassigned" and can be reassigned to other campaigns

## Changes Made

### 1. Database Migration (`database/migrations/003_fix_campaign_delete.sql`)
- Changed `maps.campaign_id` foreign key from `ON DELETE CASCADE` to `ON DELETE SET NULL`
- Made `maps.campaign_id` nullable
- Added proper foreign key constraint for `campaigns.current_map_id`
- Added indexes for better performance

### 2. API Update (`api/routes/campaigns.js`)
- Updated the delete endpoint to properly log deletions
- Added informative response message about preserved maps

### 3. Frontend (Already Working)
- Frontend API calls (`src/services/api.ts`) already properly call the DELETE endpoint
- State management (`src/stores/mapStoreWithAPI.ts`) already handles campaign deletion correctly

## How to Apply

Since you're running in Docker, you need to:

### Option 1: Apply Migration to Existing Database

```bash
# Stop the containers
docker-compose down

# Start just the database
docker-compose up -d database

# Wait for database to be ready (about 10 seconds)
timeout /t 10

# Apply the migration
docker exec -i dnd-database psql -U postgres -d dnd_campaign_db < database/migrations/003_fix_campaign_delete.sql

# Rebuild and restart all containers
docker-compose up -d --build
```

### Option 2: Fresh Database (Warning: Deletes all data)

```bash
# Stop and remove all containers and volumes
docker-compose down -v

# Rebuild and start everything fresh
docker-compose up -d --build
```

The migration will automatically run on the fresh database since it's in the `database/migrations/` folder.

### For Windows PowerShell:

```powershell
# Stop containers
docker-compose down

# Start just database
docker-compose up -d database

# Wait 10 seconds
Start-Sleep -Seconds 10

# Apply migration
Get-Content database\migrations\003_fix_campaign_delete.sql | docker exec -i dnd-database psql -U postgres -d dnd_campaign_db

# Rebuild and restart
docker-compose up -d --build
```

## Testing the Fix

1. Create a campaign
2. Upload or assign a map to that campaign
3. Delete the campaign
4. Check that the map still exists (it should be unassigned now, `campaign_id` = NULL)
5. The map can now be assigned to a different campaign

## What Gets Deleted vs Preserved

When deleting a campaign:

| Resource | Action |
|----------|--------|
| Campaign | ✅ Deleted |
| Maps | ✅ Preserved (campaign_id set to NULL) |
| Characters | ❌ Deleted (CASCADE) |
| Sessions | ❌ Deleted (CASCADE) |
| Tokens | ❌ Deleted (CASCADE via maps) |
| Combat Sessions | ❌ Deleted (CASCADE via sessions) |

This makes sense because:
- **Maps** are reusable assets that can be used across campaigns
- **Characters, Sessions, Combat** are campaign-specific and should be removed with the campaign

## Rollback (If Needed)

If you need to rollback to the old behavior (cascade delete maps):

```sql
ALTER TABLE maps DROP CONSTRAINT IF EXISTS maps_campaign_id_fkey;
ALTER TABLE maps ALTER COLUMN campaign_id SET NOT NULL;
ALTER TABLE maps ADD CONSTRAINT maps_campaign_id_fkey 
  FOREIGN KEY (campaign_id) REFERENCES campaigns(id) ON DELETE CASCADE;
```








