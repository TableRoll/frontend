# Character to Token Asset Guide

## Overview
When you create a token from a character, it now also creates a reusable token asset! This means you can:
- Place the character on the map multiple times
- Drag and drop the character from the Asset Hotbar
- Reuse the character token across different campaigns
- Access character tokens in the Assets panel

## What Happens Now

### Creating Token from Character
When you click "Create Token" on a character:

**1. Token Asset Created:**
- Appears in **Assets** panel
- Type: "Token"
- Name: "[Character Name] (Character Token)"
- Thumbnail: Character's portrait
- Contains character's HP data

**2. Map Token Created:**
- Placed on active campaign map
- Position: (100, 100) - can be moved
- HP: Character's current/max HP
- Sprite: Character's portrait

**3. Character Updated:**
- `tokenId` saved (links to map token)
- "On Map" badge appears
- Menu shows "Token on Map"

**4. Notification:**
- "Token & Asset Created"
- Confirms character added to map and assets

## Benefits

### Reusability
**Same Character, Multiple Campaigns:**
- Create token asset once
- Drag from assets to any campaign
- Use character across different adventures

**Multiple Instances:**
- Original token on map
- Asset in library
- Can create duplicates by dragging from assets

### Asset Library Integration
Character tokens appear in:
- **Assets Tab** - Full asset management
- **Asset Hotbar** (in GM mode) - Quick access
- Can be:
  - Filtered (type: "token")
  - Searched by character name
  - Deleted if needed
  - Dragged onto map

## How to Use

### Create Character Token Asset

**Method 1: From Characters View**
1. Navigate to **Characters** tab
2. Find your character
3. Click menu (⋯) → **"Create Token"**
4. ✅ Token added to map
5. ✅ Asset added to library

**Method 2: From Dashboard**
1. Go to **Dashboard**
2. Characters section
3. Click menu (⋯) → **"Create Token"**
4. ✅ Token added to map
5. ✅ Asset added to library

### Use the Token Asset

**From Asset Hotbar (GM Mode):**
1. Switch to **Map View**
2. Asset hotbar shows at bottom
3. Find "[Character Name] (Character Token)"
4. **Drag and drop** onto map
5. New token created at drop position

**From Assets Tab:**
1. Navigate to **Assets** tab
2. Filter by type: "Token"
3. Find character token
4. Click menu → "Use"
5. Or drag onto canvas (if supported)

## Asset Details

### Token Asset Properties

```typescript
{
  id: "asset_12345...",
  name: "Thorin (Character Token)",
  type: "token",
  url: character.avatar,
  thumbnail: character.avatar,
  tokenData: {
    hp: { current: 12, max: 12 },
    size: 1,
    rotation: 0,
    ownerId: "player",
    locked: false,
    visible: true
  }
}
```

### What Gets Saved
- ✅ Character name (+ suffix)
- ✅ Character portrait
- ✅ HP values
- ✅ Token settings
- ✅ Upload date

### What Doesn't Get Saved
- Character's full stats
- Equipment details
- Background information
- Description text

*The asset is a token template, not a full character copy*

## Visual Indicators

### In Assets Panel
- **Green badge**: "token" type
- **Thumbnail**: Character portrait
- **Name**: "[Name] (Character Token)"
- **Menu**: Edit, Create Token, Download, Delete

### In Asset Hotbar
- Shows character portrait
- Hovering shows name
- Can drag to map
- Creates new token instance

### On Character
- "On Map" badge (shows token exists)
- Gold badge (starting gold)
- Purple badge (background)

## Workflow Examples

### Example 1: Party Tokens
```
1. Create 4 Characters:
   - Thorin (Dwarf Warrior)
   - Elara (Elf Mage)
   - Finn (Human Rogue)
   - Aria (Tiefling Bard)

2. Create Token from Each:
   → 4 Tokens on map
   → 4 Token assets in library

3. Use Assets:
   - Start new campaign
   - Drag character tokens from Asset Hotbar
   - Instant party setup!
```

### Example 2: Recurring NPCs
```
1. Create Character "Gandalf the Grey"
2. Add portrait
3. Create Token
   → Asset created

4. Different Campaigns:
   - Campaign 1: Drag Gandalf from assets
   - Campaign 2: Drag Gandalf from assets
   - Campaign 3: Drag Gandalf from assets
   
Same NPC, multiple adventures!
```

### Example 3: Character Copies
```
1. Create Character "Guard Captain"
2. Create Token
   → 1 token on map
   → 1 asset in library

3. Need Multiple Guards:
   - Drag asset to map → Guard 1
   - Drag asset to map → Guard 2
   - Drag asset to map → Guard 3
   
Multiple instances from one character!
```

## Asset Management

### Finding Character Tokens

**Filter by Type:**
1. Go to **Assets** tab
2. Filter dropdown → "Tokens"
3. See all character tokens

**Search by Name:**
1. Assets tab
2. Search box
3. Type character name
4. Find token asset

### Deleting Token Assets
- **From Assets Tab**: Menu → Delete
- **Effect**: Removes asset (NOT character or map token)
- **Character Preserved**: Character data unchanged
- **Map Token**: Remains on map

### Editing Token Assets
- **From Assets Tab**: Menu → Edit
- **Can Change**: Name, type
- **Cannot Change**: HP, stats (tied to character)

## Token vs Asset vs Character

### Character (Persistent)
- Full stats and background
- Equipment and abilities
- Level progression
- Character sheet

### Token Asset (Reusable Template)
- In asset library
- Can be dragged to map
- Contains basic HP/settings
- Reusable across campaigns

### Map Token (Instance)
- On specific campaign map
- Can be moved/rotated
- Position saved
- Combat-ready

### Relationships
```
Character → Create Token → Map Token
                       ↓
                   Token Asset
                       ↓
          (Drag to map) → New Map Token
```

## Data Flow

### Creation
```
1. Character exists with portrait
2. User clicks "Create Token"
3. System creates:
   a) Token Asset → Saved to assets[]
   b) Map Token → Saved to campaign.tokens[]
   c) Character.tokenId → Links to map token
4. Both use character.avatar as sprite
```

### Reuse
```
1. Token Asset exists in library
2. User drags from Asset Hotbar
3. New Map Token created
4. Uses asset's tokenData
5. Independent of original character
```

## Benefits

### For Players
- Create character once
- Use across campaigns
- Easy party setup
- Character library

### For GMs
- Create NPC characters
- Reuse common NPCs
- Build token library
- Quick combat setup

### For Everyone
- Organized asset library
- Visual character roster
- Easy token management
- Drag-and-drop convenience

## Technical Details

### Asset Creation
```typescript
const newAsset = {
  id: "asset_123",
  name: `${character.name} (Character Token)`,
  type: "token",
  url: character.avatar,
  thumbnail: character.avatar,
  tokenData: {
    hp: character.hp,
    // ... other token settings
  }
};
```

### Naming Convention
- Format: "[Character Name] (Character Token)"
- Examples:
  - "Thorin (Character Token)"
  - "Elara the Wise (Character Token)"
  - "Bob (Character Token)"

### Storage
- Assets stored in `state.assets[]`
- Persisted to local storage
- Avatar images excluded from persistence (large)
- Loaded fresh each session

## Tips

### Building Token Library
1. Create all player characters
2. Create tokens for each
3. Now have reusable asset library
4. Easy campaign setup

### Managing Duplicates
- Each "Create Token" creates ONE asset
- Even if you try multiple times (prevented)
- Delete old asset if you remake character

### Portrait Updates
If you update character portrait:
- Old token asset keeps old portrait
- Create new token to use new portrait
- Delete old asset if desired

## Future Enhancements

### Planned
- 📋 Sync character HP with token asset
- 📋 Update asset when character updated
- 📋 Link asset back to character
- 📋 Batch create assets for all characters
- 📋 Auto-update token instances

### Advanced
- 📋 Character version control
- 📋 Token variants (injured, buffed, etc.)
- 📋 Export character + asset together
- 📋 Share character tokens with others

## Troubleshooting

### Token Asset Not in Assets
- Check Assets tab
- Filter by "Tokens"
- Search for character name

### Can't Find in Asset Hotbar
- Enable GM mode
- Check Asset Hotbar at bottom of Map View
- Scroll through assets

### Multiple Assets for Same Character
- Each "Create Token" makes one asset
- Delete duplicates if needed
- System prevents multiple map tokens

## Summary

✅ **Create Token** → Creates both map token AND asset  
✅ **Asset Library** → Character tokens reusable  
✅ **Asset Hotbar** → Drag and drop characters  
✅ **Multiple Uses** → Same character, many campaigns  
✅ **Portrait Integration** → Avatar becomes token sprite  
✅ **Organized** → All in one asset library  

Creating a token from a character now gives you a reusable asset for maximum flexibility! 🎭📚🗺️



