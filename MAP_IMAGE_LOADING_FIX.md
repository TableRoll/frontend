# Map Image Loading Fix

## Issue Description
When starting a campaign and loading a map, the map image doesn't display, but you can place tokens and they snap to the grid. This means the map is loading but the background image is not rendering.

## Fixes Applied

### 1. Enhanced PIXI.js Image Loading (MapCanvas.tsx)
- Added **cross-origin configuration** to support loading images from the API server
- Implemented a **fallback loading method** using BaseTexture when the primary method fails
- Added **comprehensive error logging** to diagnose loading issues
- Created a **visual placeholder** that displays when the image fails to load (gray background with diagonal lines)
- Added **sprite dimension setting** to ensure the image scales correctly
- Added **detailed console logging** to track the image loading process

### 2. Error Diagnostics
The MapCanvas component now logs:
- The image URL being loaded
- Whether the texture loaded successfully
- Sprite dimensions and position
- Detailed fetch test results when loading fails
- HTTP response status and headers

### 3. Visual Feedback
When an image fails to load, you'll now see:
- A dark gray placeholder rectangle matching the map dimensions
- Diagonal lines to indicate it's a placeholder
- Text overlay showing "Map Image Failed to Load" with the map name
- The grid and tokens will still work on top of the placeholder

## Diagnostic Steps

### Step 1: Run the Diagnostic Script
```bash
node test-map-image-loading.js
```

This will check:
- If the uploads directory exists
- If files are present in the uploads directory
- If maps in the database have associated assets
- If the asset files exist on disk

### Step 2: Check Browser Console
1. Open your browser DevTools (Press F12)
2. Go to the **Console** tab
3. Start a campaign and load a map
4. Look for these log messages:
   - `"Loading map image from URL: ..."` - Shows the URL being loaded
   - `"Map texture loaded successfully"` - Image loaded correctly
   - `"Error loading map: ..."` - Image failed to load
   - `"Fetch test response: ..."` - Shows HTTP status (401, 404, etc.)

### Step 3: Check Network Tab
1. Open DevTools and go to the **Network** tab
2. Filter by "img" or "assets"
3. Start a campaign and load a map
4. Look for failed requests (red color)
5. Click on the failed request to see:
   - Status code (401 = auth issue, 404 = file not found)
   - Request headers
   - Response body

### Step 4: Test the Image URL Directly
1. Copy the image URL from the console (looks like: `http://localhost:3001/api/assets/file/{id}?token=...`)
2. Open a new browser tab
3. Paste the URL
4. See what happens:
   - **Image displays**: PIXI.js loading issue (already fixed with crossOrigin)
   - **401 Unauthorized**: Authentication token issue
   - **404 Not Found**: File doesn't exist or wrong path
   - **Cannot connect**: API server not running

## Common Issues and Solutions

### Issue 1: API Server Not Running
**Symptoms**: 
- Network errors in console
- "Failed to fetch" errors
- Cannot connect to `localhost:3001`

**Solution**:
```bash
cd api
npm install
npm start
```

The API should be running on `http://localhost:3001`

### Issue 2: Uploads Directory Empty
**Symptoms**:
- 404 Not Found errors
- Diagnostic script shows 0 files in uploads

**Solution**:
1. Check if maps were uploaded correctly
2. Try uploading a new map from the Dashboard
3. Check `api/uploads` directory for files
4. Verify file permissions (should be readable)

### Issue 3: Asset File Paths Incorrect
**Symptoms**:
- Assets exist in database but files not found
- File path looks wrong in diagnostic output

**Solution**:
```bash
# Check database
cd database
node check-database.js

# Look for asset file_path values
# They should be relative paths like: uploads/file-1234567890-123456789.png
```

If paths are absolute or wrong, you may need to:
1. Delete the asset from database
2. Re-upload the map image

### Issue 4: Authentication Token Issue
**Symptoms**:
- 401 Unauthorized errors
- Token appears in URL but still fails

**Solution**:
1. Check if you're logged in
2. Clear browser cache and localStorage
3. Log out and log back in
4. Check if `mock-token-for-development` is enabled in API server

In `api/routes/assets.js`, line 343 should allow dev token:
```javascript
if ((process.env.NODE_ENV === 'development' || process.env.ALLOW_DEV_TOKEN === 'true') && authToken === 'mock-token-for-development') {
  userId = '00000000-0000-0000-0000-000000000001';
}
```

Add to `api/.env`:
```
NODE_ENV=development
ALLOW_DEV_TOKEN=true
```

### Issue 5: CORS Issues
**Symptoms**:
- "Cross-Origin Request Blocked" in console
- Image loads in new tab but not in canvas

**Solution**:
This is already fixed in the code with:
- `crossOrigin: 'anonymous'` in PIXI.js loader
- CORS headers in API server (line 378-380 of `api/routes/assets.js`)

If still having issues, verify the API server has:
```javascript
res.setHeader('Access-Control-Allow-Origin', '*');
res.setHeader('Access-Control-Allow-Methods', 'GET');
res.setHeader('Access-Control-Allow-Credentials', 'true');
```

### Issue 6: Map Has No Asset ID
**Symptoms**:
- Map loads but shows "No map image available"
- Diagnostic shows `Asset ID: None`

**Solution**:
1. Go to Dashboard
2. Delete the problematic map
3. Create a new map and upload an image
4. Assign the map to your campaign

## Testing the Fix

1. **Clear browser cache** (Ctrl+Shift+Delete)
2. **Restart the API server**:
   ```bash
   cd api
   npm start
   ```
3. **Start the frontend**:
   ```bash
   npm start
   ```
4. **Log in** to your account
5. **Select a campaign**
6. **Load a map**
7. **Check the console** for detailed logs
8. **Look for**:
   - The placeholder background (if image fails)
   - Console logs showing loading progress
   - Any error messages

## Expected Behavior After Fix

### If Image Loads Successfully:
- Console shows: `"Map texture loaded successfully"`
- Console shows sprite details (width, height, position)
- Map image displays in the canvas
- Grid overlays on top
- Tokens can be placed and moved

### If Image Fails to Load:
- Console shows detailed error with URL and status
- A gray placeholder with diagonal lines appears
- Text overlay shows "Map Image Failed to Load"
- Grid still works
- Tokens can still be placed
- You can still work with the map

## Quick Fix Checklist

- [ ] API server is running (`cd api && npm start`)
- [ ] Uploads directory exists and has files
- [ ] Database has maps with asset_id values
- [ ] Asset files exist on disk
- [ ] Browser console shows detailed logs
- [ ] No 401 or 404 errors in Network tab
- [ ] Authentication token is valid
- [ ] CORS headers are set correctly

## Need More Help?

If the issue persists after trying these solutions:

1. **Run the diagnostic**: `node test-map-image-loading.js`
2. **Share the output** of the diagnostic script
3. **Share console errors** from browser DevTools
4. **Share Network tab** failed requests
5. **Check if**:
   - Database file exists
   - API server is running
   - Frontend can connect to API
   - You can create new maps successfully

## Technical Details

### Image Loading Flow:
1. Campaign is selected → `setCurrentCampaign()` called
2. Maps are loaded → `loadMaps()` fetches maps from API
3. Map is transformed → `transformMapFromAPI()` builds image URL
4. Map is set as current → `setCurrentMap()` updates state
5. MapCanvas receives map prop → `useEffect` triggered
6. Image URL is extracted → `map.tileSource || map.thumbnail`
7. PIXI loads texture → `PIXI.Assets.load()` with crossOrigin
8. Sprite is created → Texture wrapped in Sprite
9. Sprite added to stage → `addChildAt(sprite, 0)` at bottom layer
10. Viewport is centered → Map positioned in center

### Image URL Format:
```
http://localhost:3001/api/assets/file/{asset-id}?token={auth-token}
```

- `asset-id`: UUID from assets table
- `auth-token`: JWT or dev token from localStorage

### File Storage:
- Uploaded files: `api/uploads/`
- Database: `database/dnd_campaign.db`
- Asset metadata: `assets` table
- Map metadata: `maps` table with `asset_id` foreign key







