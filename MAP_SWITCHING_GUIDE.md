# Map Switching Feature Guide

## Overview
The map switching feature allows you to change the map within an active scene while preserving tokens for each map. This enables you to seamlessly switch between different maps in the same scene and return to previous maps with all their tokens intact.

## How It Works

### Token Persistence
When you change a scene's map:
1. **Current tokens are saved** - All tokens on the current map are automatically saved to that map's token history
2. **New map loads** - The new map is loaded with either:
   - Previously saved tokens (if you've used this map before in this scene)
   - No tokens (if this is the first time using this map in this scene)
3. **Easy switching** - You can switch back and forth between maps, and each map remembers its tokens

### Data Structure
Each scene now has a `mapTokenHistory` property that stores tokens per map:
```typescript
{
  mapTokenHistory: {
    'map_id_1': [...tokens],
    'map_id_2': [...tokens],
    // etc.
  }
}
```

## Using the Feature

### Step 1: Load a Scene
1. Go to the **Dashboard**
2. Find a scene in the **Scenes** section
3. Click the menu icon (⋯) next to the scene
4. Select **"Load Scene"**

### Step 2: Add Tokens
1. Switch to the **Map View**
2. Add tokens to your map using:
   - The **Add Token** button (+) in the top right
   - Drag and drop from the **Asset Hotbar** (visible in GM mode)

### Step 3: Change the Map
1. Return to the **Dashboard**
2. Find your active scene (marked with a green "Active" badge)
3. Click the menu icon (⋯) next to the active scene
4. Select **"Change Map"**
5. In the modal:
   - Review your current map
   - Select a new map from the dropdown
   - See if the new map has saved tokens (indicated by a badge)
6. Click **"Change Map"**

### Step 4: Switch Back
To return to a previous map with its tokens:
1. Follow the same steps as Step 3
2. Select the previous map from the dropdown
3. If tokens were saved for that map, you'll see a badge showing the count
4. Click **"Change Map"** and your tokens will be restored

## Example Workflow

1. **Scene Setup**: Create a scene called "Dungeon Exploration" with "Ruined Keep" map
2. **First Map**: Add 5 goblin tokens and 4 player tokens
3. **Switch Maps**: Change to "Forest Clearing" map (starts empty)
4. **Add Tokens**: Add 3 bandit tokens and nature scenery
5. **Switch Back**: Change back to "Ruined Keep" - your 9 tokens are restored!
6. **Continue**: Switch between maps as needed throughout your session

## Important Notes

- **Per-Scene History**: Each scene has its own token history. Tokens are not shared between different scenes.
- **Viewport Reset**: When changing maps, the viewport (zoom and position) resets to fit the new map.
- **Selection Cleared**: Selected tokens are cleared when switching maps.
- **Automatic Saving**: Tokens are automatically saved when switching maps - no manual save needed.
- **First Time Empty**: The first time you switch to a map in a scene, it will have no tokens.

## API Reference

### Store Functions

#### `changeSceneMap(mapId: string)`
Changes the map for the current scene while preserving tokens.

**Parameters:**
- `mapId`: The ID of the map to switch to

**Behavior:**
- Saves current map's tokens to `mapTokenHistory`
- Loads new map
- Restores tokens from history or uses empty array
- Resets viewport and selection

**Example:**
```typescript
const { changeSceneMap } = useMapStore();
changeSceneMap('map_id_2');
```

#### `setCurrentScene(scene: Scene | null)`
Switches to a different scene, saving the current scene's tokens first.

**Enhanced Behavior:**
- Saves current scene's tokens before switching
- Loads new scene with its associated map
- Restores scene's tokens
- Resets viewport and selection

## Troubleshooting

### Tokens Disappeared
- Check if you switched scenes (not just maps)
- Switch back to the previous map to restore tokens
- Verify you're in the correct scene

### Can't See Change Map Option
- Make sure a scene is active (green "Active" badge)
- The "Change Map" option only appears for the active scene

### No Maps Available to Switch To
- You need at least 2 maps to use this feature
- Create additional maps in the Dashboard

## Tips

1. **Name Maps Clearly**: Use descriptive names for maps to easily identify them when switching
2. **Plan Scenes**: Create scenes that might need multiple maps (e.g., "Town Exploration", "Boss Encounter")
3. **Test Before Session**: Try map switching before your gaming session to ensure it works as expected
4. **GM Mode**: This feature is primarily for GMs managing the game flow
5. **Token Organization**: Keep token counts manageable per map for better performance

## Future Enhancements

Potential improvements for this feature:
- Viewport preservation per map
- Token grouping and bulk operations
- Map transition animations
- Token position interpolation when switching
- Copy tokens between maps
- Export/import map-specific tokens



