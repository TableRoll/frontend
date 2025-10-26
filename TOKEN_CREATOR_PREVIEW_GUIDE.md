# Token Creator Preview & Image Editor Guide

## Overview
The Token Creator now includes a live preview and image adjustment tools, allowing you to see exactly how your token will appear on the map and fine-tune the image positioning before creation.

## New Features

### 1. Live Token Preview
- ✅ Real-time preview showing token as it will appear on map
- ✅ Circular token with border
- ✅ HP bar visualization
- ✅ Updates instantly as you adjust settings
- ✅ Shows size, rotation, and HP values
- ✅ Dark background for better visibility

### 2. Image Adjustment Controls
- ✅ **Image Zoom**: Scale from 50% to 300%
- ✅ **Horizontal Position**: Move image left/right within token
- ✅ **Vertical Position**: Move image up/down within token
- ✅ **Reset Button**: Return to default positioning

### 3. Enhanced Layout
- ✅ Two-column layout for better organization
- ✅ Settings on left, preview on right
- ✅ Larger modal size for better usability
- ✅ All controls grouped logically

## How to Use

### Step 1: Open Token Creator
You can create a token in several ways:
1. Click **"Add Token"** button (+) in Map View
2. Right-click an asset and select **"Create Token"**
3. Press **T** keyboard shortcut in Map View

### Step 2: Upload an Image
1. Click **"Upload Image"** button
2. Select an image file from your computer
3. The preview appears automatically

### Step 3: Adjust the Image
Once the image is loaded, you'll see the preview and adjustment controls:

#### **Image Zoom**
- Use the slider to zoom in/out (50%-300%)
- Useful for:
  - Cropping out unwanted parts of the image
  - Focusing on character's face/important features
  - Fitting non-square images into circular token

#### **Horizontal Position**
- Move image left/right within the token circle
- Range: -100px to +100px
- 0 = centered

#### **Vertical Position**
- Move image up/down within the token circle
- Range: -100px to +100px
- 0 = centered

#### **Reset Button**
Click to return all adjustments to default (zoom 100%, centered)

### Step 4: Configure Token Properties

**Basic Information:**
- **Name**: Token identifier
- **Size**: 0.1 to 5.0 (affects map appearance)
- **Rotation**: 0-360 degrees
- **Owner**: Assign to player or GM

**Health Points:**
- **Current HP**: Current health value
- **Max HP**: Maximum health value
- Updates HP bar color in preview:
  - Green: > 50% HP
  - Yellow: 25-50% HP
  - Red: < 25% HP

**Properties:**
- **Locked**: Prevent token movement
- **Visible**: Show/hide token

### Step 5: Preview & Create
1. Review the live preview to ensure the token looks right
2. Make final adjustments if needed
3. Click **"Create Token"** to add it to the map

## Preview Features

### Visual Elements
The preview shows exactly how your token will appear:
- Circular token shape
- Border (selected: blue, normal: gray)
- Background image with adjustments
- HP bar at bottom
- Proper rotation
- Correct size scaling

### Real-Time Updates
The preview updates instantly when you change:
- Token size
- Rotation angle
- Image zoom
- Image position (horizontal/vertical)
- Current/Max HP

### Accurate Representation
What you see in the preview is exactly what you'll get on the map:
- Same rendering as map tokens
- Same HP bar colors and sizes
- Same border styles
- Same image clipping

## Common Use Cases

### Cropping Character Portraits
1. Upload full character portrait
2. Zoom in (150-200%) to focus on face
3. Adjust vertical position to center the head
4. Perfect for character tokens from full-body artwork

### Centering Off-Center Images
1. Upload image where subject is not centered
2. Use horizontal/vertical sliders to reposition
3. Subject appears centered in token circle

### Fitting Non-Square Images
1. Upload rectangular or irregular image
2. Zoom out or in to fit properly
3. Adjust position to show the important parts
4. Works for landscape or portrait images

### Creating Consistent Token Sets
1. Upload multiple character images
2. Use same zoom level for all (e.g., 120%)
3. Adjust positions to align faces/features
4. Results in visually consistent token set

## Tips & Best Practices

### Image Selection
- **Use high-quality images** for best results
- **Square images** work best (less adjustment needed)
- **Clear subject** makes positioning easier
- **Good contrast** helps token stand out on map

### Zoom Levels
- **50-80%**: For full-body shots that need to show entire figure
- **100%**: Default, works for most square images
- **120-150%**: For character portraits, focus on upper body
- **150-200%**: For face close-ups, dramatic effect
- **200-300%**: For extreme crops or specific details

### Positioning
- **Character Portraits**: Center on face, zoom to 120-150%
- **Monsters**: Center on head/torso, show distinctive features
- **Objects**: Center on main element
- **Vehicles**: Show entire vehicle, center mass

### HP Bar
- Preview shows how HP bar will look
- Adjust HP values to see color changes
- Helps ensure token is visually clear with HP bar

## Technical Details

### Image Adjustment Storage
Each token stores three adjustment values:
```typescript
{
  imageScale: number,      // 0.5 to 3.0 (50% to 300%)
  imageOffsetX: number,    // -100 to 100 pixels
  imageOffsetY: number     // -100 to 100 pixels
}
```

### CSS Implementation
Adjustments are applied using CSS properties:
- `backgroundSize`: Controls zoom level
- `backgroundPosition`: Controls x/y offset
- Calculated as: `calc(50% + offset)`

### Canvas Preview
The preview uses HTML5 Canvas for accurate rendering:
- Draws circular clip path
- Applies rotation transform
- Renders image with scale and offset
- Matches exact token appearance

### Default Values
When not specified:
- `imageScale`: 1 (100%)
- `imageOffsetX`: 0 (centered)
- `imageOffsetY`: 0 (centered)

## Workflow Example

### Creating a Goblin Token

1. **Open Token Creator** (T key or + button)
2. **Name**: "Goblin Scout"
3. **Upload**: Choose goblin portrait image
4. **Adjust Image**:
   - Zoom: 130% (to focus on face)
   - Vertical: -10px (move up slightly)
   - Horizontal: 0px (keep centered)
5. **Set Properties**:
   - Size: 1.0 (medium creature)
   - HP: 7/7 (goblin stats)
   - Owner: GM
6. **Preview**: Check that face is centered and visible
7. **Create**: Click "Create Token"

Result: Perfectly framed goblin token!

## Keyboard Shortcuts

Currently in preview:
- **Enter**: (Future) Create token
- **Esc**: (Future) Cancel
- **Arrow Keys**: (Future) Fine-tune position

## Future Enhancements

### Planned Features
- 📋 Click-and-drag to position image
- 📋 Mouse wheel to zoom in preview
- 📋 Aspect ratio lock option
- 📋 Image filters (brightness, contrast, saturation)
- 📋 Border color customization
- 📋 Custom border styles (square, hex, etc.)
- 📋 Background color picker
- 📋 Image rotation separate from token rotation
- 📋 Multiple image layers (background + overlay)
- 📋 Token templates/presets

### Advanced Editor Features
- 📋 Crop tool with visual guides
- 📋 Image effects (blur, sharpen)
- 📋 Color adjustments
- 📋 Image filters (sepia, grayscale)
- 📋 Background removal
- 📋 Border effects (glow, shadow)

## Troubleshooting

### Preview Not Showing
- Ensure an image is uploaded
- Check image format (should be jpg, png, etc.)
- Try refreshing the page

### Image Looks Wrong
- Use Reset button to restore defaults
- Try different zoom levels
- Adjust position sliders
- Consider using a different source image

### Token Different on Map
- Preview should match exactly
- Clear browser cache if discrepancy
- Check zoom level on map vs preview

### Can't Create Token
- Must have token name
- Must have image uploaded
- Check for error messages in console

## Best Results

For optimal token appearance:
1. **Start with good images**: Clear, well-lit, centered subjects
2. **Use preview**: Make adjustments before creating
3. **Be consistent**: Use similar zoom/position for related tokens
4. **Test on map**: Create one token first, then adjust others to match
5. **Save settings**: Note your preferred zoom/position for future tokens

## Integration

### Works With
- Asset-based token creation
- Manual token creation
- Token duplication (future)
- Token editing (future enhancement)

### Saves To
- Token data in campaign
- Persisted with other token properties
- Exported with scenes
- Imported correctly

---

*The Token Creator preview makes it easy to create perfectly framed tokens that look professional on your D&D maps!*



