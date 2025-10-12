# Character to Token Creation Guide

## Overview
You can now create map tokens directly from your characters! This feature automatically generates a token with your character's stats, portrait, and HP, creating a seamless connection between your character roster and the battle map.

## How to Create a Token from Character

### Method 1: From Characters View
1. Navigate to **Characters** tab in sidebar
2. Find the character you want to place on the map
3. Click the **menu icon** (⋯) on the character card
4. Select **"Create Token"**
5. Token is automatically added to the active campaign map

### Method 2: From Dashboard
1. Go to **Dashboard**
2. Find your character in the **Characters** section
3. Click the **menu icon** (⋯) on the character card
4. Select **"Create Token"**
5. Token is automatically added to the active campaign map

## What Happens

### Token Creation
When you create a token from a character, the system:
1. ✅ Creates a new token with character's name
2. ✅ Uses character's portrait as token sprite
3. ✅ Sets HP to character's current/max HP
4. ✅ Places token at default position (100, 100) - you can move it
5. ✅ Links token to character (saves tokenId)
6. ✅ Shows success notification

### Character Linking
After token creation:
- Character is marked as "On Map"
- Green badge appears next to character name
- Menu shows "Token on Map" (disabled)
- Can't create duplicate token for same character

## Token Properties from Character

The created token inherits:

| Token Property | From Character |
|----------------|----------------|
| **Name** | Character name |
| **Sprite** | Character avatar/portrait |
| **Current HP** | Character currentHp |
| **Max HP** | Character maxHp |
| **Size** | Default 1 (medium creature) |
| **Position** | Default 100, 100 (can be moved) |
| **Rotation** | Default 0° |
| **Owner** | Set to 'player' |
| **Visible** | Yes |
| **Locked** | No |

## Visual Indicators

### "On Map" Badge
Characters with tokens on the map show:
- **Green badge** with "On Map" text
- **Dot variant** for subtle indication
- Appears next to character name

### Menu State
- **Before token created**: "Create Token" (enabled)
- **After token created**: "Token on Map" (disabled)

## Requirements

### To Create Token:
1. ✅ **Active Campaign** - Must have a campaign loaded
2. ✅ **Character** - Character must exist
3. ✅ **No Existing Token** - Character can only have one token

### Notifications

**Success:**
```
✅ Token Created
${CharacterName} has been added to the map
```

**No Campaign:**
```
❌ No Active Campaign
Please load a campaign before creating tokens
```

**Duplicate:**
```
⚠️ Token Already Exists
${CharacterName} already has a token on the map
```

## Use Cases

### Starting a Session
1. Create all player characters
2. Load campaign
3. Create token for each character
4. All players now on map!

### Mid-Campaign Character
1. New player joins
2. Create character via wizard
3. Immediately create token
4. Character ready to play

### Replacing Token
If you need a new token:
1. Delete the old token from map (right-click → Delete)
2. Character's tokenId clears automatically (future enhancement)
3. Create new token from character

## Token vs Character

### Token (Map Representation)
- Position on map
- Visual sprite
- Can be moved/rotated
- Temporary states
- Combat-focused

### Character (Persistent Data)
- Full stats and abilities
- Equipment and inventory
- Background and description
- Level progression
- Campaign-independent

### The Link
- **Character → Token**: Via `tokenId` field
- **Token → Character**: Via matching `name` (future: direct link)
- Updates can sync (future enhancement)

## Future Enhancements

### Planned Features
- 📋 Auto-update token HP when character HP changes
- 📋 Sync character damage to token
- 📋 Click token to open character sheet
- 📋 Remove token link when token deleted
- 📋 Custom token position on creation
- 📋 Token inherits character's AC for display

### Advanced Integration
- 📋 Real-time HP sync during combat
- 📋 Status effects on character apply to token
- 📋 Token notes from character description
- 📋 Multiple tokens per character (copies/illusions)
- 📋 Token history per character

### Smart Features
- 📋 Auto-position tokens (spread them out)
- 📋 Group creation (create all party tokens)
- 📋 Token sets (NPCs, enemies)
- 📋 Template tokens from character classes

## Workflow Example

### Session Prep
```
1. Create Characters:
   - "Thorin" - Dwarf Warrior
   - "Elara" - Elf Mage
   - "Finn" - Human Rogue
   - "Aria" - Tiefling Bard

2. Load Campaign:
   - "Lost Mines of Phandelver"

3. Create Tokens:
   - Thorin → Token on map (100, 100)
   - Elara → Token on map (100, 100)
   - Finn → Token on map (100, 100)
   - Aria → Token on map (100, 100)

4. Position Tokens:
   - Drag tokens to starting positions
   - Snap to grid if enabled

5. Ready to Play! 🎲
```

## Technical Details

### Token Creation Function
```typescript
createTokenFromCharacter(characterId: string): void
```

**Checks:**
1. Character exists
2. Campaign is active
3. Character doesn't already have token

**Creates:**
- New Token with unique ID
- Links via character.tokenId
- Adds to current campaign

### Data Flow
```
Character Data → Transform → Token Data → Add to Map
      ↓                                        ↓
   Update Character.tokenId ← Token ID ← New Token Created
```

### Storage
- Token stored in campaign.tokens array
- Character.tokenId references token
- Both persist to local storage

## Best Practices

### When to Create Tokens
- **At session start**: Create all player tokens
- **New character joins**: Create immediately
- **NPCs enter combat**: Quick token creation

### Token Management
- **Move freely**: Tokens can be repositioned anytime
- **One per character**: Prevents duplicates
- **Clear naming**: Uses character name for clarity

### Character Updates
- Update character HP in character sheet
- Future: Will sync to token
- For now: Update token HP separately in token properties

## Troubleshooting

### Can't Create Token
**No Active Campaign:**
- Load a campaign first
- Go to Dashboard → Campaigns → Load Campaign

**Token Already Exists:**
- Character already has a token
- Delete the existing token first
- Or use the existing token

**Character Not Found:**
- Refresh the page
- Check character still exists
- Try creating character again

### Token Not Appearing
- Check if campaign map is loaded
- Switch to Map View tab
- Look for token at position (100, 100)
- Try zooming out to see more of the map

### Wrong Stats on Token
- Token captures character's HP at creation time
- Update character first, then create token
- Or edit token after creation

## Integration Points

### From Character Creator
After creating a character:
1. Navigate to Characters view
2. Find new character
3. Create token immediately

### From Dashboard
Quick workflow:
1. See character summary
2. Click "Create Token"
3. Switch to Map View
4. Move token to desired position

### From Map View
Future enhancement:
- Drag character portrait onto map
- Creates token at drop position

## Examples

### Example 1: Creating Party Tokens
```
Characters:
1. Thorin (Dwarf Warrior, HP 12, AC 18)
2. Elara (Elf Mage, HP 6, AC 12)
3. Finn (Human Rogue, HP 9, AC 14)

Actions:
→ Create Token (Thorin)
  ✅ Token created: HP 12/12, AC 18
→ Create Token (Elara)
  ✅ Token created: HP 6/6, AC 12
→ Create Token (Finn)
  ✅ Token created: HP 9/9, AC 14

Result: All party members on map!
```

### Example 2: Character with Portrait
```
Character: "Sir Aldric"
- Avatar: knight_portrait.jpg
- HP: 14/14
- AC: 18

→ Create Token
  ✅ Token shows knight portrait
  ✅ HP bar shows 14/14
  ✅ Can be moved/positioned
```

### Example 3: No Portrait Character
```
Character: "Bob the Bold"
- No avatar uploaded
- HP: 10/10

→ Create Token
  ✅ Token shows "B" (first letter)
  ✅ Gray background
  ✅ HP bar shows 10/10
```

## Related Features

- **Character Creation**: Create characters first
- **Token Management**: Move, edit, delete tokens
- **Campaign System**: Load campaign to enable tokens
- **Map View**: See and interact with tokens
- **HP Tracking**: Token HP bars update in real-time

---

**Creating tokens from characters makes it easy to bring your roster onto the battle map!** 🎭➡️🗺️


