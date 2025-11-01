# Character Token Asset Workflow Guide

## New Behavior

### What Changed
**Before:** Creating a token from a character automatically placed it on the map  
**Now:** Creating a token from a character creates a **reusable token asset** in your library

## How It Works Now

### Step 1: Create Character
1. Click **"Create Character"** button
2. Follow the 5-step wizard:
   - Choose Race
   - Choose Class
   - Set Ability Scores
   - Select Equipment
   - Add Name, Background, Portrait
3. Character is saved to your roster

### Step 2: Create Token Asset
1. Find your character (Dashboard or Characters tab)
2. Click menu (⋯) → **"Create Token Asset"**
3. Token asset is created with:
   - Character's name
   - Character's portrait
   - Character's HP
   - Character's AC and Speed
   - All ability scores (in notes)
   - Full character stats

### Step 3: Place on Map
**Option A: Asset Hotbar (GM Mode)**
1. Switch to **Map View**
2. Enable **GM Mode** (if not already on)
3. See **Asset Hotbar** at bottom of screen
4. Find your character's token asset
5. **Drag and drop** onto map
6. Token placed where you drop it

**Option B: Assets Tab**
1. Go to **Assets** tab
2. Find character token
3. Use as needed (future: direct placement)

## What Gets Created

### Token Asset Contains:

**Basic Info:**
- Name: Character's name
- Type: Token
- Portrait: Character's avatar

**Combat Stats:**
- HP: Current/Max from character
- AC: Character's armor class
- Speed: Character's movement speed

**Character Details (in notes):**
```
[Race] [Class] - Level [X]
Background: [Background Name]
STR: XX DEX: XX CON: XX
INT: XX WIS: XX CHA: XX
```

**Token Settings:**
- Size: 1 (medium)
- Owner: player
- Visible: true
- Locked: false

## Benefits

### ✅ No Auto-Placement
- Token doesn't clutter map automatically
- You control when and where to place
- Can create asset before campaign starts

### ✅ Reusable
- Create asset once
- Use in multiple campaigns
- Drag to map multiple times
- Build character library

### ✅ Full Stats Preserved
- All ability scores stored in notes
- AC and Speed available
- Complete character info
- No data loss

### ✅ Flexible Workflow
- Create characters anytime
- Create assets when ready
- Place tokens as needed
- Independent steps

## Complete Workflow Examples

### Example 1: Solo Character
```
1. Create Character
   - Name: "Thorin Ironforge"
   - Dwarf Warrior
   - Upload portrait

2. Create Token Asset
   - Menu → "Create Token Asset"
   - ✅ Asset created
   - Badge: "Token Asset" appears

3. Start Campaign
   - Load "Lost Mines of Phandelver"

4. Place on Map
   - Map View → Asset Hotbar
   - Find "Thorin Ironforge"
   - Drag to starting position
   - ✅ Ready to play!
```

### Example 2: Full Party
```
1. Create 4 Characters
   - Thorin (Warrior)
   - Elara (Mage)
   - Finn (Rogue)
   - Aria (Bard)

2. Create 4 Token Assets
   - Each: Menu → "Create Token Asset"
   - ✅ 4 assets in library

3. Session Starts
   - Load campaign
   - Map View
   - Drag all 4 from Asset Hotbar
   - Position party

4. Play!
```

### Example 3: Recurring NPC
```
1. Create NPC Character
   - "Elminster the Sage"
   - Mage with portrait

2. Create Token Asset
   - ✅ Asset created

3. Use Across Campaigns
   - Campaign 1: Drag Elminster to map
   - Campaign 2: Drag Elminster to map
   - Campaign 3: Drag Elminster to map
   
Same NPC, always available!
```

## Visual Indicators

### Character Has Token Asset
**Badge:** Green "Token Asset" badge  
**Menu:** Shows "Token Asset Created" (disabled)  
**Meaning:** Asset exists in library

### Character Needs Token Asset
**No Badge**  
**Menu:** Shows "Create Token Asset" (enabled)  
**Meaning:** No asset yet, can create

## Asset Library

### Finding Character Tokens

**In Assets Tab:**
1. Click **Assets** in sidebar
2. Filter by type: **"Tokens"**
3. See all character token assets
4. Each shows character portrait

**In Asset Hotbar:**
1. Map View (GM Mode)
2. Asset Hotbar at bottom
3. Scroll to find character
4. Drag to map

### Asset Details

Each character token asset shows:
- **Portrait**: Character's avatar
- **Name**: Character's name
- **Type Badge**: "token" (green)
- **Stats**: In tokenData
- **Menu**: Edit, Delete, Download

## Notifications

### Success
```
✅ Token Asset Created
[Character Name] token added to Assets. 
Drag from Asset Hotbar to place on map.
```

### Already Exists
```
⚠️ Token Asset Already Exists
Token asset for [Character Name] already created. 
Check Assets tab.
```

## Key Differences

### Old Behavior
```
Create Token → Instantly on map at (100, 100)
             → Had to move token
             → Limited to one campaign
```

### New Behavior
```
Create Token Asset → Added to library
                  → Drag to map when ready
                  → Reusable everywhere
                  → Full control
```

## Best Practices

### When to Create Token Assets

**During Prep:**
- Create all characters
- Create all token assets
- Build complete library
- Ready for any session

**As Needed:**
- Create character mid-campaign
- Create token asset immediately
- Use when character enters

**For NPCs:**
- Create recurring NPCs as characters
- Make token assets
- Reuse across adventures

### Managing Your Library

**Organization:**
- Use clear character names
- Add portraits for visual identification
- Filter by type "token" to see all
- Delete unused assets

**Workflow:**
- Characters tab: Character roster
- Assets tab: Token library
- Map View: Active play area

## Character Stats in Token

### Stored in tokenData.notes:
```
Human Rogue - Level 1
Background: criminal
STR: 10 DEX: 16 CON: 12
INT: 13 WIS: 11 CHA: 14
```

**Also Stored:**
- `ac`: Armor Class (number)
- `speed`: Movement speed (number)
- `description`: Character description (string)

**Access Stats:**
- View in Assets tab
- Check token properties
- Reference during play

## FAQ

### Q: Do I need an active campaign to create token assets?
**A:** No! You can create token assets anytime. You only need a campaign when placing tokens on the map.

### Q: Can I create multiple tokens from one character?
**A:** You create ONE asset per character. Then drag that asset to the map as many times as needed.

### Q: What if I update my character?
**A:** Currently, the asset keeps original stats. Delete and recreate the asset to update. (Future: auto-sync)

### Q: Can I place the token without drag-and-drop?
**A:** Currently, use drag-and-drop from Asset Hotbar. Future: click-to-place option.

### Q: Where do I find my character tokens?
**A:** Assets tab (filter by "Tokens") or Asset Hotbar in Map View (GM mode).

## Advantages

### For Session Prep
- ✅ Create all characters ahead of time
- ✅ Build complete token library
- ✅ No rush during session
- ✅ Everything organized

### For Gameplay
- ✅ Drag tokens as characters appear
- ✅ Multiple instances for duplicates
- ✅ No accidental placement
- ✅ Full control

### For Campaign Management
- ✅ Tokens persist across campaigns
- ✅ Build NPC library
- ✅ Reuse favorite characters
- ✅ Share-ready format

## Summary

| Action | Old Behavior | New Behavior |
|--------|--------------|--------------|
| Create Token | → Map instantly | → Asset library only |
| Placement | Automatic (100,100) | Manual drag-and-drop |
| Reusability | One campaign | Multiple campaigns |
| Campaign Required | Yes | No |
| Control | Limited | Full |

**The new workflow gives you complete control over when and where your characters appear on the map!** 🎭📚✨




