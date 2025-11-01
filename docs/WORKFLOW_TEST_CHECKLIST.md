# Workflow Test Checklist - Maps & Campaigns

## ✅ Correct Workflow Now Implemented

**Goal:** Create maps first, then create campaigns using those maps.

---

## Quick Test Steps

### Test 1: Create Standalone Map ✓

1. Open Dashboard (http://localhost:3000)
2. **Do NOT create a campaign first**
3. Click "New Map" button
4. You should see blue info alert: "No Campaign Active - This map will be saved to your library"
5. Enter map details:
   - Name: "Test Dungeon"
   - Upload an image (any image)
   - Adjust grid if desired
6. Click "Create Map"
7. **Expected:** ✅ Success notification: "Test Dungeon has been saved. You can now create a campaign using this map."

**Verify in Database:**
```bash
docker exec dnd-database psql -U postgres -d dnd_campaign_db -c "SELECT id, name, campaign_id, owner_id FROM maps ORDER BY created_at DESC LIMIT 1;"
```
- ✅ Should show your map
- ✅ `campaign_id` should be NULL
- ✅ `owner_id` should be set

---

### Test 2: Create Campaign with Existing Map ✓

1. Click "New Campaign" button
2. Select "Starting Map" dropdown
3. **Expected:** ✅ Should see "Test Dungeon" map in list
4. Select "Test Dungeon"
5. Enter campaign name: "Dragon Quest"
6. Click "Create Campaign"
7. **Expected:** ✅ Campaign created successfully

**Verify in Database:**
```bash
docker exec dnd-database psql -U postgres -d dnd_campaign_db -c "SELECT c.name as campaign_name, m.name as map_name FROM campaigns c LEFT JOIN maps m ON c.current_map_id = m.id ORDER BY c.created_at DESC LIMIT 1;"
```
- ✅ Should show "Dragon Quest" campaign linked to "Test Dungeon" map

---

### Test 3: Create Map Within Active Campaign ✓

1. **Make sure "Dragon Quest" campaign is active** (load it if not)
2. Click "New Map"
3. You should NOT see the blue info alert (campaign is active)
4. Enter map details:
   - Name: "Dragon Lair"
   - Upload an image
5. Click "Create Map"
6. **Expected:** ✅ Success: "Dragon Lair has been saved and linked to Dragon Quest"

**Verify in Database:**
```bash
docker exec dnd-database psql -U postgres -d dnd_campaign_db -c "SELECT m.name as map_name, c.name as campaign_name FROM maps m LEFT JOIN campaigns c ON m.campaign_id = c.id WHERE m.name = 'Dragon Lair';"
```
- ✅ Should show "Dragon Lair" linked to "Dragon Quest" campaign

---

### Test 4: Change Campaign Map ✓

1. Make sure "Dragon Quest" campaign is active
2. Click the menu (three dots) on "Dragon Quest" campaign card
3. Click "Change Map"
4. **Expected:** ✅ See modal with all your maps
5. Current map should show: "Test Dungeon"
6. Select "Dragon Lair" from "New Map" dropdown
7. Click "Change Map"
8. **Expected:** ✅ Campaign now uses "Dragon Lair"

**Verify:**
- Campaign card should now show "Based on: Dragon Lair"
- If you open the map canvas, it should show Dragon Lair

---

### Test 5: Database Persistence (Clear Cache) ✓

1. Scroll to bottom of Dashboard
2. Find "Database Integration Test" section
3. Click "Clear All Cache" button
4. **Expected:** ✅ Notification: "All browser cache cleared"
5. **Refresh the page** (F5)
6. Click "Check Database Contents" in test section
7. **Expected:** ✅ All your maps and campaigns still exist

**Manual Verification:**
```bash
# Check maps
docker exec dnd-database psql -U postgres -d dnd_campaign_db -c "SELECT id, name, campaign_id FROM maps;"

# Check campaigns
docker exec dnd-database psql -U postgres -d dnd_campaign_db -c "SELECT id, name, current_map_id FROM campaigns;"
```

---

## Database Verification Commands

### Check Maps
```bash
docker exec dnd-database psql -U postgres -d dnd_campaign_db -c "
SELECT 
  m.id,
  m.name as map_name,
  c.name as campaign_name,
  CASE WHEN m.campaign_id IS NULL THEN 'Standalone' ELSE 'Linked' END as status,
  m.created_at
FROM maps m
LEFT JOIN campaigns c ON m.campaign_id = c.id
ORDER BY m.created_at DESC;
"
```

### Check Campaigns
```bash
docker exec dnd-database psql -U postgres -d dnd_campaign_db -c "
SELECT 
  c.id,
  c.name as campaign_name,
  m.name as current_map,
  c.created_at
FROM campaigns c
LEFT JOIN maps m ON c.current_map_id = m.id
ORDER BY c.created_at DESC;
"
```

### Check Ownership
```bash
docker exec dnd-database psql -U postgres -d dnd_campaign_db -c "
SELECT 
  m.name as map_name,
  u.username as owner
FROM maps m
LEFT JOIN users u ON m.owner_id = u.id
ORDER BY m.created_at DESC;
"
```

---

## Expected Results Summary

| Action | Campaign Active? | Result |
|--------|-----------------|--------|
| Create Map | ❌ No | Map saved standalone (campaign_id = NULL) |
| Create Map | ✅ Yes | Map saved and linked to campaign |
| Create Campaign | N/A | Select from existing maps |
| Change Map | ✅ Yes | Switch campaign to different map |

---

## Common Issues & Solutions

### Issue: "Campaign not found" error when creating map
**Solution:** 
- This shouldn't happen anymore with the fix
- Campaign is now optional
- If you see this, the backend wasn't rebuilt

**Fix:**
```bash
docker-compose up -d --build api
```

### Issue: Can't see maps in "New Campaign" dropdown
**Solution:**
- Make sure you created standalone maps first
- Check database to verify maps exist:
```bash
docker exec dnd-database psql -U postgres -d dnd_campaign_db -c "SELECT * FROM maps;"
```

### Issue: Maps disappear after refreshing
**Solution:**
- This means maps are in localStorage, not database
- Check if API is running:
```bash
docker ps | grep dnd-api
```
- Check API logs:
```bash
docker logs dnd-api --tail 50
```

### Issue: "campaign_id cannot be null" database error
**Solution:**
- Database schema wasn't updated
- Run:
```bash
docker exec dnd-database psql -U postgres -d dnd_campaign_db -c "ALTER TABLE maps ALTER COLUMN campaign_id DROP NOT NULL;"
```

---

## Success Criteria

All of these should be ✅:

- [ ] Can create map without creating campaign first
- [ ] Map saves to PostgreSQL database (not localStorage)
- [ ] Can see standalone maps in campaign creation dropdown
- [ ] Can create campaign using existing map
- [ ] Can create map within active campaign (auto-links)
- [ ] Can change campaign map to different map
- [ ] Maps persist after clearing browser cache
- [ ] Maps persist after page refresh
- [ ] Each user only sees their own maps
- [ ] Database shows correct owner_id for maps

---

## Rollback Instructions

If something goes wrong, rollback:

### Backend
```bash
git checkout HEAD -- api/routes/maps.js
docker-compose up -d --build api
```

### Database
```sql
ALTER TABLE maps ALTER COLUMN campaign_id SET NOT NULL;
ALTER TABLE maps DROP COLUMN owner_id;
```

### Frontend
```bash
git checkout HEAD -- src/stores/mapStore.ts src/components/Dashboard.tsx src/services/api.ts
```

---

## Next Actions

After verifying all tests pass:

1. **Remove test components** (APITest, DatabaseTest) from production
2. **Create map gallery view** to show all standalone maps
3. **Add map filtering** by campaign/standalone status
4. **Implement map editing** functionality
5. **Add map deletion** with confirmation

---

## Documentation

See these files for complete details:
- `CORRECT_WORKFLOW_IMPLEMENTATION.md` - Full technical documentation
- `DATABASE_INTEGRATION_ISSUE.md` - Original problem analysis
- `MAPS_DATABASE_ONLY_FIX.md` - Previous fix attempt (superseded)

