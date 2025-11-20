# Quick Troubleshooting Guide for Map Image Loading

## The Problem
Map image doesn't show, but grid and tokens work fine.

## Quick Checks (Do These First!)

### 1. Is the API Server Running?
```bash
# Terminal 1: Start API
cd api
npm start

# Should see: "Server running on port 3001"
```

**If it fails**: Run `npm install` first

### 2. Check Browser Console (F12)
Look for these messages after loading a map:

✅ **Good**:
```
Loading map image from URL: http://localhost:3001/api/assets/file/...
Map texture loaded successfully
Map sprite added to stage: { width: 2048, height: 1536, ... }
```

❌ **Bad**:
```
Error loading map: ...
Fetch test response: { ok: false, status: 404, ... }
```

### 3. Test the Image URL Directly
1. Copy the URL from console (starts with `http://localhost:3001/api/assets/file/`)
2. Paste in new browser tab
3. What happens?

   **Image shows** = Good! The fix worked.
   **401 Error** = Authentication issue (see below)
   **404 Error** = File not found (see below)
   **Can't connect** = API server not running

## Common Problems & Fixes

### Problem: "Failed to fetch" / "Cannot connect"
**Cause**: API server not running

**Fix**:
```bash
cd api
npm install  # if first time
npm start
```

Leave it running! Keep this terminal open.

---

### Problem: "401 Unauthorized"
**Cause**: Authentication token not working

**Fix**:
1. Log out and log back in
2. Clear browser cache (Ctrl+Shift+Delete)
3. Or add to `api/.env`:
   ```
   NODE_ENV=development
   ALLOW_DEV_TOKEN=true
   ```
4. Restart API server

---

### Problem: "404 Not Found"
**Cause**: Image file doesn't exist on server

**Fix**:
1. **Re-upload the map**:
   - Go to Dashboard
   - Click "Add New Map"
   - Upload an image file
   - Assign to campaign

2. **Check uploads folder**:
   ```bash
   dir api\uploads      # Windows
   ls api/uploads       # Mac/Linux
   ```
   Should have files like `file-1234567890-123456789.png`

3. **If empty**: Upload new maps from Dashboard

---

### Problem: Gray placeholder shows with "Map Image Failed to Load"
**Cause**: Image loading failed (good news: you can see the error now!)

**Fix**:
1. Check browser console for specific error
2. See URL test result
3. Follow fixes above based on error code

---

### Problem: Nothing shows at all
**Cause**: Map not assigned to campaign

**Fix**:
1. Go to Dashboard
2. Under "Current Campaign" section
3. Click "Assign Existing Map"
4. Select a map
5. Click "Assign to Campaign"

---

## Step-by-Step First Time Setup

If you've never uploaded a map:

### 1. Start the Backend
```bash
# Terminal 1
cd api
npm install
npm start
```
Keep this running!

### 2. Start the Frontend
```bash
# Terminal 2 (new terminal)
npm install  # if first time
npm start
```

### 3. Create a Campaign & Map
1. Open `http://localhost:3000`
2. Login (or register)
3. Click "Dashboard" tab
4. **Create Campaign**:
   - Click "Create Campaign"
   - Enter name: "Test Campaign"
   - Click "Create"
5. **Create Map**:
   - Click "Add New Map"
   - Upload an image (PNG/JPG)
   - Set grid size (default 50px is fine)
   - Click "Create Map"
6. **Start Campaign**:
   - Click "Start Campaign"

### 4. Check If It Works
- Go to "Canvas" tab
- You should see your map image
- If not, open console (F12) and check errors

---

## Visual Indicators

### ✅ Working Correctly:
- Map image visible
- Grid overlay on top
- Can place tokens
- Tokens snap to grid

### ⚠️ Partial Success (After Fix):
- Gray placeholder with diagonal lines
- Text: "Map Image Failed to Load"
- Grid and tokens still work
- Console shows detailed error

### ❌ Not Working:
- Blank screen
- No map, no grid, no tokens
- Error: "No campaign active"
- → Go to Dashboard and select campaign

---

## Still Not Working?

### Run Diagnostic:
```bash
node test-map-image-loading.js
```

This checks:
- ✓ Uploads directory exists
- ✓ Files in uploads
- ✓ Database has maps
- ✓ Asset files exist

### Share This Info:
1. Output of diagnostic script
2. Browser console errors (F12 → Console tab)
3. Network tab errors (F12 → Network → filter by "assets")
4. Which error code you see (401, 404, 500, etc.)

---

## Quick Command Reference

```bash
# Start API server
cd api && npm start

# Start frontend
npm start

# Check uploads
dir api\uploads              # Windows
ls -la api/uploads          # Mac/Linux

# Run diagnostic
node test-map-image-loading.js

# Reset everything (nuclear option)
# 1. Stop both servers (Ctrl+C)
# 2. Delete database:
rm database/dnd_campaign.db # Mac/Linux
del database\dnd_campaign.db # Windows

# 3. Reset database:
cd database && npm run setup

# 4. Restart servers and re-create maps
```

---

## What Was Fixed?

The `MapCanvas.tsx` component now:
- ✓ Uses cross-origin loading for images
- ✓ Has fallback loading method
- ✓ Shows placeholder when image fails
- ✓ Logs detailed errors to console
- ✓ Tests image URL accessibility
- ✓ Displays helpful error messages

So even if the image fails, you'll see WHY it failed and can fix it.








