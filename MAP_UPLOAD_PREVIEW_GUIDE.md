# Map Upload Preview Feature Guide

## Overview
When uploading a map, you can now see a real-time preview of the map with a grid overlay. This helps you adjust the grid settings to perfectly align with your map's features before creating it.

## How to Use

### Step 1: Open the Map Creation Modal
1. Go to the **Dashboard**
2. Click the **"New Map"** button in the Maps section

### Step 2: Upload Your Map Image
1. Enter a **Map Name**
2. Click **"Upload map image"** and select your map file
3. The preview will automatically appear below the file input

### Step 3: Adjust Grid Settings
Once your image is uploaded, you'll see:
- **Preview Canvas**: Your map with a grid overlay
- **Image Dimensions**: Displayed as a badge (e.g., "2048 × 1536 px")
- **Grid Size Control**: Slider to adjust the grid cell size (10-200px)
- **Grid Type Selector**: Choose between Square or Hex grid

### Step 4: Fine-Tune the Grid
1. Use the **Grid Size** input to adjust the cell size
2. Watch the preview update in real-time
3. Adjust until the grid aligns with features on your map (walls, floors, etc.)
4. Switch between **Square** and **Hex** grid types if needed

### Step 5: Create the Map
1. Once satisfied with the grid alignment, click **"Create Map"**
2. Your map will be saved with the configured grid settings
3. The grid settings are stored in the map's layers and will be used when the map is loaded

## Features

### Real-Time Preview
- ✅ See your uploaded image immediately
- ✅ Grid overlay updates instantly as you adjust settings
- ✅ Scaled to fit the modal while maintaining aspect ratio
- ✅ Dark background for better visibility

### Grid Types
- **Square Grid**: Traditional D&D-style square cells
- **Hex Grid**: Hexagonal cells for more natural movement

### Smart Defaults
- **Auto-Detection**: Image dimensions are automatically detected
- **Disabled Inputs**: Width/Height inputs are disabled when an image is uploaded
- **Default Grid**: Starts with 50px square grid
- **Grid Range**: Adjustable from 10px to 200px in 5px increments

### Visual Feedback
- Image dimensions displayed as a badge
- Helpful tip text explaining how to use the preview
- Clean canvas rendering with semi-transparent grid lines
- Border around the preview for clarity

## Tips

### Aligning the Grid
1. **Look for Reference Points**: Use walls, doors, or floor tiles as reference
2. **Zoom In**: If your map has a scale indicator, match the grid to it
3. **Standard Sizes**: 
   - 70px per 5ft square is common for many battle maps
   - 50px is a good starting point for most maps
   - Adjust based on your specific map's scale

### Grid Types
- **Square**: Best for indoor maps, dungeons, buildings
- **Hex**: Better for outdoor terrain, wilderness, large-scale battles

### Image Quality
- Use high-resolution images for best results
- PNG or JPG formats work well
- Consider the grid visibility on different map backgrounds

### Common Grid Sizes
- **40-60px**: Small creatures, tight spaces
- **60-80px**: Standard D&D 5ft squares
- **80-100px**: Larger creatures, open areas
- **100+px**: Very large scale maps

## Technical Details

### Preview Rendering
- Uses HTML5 Canvas for efficient rendering
- Maximum preview size: 600×400px (scales down if larger)
- Maintains original aspect ratio
- Grid is drawn with semi-transparent white lines (50% opacity)

### Grid Calculations
- **Square Grid**: Simple vertical and horizontal lines at regular intervals
- **Hex Grid**: Uses mathematical hex pattern with 0.75 vertical offset
- All calculations scale proportionally with the preview

### Saved Settings
The following are saved with each map:
- Grid size (in pixels)
- Grid type (square or hex)
- Image dimensions (width and height)
- Image URL (thumbnail and tile source)

These settings are stored in the map's "grid" layer and are automatically applied when the map is loaded in the Map Canvas.

## Troubleshooting

### Preview Not Showing
- Ensure the image uploaded successfully
- Check file format (should be image/*)
- Try a smaller image if the file is very large

### Grid Not Aligning
- Adjust grid size in small increments (5px steps)
- Consider that some maps have irregular or decorative grids
- You can always change grid settings later in Map View

### Image Too Large
- Preview automatically scales down large images
- Original dimensions are preserved for the actual map
- Large images may take a moment to load

### Grid Lines Hard to See
- The preview uses white semi-transparent lines
- Works best on darker maps
- On the actual map, grid visibility can be toggled

## Future Enhancements

Potential improvements for this feature:
- Grid color/opacity controls in preview
- Click to measure distances
- Rotation adjustment
- Multiple grid overlay previews
- Grid offset controls for misaligned maps
- Save/load grid templates
- Grid auto-detection AI

## Related Features

- **Map Canvas Grid**: Uses these settings for the live map view
- **Grid Toggle**: Can show/hide grid in Map View
- **Snap to Grid**: Token movement can snap to grid cells
- **Grid Settings**: Accessible in app settings for changes

---

*This feature helps ensure your maps are properly configured before adding tokens and starting your game session!*


