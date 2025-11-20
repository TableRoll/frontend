# Errors Fixed - Summary

## Date: November 2, 2025

### Issues Found and Fixed

## 1. ✅ Maps Table Schema Error - FIXED

**Error:**
```
ERROR: column m.owner_id does not exist at character 216
```

**Root Cause:**
- The API was trying to query `m.owner_id` from the maps table
- Maps table doesn't have an `owner_id` column
- Maps belong to campaigns, and campaigns have `owner_id`

**Solution:**
- Updated `api/routes/maps.js` to check ownership through campaign relationship
- Changed queries to use: `WHERE (c.owner_id = $1 OR (m.campaign_id IS NULL AND a.owner_id = $1))`
- Removed `owner_id` from map INSERT statements
- This allows:
  - Maps with campaigns to be owned through the campaign
  - Maps without campaigns (orphaned) to be owned through the asset owner

**Files Modified:**
- `api/routes/maps.js` (lines 19, 69, 149)

---

## 2. ✅ Missing Development User - FIXED

**Error:**
```
ERROR: Key (owner_id)=(a6414db1-8722-471b-ad16-9a2b4941e116) is not present in table "users"
```

**Root Cause:**
- Mock authentication token in development mode references user ID: `00000000-0000-0000-0000-000000000001`
- This user didn't exist in the database
- Campaigns couldn't be created without a valid user

**Solution:**
- Created migration `004_add_dev_user.sql`
- Added development user with ID `00000000-0000-0000-0000-000000000001`
- User details:
  - Email: `dev@example.com`
  - Username: `developer`
  - Role: `admin`
  - Email verified: `true`

**Files Created:**
- `database/migrations/004_add_dev_user.sql`

---

## 3. ✅ Campaign Delete Behavior - FIXED

**Issue:**
- When deleting a campaign, associated maps were also deleted (CASCADE)
- User wanted maps to be preserved and become unassigned

**Solution:**
- Created migration `003_fix_campaign_delete.sql`
- Changed foreign key constraint from `ON DELETE CASCADE` to `ON DELETE SET NULL`
- Maps now:
  - Remain in database when campaign is deleted
  - Have `campaign_id` set to NULL (become orphaned)
  - Can be reassigned to other campaigns

**Files Created:**
- `database/migrations/003_fix_campaign_delete.sql`
- Updated `api/routes/campaigns.js` with better logging

---

## 4. ✅ PixiJS unsafe-eval CSP Error - FIXED

**Error:**
```
Error: Current environment does not allow unsafe-eval, please use @pixi/unsafe-eval module
```

**Root Cause:**
- PixiJS v7.3.2 required `unsafe-eval` in Content Security Policy
- Modern browsers block `unsafe-eval` by default

**Solution:**
- Upgraded PixiJS from v7.3.2 to v8.14.0
- PixiJS v8 doesn't require `unsafe-eval`
- Updated `MapCanvas.tsx` to use new PixiJS v8 API:
  - Changed from synchronous `new PIXI.Application({...})` 
  - To async `await app.init({...})`
  - Changed `backgroundColor` to `background`
  - Changed `app.view` to `app.canvas`

**Files Modified:**
- `package.json` - Updated pixi.js version
- `src/components/MapCanvas.tsx` - Updated to PixiJS v8 API

---

## 5. ✅ Notification Positioning - FIXED

**Issue:**
- Notifications appeared under the sidebar navbar
- Text was too wide and didn't wrap
- Error messages like "HTTP error! status: 429" were cut off

**Solution:**
- Configured notifications to appear at `top-right` position
- Added CSS positioning:
  - Top: 80px (below 60px header + 20px padding)
  - Right: 20px
  - Max-width: `calc(100vw - 290px)` to avoid navbar (250px)
  - Min-width: 300px
- Added text wrapping with `word-wrap` and `overflow-wrap`
- Added mobile responsive styles

**Files Modified:**
- `src/App.tsx` - Added position and limit props to Notifications
- `src/index.css` - Added notification positioning and wrapping styles

---

## How to Apply All Fixes

### If Already Applied:
The fixes have been applied. Just verify by:
```powershell
docker-compose ps
docker-compose logs --tail=20 api database
```

### If Starting Fresh:
```powershell
# Stop containers
docker-compose down -v

# Rebuild and start
docker-compose up -d --build

# Migrations will auto-apply from database/migrations/ folder
```

### Verify Fixes:
1. ✅ Maps endpoint works: http://localhost:3001/api/maps
2. ✅ Can create campaigns (user exists)
3. ✅ Deleting campaigns keeps maps
4. ✅ Map canvas loads without CSP errors
5. ✅ Notifications appear in top-right, properly sized

---

## Current Status

### ✅ All Critical Errors Fixed
- Maps API queries working correctly
- Development user exists in database  
- Campaign deletion preserves maps
- PixiJS loads without CSP errors
- Notifications display properly

### ⚠️ Non-Critical Warnings (Can Ignore)
- cAdvisor container warnings (normal for Docker Desktop on Windows)
- Grafana plugin installation notices
- npm update notices

### 📊 System Status
```
✅ Database: Running and healthy
✅ API: Running on port 3001
✅ Frontend: Running on port 3000 
✅ Grafana: Running on port 3002
✅ Prometheus: Running on port 9090
```

---

## Next Steps

1. **Test the Application:**
   - Create a campaign
   - Upload a map
   - View the map (should load without errors)
   - Delete the campaign (map should remain)
   - Check notifications (should appear properly)

2. **Monitor for New Errors:**
   ```powershell
   docker-compose logs -f api database
   ```

3. **If Issues Persist:**
   - Full clean rebuild:
   ```powershell
   docker-compose down -v
   docker-compose up -d --build
   ```

---

## Files Summary

### Modified:
- `api/routes/maps.js` - Fixed ownership queries
- `api/routes/campaigns.js` - Better delete logging
- `src/components/MapCanvas.tsx` - PixiJS v8 upgrade
- `src/App.tsx` - Notification positioning
- `src/index.css` - Notification styles
- `package.json` - PixiJS version

### Created:
- `database/migrations/003_fix_campaign_delete.sql`
- `database/migrations/004_add_dev_user.sql`
- `CAMPAIGN_DELETE_FIX_INSTRUCTIONS.md`
- `ERRORS_FIXED_SUMMARY.md`










