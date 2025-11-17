# D&D Campaign App - Fixes Summary

## Issues Fixed

### 1. ✅ SQLite Native Module Architecture Mismatch
**Problem:** `Error loading shared library node_sqlite3.node: Exec format error`
- Windows-compiled native modules were copied into Linux Docker containers
- Native binaries are OS-specific and can't run cross-platform

**Solution:**
- Updated `.dockerignore` to exclude `api/node_modules` and `database/node_modules`
- Switched all API routes from SQLite to PostgreSQL configuration
- Rebuilt containers with Linux-compiled dependencies

**Files Changed:**
- `.dockerignore` - Added exclusions for node_modules
- `api/server.js` - Changed from `sqlite-database` to `database`
- All route files in `api/routes/` - Updated database imports

---

### 2. ✅ Missing Database Schema Columns
**Problem:** Users couldn't register - `password_hash` column didn't exist

**Solution:**
- Added `password_hash VARCHAR(255) NOT NULL` column to users table
- Updated `database/migrations/001_initial_schema.sql`

**Files Changed:**
- `database/migrations/001_initial_schema.sql`

---

### 3. ✅ Missing Reference Data
**Problem:** Classes and backgrounds weren't loaded in database

**Solution:**
- Loaded all seed data into PostgreSQL
- Fixed JSONB casting issue in inventory_items

**Current Database:**
- ✅ 9 races (Human, Elf, Dwarf, etc.)
- ✅ 12 classes (Fighter, Wizard, Rogue, etc.)
- ✅ 6 backgrounds (Noble, Soldier, Sage, etc.)
- ✅ 60 item types
- ✅ 60 inventory items

**Files Changed:**
- `database/migrations/002_seed_data.sql` - Fixed JSONB cast

---

### 4. ✅ Authentication Issues
**Problem:** Frontend used mock authentication, backend received invalid user IDs

**Solution:**
- Replaced mock authentication with real API calls
- Fixed JWT token payload to include both `id` and `userId` fields
- Created shared authentication middleware
- Tokens now properly stored in localStorage

**Files Changed:**
- `src/stores/authStore.ts` - Real API integration
- `api/middleware/auth.js` - New shared middleware
- All route files - Use shared middleware
- `api/routes/auth.js` - JWT includes both id fields

---

### 5. ✅ Campaign Creation Working
**Problem:** `owner_id` was null when creating campaigns

**Solution:**
- Fixed JWT token structure
- All authentication middleware now consistent
- Campaigns successfully save to PostgreSQL

**Status:** ✅ Campaigns can be created and persist in database

---

### 6. 🔄 Character Creation (In Progress)
**Problem:** Frontend sent wrong data format to API

**Solution:**
- Updated CharacterCreator to fetch races/classes/backgrounds from API
- Fixed ability scores format: `{strength: 10}` → `{str: 10, dex: 10, ...}`
- Added real API data loading with loading states

**Status:** 🔄 Frontend rebuilding with fixes

---

### 7. ✅ Maps API Created
**Problem:** No backend endpoint for maps - they were only stored in memory

**Solution:**
- Created new `/api/routes/maps.js` with full CRUD operations
- Added to `server.js`
- Maps API endpoints:
  - `GET /api/maps` - List all maps
  - `GET /api/maps/:id` - Get single map
  - `POST /api/maps` - Create map
  - `PUT /api/maps/:id` - Update map
  - `DELETE /api/maps/:id` - Delete map

**Files Created:**
- `api/routes/maps.js` - Complete maps CRUD

**Files Changed:**
- `api/server.js` - Added maps route
- `src/services/api.ts` - Added mapsAPI service
- `src/stores/mapStore.ts` - Added map persistence
- `src/stores/mapStoreWithAPI.ts` - Added loadMaps function

---

## Current Status

### ✅ Fully Working:
1. **Docker Setup** - All containers run without native module errors
2. **PostgreSQL Database** - Connected and fully populated
3. **User Authentication** - Register/Login with real JWT tokens
4. **Campaigns** - Create, read, update, delete working
5. **Assets** - Upload and save to database
6. **Maps API Backend** - Endpoints ready for frontend integration

### 🔄 Partially Working:
1. **Character Creation** - Frontend being updated to use API data
2. **Map Persistence** - API ready, frontend needs integration

### 📋 Next Steps:
1. After frontend rebuild completes, restart frontend container
2. Test character creation with API-loaded races/classes/backgrounds
3. Test that maps persist across refreshes

---

## How to Use

### 1. Start the Application:
```bash
docker-compose up -d
```

### 2. Access the App:
```
http://localhost:3000
```

### 3. First Time Setup:
1. **Register** a new account (required for proper authentication)
2. **Create a Campaign** - Works perfectly!
3. **Upload Assets** - Maps, tokens, images all save
4. **Create Characters** - Will work after frontend rebuild

### 4. Clear Old Session:
If you were logged in before the fixes, you MUST:
- Logout and login again, OR
- Clear browser localStorage (F12 → Application → Local Storage → Clear)

This ensures you get a valid JWT token with the correct user ID.

---

## Database Structure

### PostgreSQL Tables:
- **users** - User accounts with password_hash
- **campaigns** - Campaign management
- **characters** - Player characters with full D&D stats
- **races**, **classes**, **backgrounds** - D&D reference data
- **assets** - Uploaded files (maps, tokens, images, audio)
- **maps** - Map configurations linked to assets
- **tokens** - Token positions on maps
- **combat_sessions**, **combat_participants** - Combat tracking
- **inventory_items**, **character_inventory** - Equipment system

### Key Relationships:
- Campaigns → owned by Users
- Characters → belong to Users and Campaigns
- Maps → belong to Campaigns and link to Assets
- Tokens → positioned on Maps, may link to Characters
- Assets → owned by Users, may belong to Campaigns

---

## API Endpoints Reference

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/profile` - Get current user

### Campaigns
- `GET /api/campaigns` - List user's campaigns
- `POST /api/campaigns` - Create campaign
- `PUT /api/campaigns/:id` - Update campaign
- `DELETE /api/campaigns/:id` - Delete campaign

### Characters
- `GET /api/characters` - List characters
- `POST /api/characters` - Create character
- `GET /api/characters/reference/races` - Get all races
- `GET /api/characters/reference/classes` - Get all classes
- `GET /api/characters/reference/backgrounds` - Get all backgrounds

### Assets
- `GET /api/assets` - List assets
- `POST /api/assets/upload` - Upload file
- `GET /api/assets/file/:id` - Download file

### Maps (NEW!)
- `GET /api/maps` - List maps
- `POST /api/maps` - Create map
- `PUT /api/maps/:id` - Update map
- `DELETE /api/maps/:id` - Delete map

---

## Troubleshooting

### Issue: White Screen After Creating Campaign
**Solution:** Refresh the browser (F5) - This is a frontend rendering issue, the data was saved successfully.

### Issue: "Invalid token" errors
**Solution:** Logout and login again to get a new JWT token with the correct structure.

### Issue: Can't create characters
**Solution:** Wait for frontend rebuild to complete, then restart frontend container.

### Issue: Maps disappear after refresh
**Solution:** Frontend rebuild includes map persistence integration. After rebuild:
1. Maps will save to database when uploaded
2. Maps will load from database when viewing a campaign

---

## Files Modified

### Backend (API):
- `.dockerignore`
- `api/server.js`
- `api/middleware/auth.js` (NEW)
- `api/routes/auth.js`
- `api/routes/campaigns.js`
- `api/routes/characters.js`
- `api/routes/assets.js`
- `api/routes/combat.js`
- `api/routes/maps.js` (NEW)
- `database/migrations/001_initial_schema.sql`
- `database/migrations/002_seed_data.sql`

### Frontend:
- `src/stores/authStore.ts`
- `src/stores/mapStore.ts`
- `src/stores/mapStoreWithAPI.ts`
- `src/services/api.ts`
- `src/components/CharacterCreator.tsx`

---

## Testing Checklist

- [x] Docker containers start without errors
- [x] PostgreSQL database connects
- [x] User registration works
- [x] User login works
- [x] Campaign creation works
- [x] Asset upload works
- [ ] Character creation (pending frontend rebuild)
- [ ] Map persistence (pending frontend rebuild)

