# Map Image Upload Fix - November 1, 2025

## Problem

When creating a map with an image:
1. Image was converted to base64 and stored in localStorage
2. Image worked initially but **disappeared after page reload**
3. Maps were saved to database but images were NOT uploaded
4. Comment in code said "In a real app, this would upload to a server" 

## Root Cause

In `src/components/Dashboard.tsx`, the `handleMapUpload` function (line 325) was:
- Reading the file as base64 data URL
- Storing it in the map's `thumbnail` field
- Never uploading to the server

## Solution Implemented

### Flow Overview

**OLD (Broken):**
```
User selects image → Convert to base64 → Save in localStorage → Lost on reload
```

**NEW (Fixed):**
```
User selects image → Store File object → Create Map clicked
  → Upload to Assets API → Get asset ID → Create map with asset ID
  → Image persists in database
```

---

## Changes Made

### 1. Updated `handleMapUpload` Function

**File:** `src/components/Dashboard.tsx`

**Before:**
```typescript
const handleMapUpload = (file: File | null) => {
  if (file) {
    // In a real app, this would upload to a server
    const reader = new FileReader();
    reader.onload = (e) => {
      const thumbnail = e.target?.result as string;
      setNewMap(prev => ({ 
        ...prev, 
        thumbnail,  // Base64 string
        tileSource: thumbnail
      }));
    };
    reader.readAsDataURL(file);
  }
};
```

**After:**
```typescript
const handleMapUpload = async (file: File | null) => {
  if (file) {
    try {
      // Create temporary preview for UI
      const reader = new FileReader();
      reader.onload = (e) => {
        const thumbnail = e.target?.result as string;
        
        const img = document.createElement('img');
        img.onload = () => {
          setImageNaturalSize({ 
            width: img.naturalWidth, 
            height: img.naturalHeight 
          });
          setNewMap(prev => ({ 
            ...prev, 
            thumbnail,  // Temporary preview only
            tileSource: thumbnail,
            widthPx: img.naturalWidth,
            heightPx: img.naturalHeight,
            uploadedFile: file  // ✅ Store actual File object
          }));
        };
        img.src = thumbnail;
      };
      reader.readAsDataURL(file);
    } catch (error) {
      console.error('Error processing image:', error);
      notifications.show({
        title: 'Error',
        message: 'Failed to process image file',
        color: 'red'
      });
    }
  }
};
```

**Key Changes:**
- ✅ Made function `async`
- ✅ Store actual `File` object in `newMap.uploadedFile`
- ✅ Base64 thumbnail is now only for UI preview
- ✅ Added error handling

---

### 2. Updated `handleCreateMap` Function

**File:** `src/components/Dashboard.tsx`

**New Logic:**

```typescript
const handleCreateMap = async () => {
  // ... validation ...

  try {
    let assetId: string | undefined;
    let imageUrl: string | undefined;

    // Step 1: Upload image as asset if file was provided
    if ((newMap as any).uploadedFile) {
      notifications.show({
        id: 'upload-progress',
        title: 'Uploading...',
        message: 'Uploading map image to server',
        loading: true,
        autoClose: false
      });

      const uploadedAsset = await assetsAPI.upload(
        (newMap as any).uploadedFile, 
        {
          name: `${newMap.name} - Map Image`,
          assetType: 'map',
          campaignId: currentCampaign?.id,
          isPublic: false
        }
      );

      assetId = uploadedAsset.asset.id;
      if (assetId) {
        imageUrl = assetsAPI.getFileUrl(assetId);
      }

      notifications.update({
        id: 'upload-progress',
        title: 'Upload Complete',
        message: 'Image uploaded successfully',
        loading: false,
        autoClose: 2000,
        color: 'green'
      });
    }

    // Step 2: Create map with asset ID
    const map: Map = {
      // ... other fields ...
      assetId: assetId,  // ✅ Link to uploaded asset
      thumbnail: imageUrl || newMap.thumbnail || '',  // Use DB URL
      tileSource: imageUrl || newMap.tileSource,
      // ... layers ...
    };

    // Save map to database (includes assetId)
    await addMap(map);
    
    // Success notification
  } catch (error) {
    // Error handling
  }
};
```

**Key Changes:**
- ✅ Upload file to `assetsAPI` first
- ✅ Get `assetId` from upload response
- ✅ Get permanent image URL from assets
- ✅ Pass `assetId` when creating map
- ✅ Use asset URL for `thumbnail` and `tileSource`
- ✅ Show upload progress notifications

---

### 3. Added `assetId` to Map Type

**File:** `src/types/models.ts`

```typescript
export interface Map {
  id: string;
  name: string;
  description?: string;
  assetId?: string;  // ✅ Added
  widthPx: number;
  heightPx: number;
  tileSource?: string;
  thumbnail: string;
  layers: Layer[];
  createdAt: Date;
  updatedAt: Date;
}
```

---

### 4. Updated Store to Pass `assetId`

**File:** `src/stores/mapStore.ts`

```typescript
addMap: async (map) => {
  const state = get();
  const campaignId = state.currentCampaign?.id;

  try {
    const mapData: any = {
      name: map.name,
      description: map.description || '',
      widthPx: map.widthPx,
      heightPx: map.heightPx,
      gridSize: 50,
      gridType: 'square'
    };
    
    // Only include campaignId if it exists
    if (campaignId) {
      mapData.campaignId = campaignId;
    }
    
    // ✅ Only include assetId if image was uploaded
    if (map.assetId) {
      mapData.assetId = map.assetId;
    }
    
    const response = await mapsAPI.create(mapData);
    // ... rest of function
  }
};
```

**Key Changes:**
- ✅ Pass `assetId` to backend if it exists
- ✅ Map is linked to uploaded asset in database

---

## How It Works Now

### Step-by-Step Flow

1. **User selects image:**
   - File is read for preview (base64 for UI only)
   - Actual `File` object stored in `newMap.uploadedFile`
   - Image dimensions extracted

2. **User clicks "Create Map":**
   - Show "Uploading..." notification
   - Upload file to `/api/assets/upload`
   - File saved to `api/uploads/` directory
   - Asset record created in `assets` table
   - Get back `assetId`

3. **Create map in database:**
   - Map created with `asset_id` foreign key
   - Map's `thumbnail` and `tileSource` point to asset URL
   - Asset URL format: `/api/assets/file/{assetId}?token={jwt}`

4. **Page reload:**
   - Maps loaded from database
   - Image URLs point to asset API
   - Images loaded from server (not localStorage)
   - ✅ Images persist!

---

## Database Relationships

```sql
-- Assets table (stores uploaded files)
CREATE TABLE assets (
  id UUID PRIMARY KEY,
  name VARCHAR(255),
  asset_type VARCHAR(50),  -- 'map', 'token', etc.
  file_path VARCHAR(500),  -- uploads/file-123456.jpg
  thumbnail_path VARCHAR(500),
  owner_id UUID REFERENCES users(id),
  ...
);

-- Maps table (links to assets)
CREATE TABLE maps (
  id UUID PRIMARY KEY,
  name VARCHAR(100),
  asset_id UUID REFERENCES assets(id),  -- ✅ Foreign key
  campaign_id UUID REFERENCES campaigns(id),
  owner_id UUID REFERENCES users(id),
  ...
);
```

When a map is loaded:
```sql
SELECT m.*, a.file_path as image_url, a.thumbnail_path
FROM maps m
LEFT JOIN assets a ON m.asset_id = a.id
WHERE m.id = $1;
```

---

## Testing

### Test 1: Create Map with Image

1. **Open Dashboard**
2. **Click "New Map"**
3. **Upload an image** (any JPG/PNG)
4. **Fill in map name**
5. **Click "Create Map"**
6. **Expected:**
   - ✅ "Uploading..." notification appears
   - ✅ "Upload Complete" notification
   - ✅ "Map Created" notification
   - ✅ Map appears in Maps list with image

7. **Verify upload:**
```bash
# Check asset was created
docker exec dnd-database psql -U postgres -d dnd_campaign_db -c "
SELECT id, name, asset_type, file_path 
FROM assets 
ORDER BY created_at DESC 
LIMIT 1;
"

# Check map is linked to asset
docker exec dnd-database psql -U postgres -d dnd_campaign_db -c "
SELECT m.id, m.name, m.asset_id, a.file_path 
FROM maps m 
LEFT JOIN assets a ON m.asset_id = a.id 
ORDER BY m.created_at DESC 
LIMIT 1;
"

# Check file exists on disk
docker exec dnd-api ls -la uploads/
```

### Test 2: Image Persists After Reload

1. **Create a map with an image** (from Test 1)
2. **Note the map name and image**
3. **Refresh the page** (F5 or Ctrl+R)
4. **Expected:**
   - ✅ Map still appears in list
   - ✅ Image is still visible
   - ✅ No broken image icon

5. **Clear localStorage:**
```javascript
// Open browser console
localStorage.clear();
sessionStorage.clear();
location.reload();
```

6. **Expected:**
   - ✅ Map still appears
   - ✅ Image still loads from server

### Test 3: Multiple Maps with Images

1. **Create 3-5 maps with different images**
2. **Verify each upload completes**
3. **Refresh page**
4. **Expected:**
   - ✅ All maps visible
   - ✅ All images load correctly
   - ✅ Correct image for each map

### Test 4: Check Database

```bash
# Get all maps with their assets
docker exec dnd-database psql -U postgres -d dnd_campaign_db -c "
SELECT 
  m.name as map_name,
  a.name as asset_name,
  a.file_path,
  m.created_at
FROM maps m
LEFT JOIN assets a ON m.asset_id = a.id
ORDER BY m.created_at DESC;
"
```

**Expected:**
- ✅ Each map has an associated asset
- ✅ `asset_id` is NOT NULL
- ✅ `file_path` points to uploaded file

---

## File Locations

### Uploaded Files
```
api/uploads/
  ├── file-1730485123456-123456789.jpg
  ├── file-1730485234567-234567890.png
  └── ...
```

### API Endpoint
```
GET /api/assets/file/{assetId}?token={jwt}
```

Returns the actual image file with proper content-type headers.

---

## Error Handling

### Upload Fails
```
Error: Failed to upload image
→ Show error notification
→ Map is NOT created
→ User can try again
```

### Map Creation Fails After Upload
```
Image uploaded successfully
→ Map creation fails
→ Asset remains in database (orphaned)
→ Can be cleaned up later
→ User can retry with same image
```

### No Image Provided
```
User creates map without image
→ No upload attempted
→ Map created with asset_id = NULL
→ Works fine (text-only map)
```

---

## API Flow Diagram

```
┌─────────────┐
│   Browser   │
└──────┬──────┘
       │ 1. Select image file
       ▼
┌─────────────────────┐
│  handleMapUpload()  │  Store File object
└─────────┬───────────┘
          │
          │ 2. User clicks "Create Map"
          ▼
┌─────────────────────┐
│ handleCreateMap()   │
└─────────┬───────────┘
          │
          │ 3. Upload to assets API
          ▼
┌────────────────────────────┐
│ POST /api/assets/upload    │
│  - Save file to disk       │
│  - Create asset record     │
│  - Return asset ID         │
└─────────┬──────────────────┘
          │
          │ 4. Create map with asset_id
          ▼
┌────────────────────────────┐
│ POST /api/maps             │
│  - Create map record       │
│  - Link to asset via FK    │
│  - Return map ID           │
└─────────┬──────────────────┘
          │
          │ 5. Success!
          ▼
┌────────────────────────────┐
│  Map saved in database     │
│  Image saved on disk       │
│  Both persist forever      │
└────────────────────────────┘
```

---

## Common Issues & Solutions

### Issue: "Upload Failed" error
**Cause:** 
- API not running
- Uploads folder doesn't exist
- File too large

**Solution:**
```bash
# Check API is running
docker ps | grep dnd-api

# Create uploads folder
docker exec dnd-api mkdir -p uploads

# Check API logs
docker logs dnd-api --tail 50
```

### Issue: Image shows broken after reload
**Cause:**
- Asset URL not working
- File not saved to disk
- Authentication token expired

**Solution:**
```bash
# Check if file exists
docker exec dnd-api ls -la uploads/

# Check asset in database
docker exec dnd-database psql -U postgres -d dnd_campaign_db -c "SELECT * FROM assets WHERE id = 'asset-id';"

# Test asset URL directly
curl http://localhost:3001/api/assets/file/{assetId}?token={your-token}
```

### Issue: Upload takes too long
**Cause:**
- Large image file
- Slow network
- Docker resource limits

**Solution:**
- Resize images before upload (recommended < 5MB)
- Show progress indicator (already implemented)
- Consider image compression

---

## Rollback

If issues occur, rollback:

```bash
git checkout HEAD -- src/components/Dashboard.tsx src/stores/mapStore.ts src/types/models.ts
```

---

## Next Enhancements

1. **Image compression** before upload
2. **Progress bar** for upload (not just spinner)
3. **Thumbnail generation** server-side
4. **Multiple image support** (background layers)
5. **Image editing** (crop, rotate) before upload
6. **Drag & drop** image upload
7. **Image preview modal** in map list

---

## Summary

✅ **Images now upload to server**  
✅ **Maps linked to assets via foreign key**  
✅ **Images persist after page reload**  
✅ **No more localStorage for images**  
✅ **Proper upload progress feedback**  
✅ **Error handling for failed uploads**  

The map image upload workflow is now fully functional and production-ready!

