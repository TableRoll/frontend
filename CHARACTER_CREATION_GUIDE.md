# Character Creation System Guide

## Overview
A complete D&D 5e-style character creation wizard that guides players through creating their characters step-by-step. Features multi-step progression with race selection, class selection, ability scores, equipment, and character details.

## Features Implemented

### ✅ Complete Character System
- **5 Playable Races**: Human, Elf, Dwarf, Gnome, Tiefling
- **5 Character Classes**: Warrior, Mage, Ranger, Rogue, Bard
- **Ability Scores**: Strength, Dexterity, Constitution, Intelligence, Wisdom, Charisma
- **Starting Equipment**: Armor, weapons, and backpacks
- **Character Details**: Name, background, description, portrait

### ✅ Multi-Step Wizard
- **Step 1: Race Selection** - Choose from 5 races with unique bonuses
- **Step 2: Class Selection** - Pick your class and see hit die
- **Step 3: Ability Scores** - Distribute points with racial bonuses
- **Step 4: Equipment** - Select armor, weapons, and backpack
- **Step 5: Details** - Name, background, description, portrait

### ✅ Automatic Calculations
- HP based on class hit die + Constitution modifier
- Armor Class from armor type + Dexterity modifier
- Ability modifiers calculated automatically
- Initiative from Dexterity modifier
- Racial ability bonuses applied automatically

### ✅ Character Management
- View all characters in dedicated Characters tab
- Character cards with stats and equipment
- Edit, export, and delete characters
- Character portraits/avatars
- HP tracking with visual progress bar

## How to Use

### Creating a Character

#### Step 1: Open Character Creator
**From Dashboard:**
- Click the **"Create Character"** button in the Characters section

**From Characters View:**
- Navigate to **Characters** tab in sidebar
- Click **"Create Character"** button

#### Step 2: Choose Your Race
Select from 5 available races:

**Human**
- Bonuses: +1 to all abilities
- Description: Versatile and adaptable

**Elf**
- Bonuses: +2 Dexterity, +1 Intelligence
- Description: Graceful masters of magic and archery

**Dwarf**
- Bonuses: +2 Constitution, +1 Strength
- Description: Hardy warriors and craftsmen

**Gnome**
- Bonuses: +2 Intelligence, +1 Dexterity
- Description: Clever and inventive

**Tiefling**
- Bonuses: +2 Charisma, +1 Intelligence
- Description: Infernal heritage with innate magic

#### Step 3: Choose Your Class
Select from 5 character classes:

**Warrior** (d10 hit die)
- Primary: Strength
- Description: Master of martial combat

**Mage** (d6 hit die)
- Primary: Intelligence
- Description: Wielder of arcane magic

**Ranger** (d10 hit die)
- Primary: Dexterity
- Description: Expert tracker and wilderness survivor

**Rogue** (d8 hit die)
- Primary: Dexterity
- Description: Skilled in stealth and precision

**Bard** (d8 hit die)
- Primary: Charisma
- Description: Magic through music and performance

#### Step 4: Set Ability Scores
Distribute points for six abilities (range: 8-18):
- **Strength** - Physical power
- **Dexterity** - Agility and reflexes
- **Constitution** - Health and stamina
- **Intelligence** - Reasoning and memory
- **Wisdom** - Awareness and insight
- **Charisma** - Force of personality

**Features:**
- See modifiers calculated automatically
- Racial bonuses shown separately
- Total scores displayed prominently

#### Step 5: Choose Starting Equipment

**Armor Options:**
- No Armor (AC 10)
- Leather Armor (AC 11) - Light
- Chain Shirt (AC 13) - Medium
- Plate Armor (AC 18) - Heavy
- Shield (AC +2)

**Main Weapons:**
- Longsword (1d8 damage)
- Battleaxe (1d8 damage)
- Mace (1d6 damage)
- Dagger (1d4 damage)
- Quarterstaff (1d6 damage)
- Wand (1d6 damage)

**Ranged Weapons:**
- Longbow (1d8 damage)
- Crossbow (1d8 damage)

**Backpack Options:**
- Small Pack (10 items)
- Adventurer's Pack (20 items)
- Explorer's Pack (30 items)
- Bag of Holding (100 items)

#### Step 6: Finalize Character

**Required:**
- Character Name

**Optional:**
- Background (e.g., Noble, Soldier, Sage)
- Description (appearance, personality)
- Character Portrait (image upload)

**Summary Panel:**
- Review all selections
- See calculated HP, AC, Initiative
- Preview character stats

#### Step 7: Create!
Click **"Create Character"** and your character is added to the roster!

## Character Sheet

### Viewing Characters

**Dashboard:**
- Quick view in Characters section
- Shows name, race/class, HP, AC
- Grid of character cards

**Characters Tab:**
- Full character roster view
- Detailed stat cards
- HP bars with color coding
- All equipment displayed
- Ability scores with modifiers

### Character Cards Display

Each character card shows:
- **Portrait** (if uploaded)
- **Name** and level
- **Race and Class**
- **Background** badge
- **HP Bar** (green/yellow/red based on health)
- **Core Stats**: AC, Initiative, Speed
- **Ability Scores** (all 6 with modifiers)
- **Equipment** badges
- **Description** preview
- **Actions menu** (Edit, Export, Delete)

## Calculations

### Hit Points
```
HP = Class Hit Die + Constitution Modifier
```

### Armor Class
```
Base AC (from armor) + Dexterity Modifier
- Heavy armor: No Dex bonus
- Medium armor: Max +2 Dex
- Light armor: Full Dex bonus
```

### Ability Modifiers
```
Modifier = floor((Ability Score - 10) / 2)
```

### Initiative
```
Initiative = Dexterity Modifier
```

## Data Structure

### Character Object
```typescript
{
  id: string;
  name: string;
  race: 'human' | 'elf' | 'dwarf' | 'gnome' | 'tiefling';
  class: 'warrior' | 'mage' | 'ranger' | 'rogue' | 'bard';
  level: number;
  abilityScores: {
    strength: number;
    dexterity: number;
    constitution: number;
    intelligence: number;
    wisdom: number;
    charisma: number;
  };
  equipment: {
    armor?: { type, name, armorClass };
    mainWeapon?: { type, name, damage };
    rangedWeapon?: { type, name, damage, range };
    backpack?: { type, name, items[] };
  };
  background: string;
  description: string;
  avatar?: string;
  maxHp: number;
  currentHp: number;
  armorClass: number;
  speed: number;
  initiative: number;
  proficiencyBonus: number;
}
```

## Integration with App

### Store Management
Characters are stored in the global Zustand store:
```typescript
const { 
  characters,
  addCharacter,
  updateCharacter,
  deleteCharacter
} = useMapStore();
```

### Persistence
- Characters saved to local storage
- Avatar images excluded from persistence (too large)
- Full data preserved across sessions

### Navigation
Access character creation from:
1. **Dashboard** → Characters section → "New Character"
2. **Characters Tab** → "Create Character"
3. Sidebar navigation → "Characters"

## Tips for Character Creation

### Recommended Ability Scores by Class

**Warrior:**
- Strength: 15-16
- Constitution: 14
- Dexterity: 12

**Mage:**
- Intelligence: 15-16
- Dexterity: 14
- Constitution: 12

**Ranger:**
- Dexterity: 15-16
- Wisdom: 14
- Constitution: 12

**Rogue:**
- Dexterity: 15-16
- Charisma: 14
- Intelligence: 12

**Bard:**
- Charisma: 15-16
- Dexterity: 14
- Constitution: 12

### Equipment Recommendations

**Warrior:**
- Armor: Plate or Chain
- Main: Longsword or Battleaxe
- Ranged: Crossbow

**Mage:**
- Armor: None or Light
- Main: Staff or Wand
- Ranged: None

**Ranger:**
- Armor: Light or Medium
- Main: Longsword
- Ranged: Longbow

**Rogue:**
- Armor: Light
- Main: Dagger
- Ranged: Bow

**Bard:**
- Armor: Light
- Main: Sword or Dagger
- Ranged: Bow

## Future Enhancements

### Planned Features
- 📋 More races (Half-Elf, Halfling, Dragonborn, etc.)
- 📋 More classes (Paladin, Cleric, Druid, Monk, etc.)
- 📋 Subclasses/Specializations
- 📋 Skills and proficiencies selection
- 📋 Spell selection for casters
- 📋 Feat selection
- 📋 Multi-classing support
- 📋 Level up system
- 📋 Inventory management
- 📋 Character sheet export (PDF)

### Advanced Features
- 📋 Link character to token on map
- 📋 Auto-create token from character
- 📋 HP tracking during combat
- 📋 Condition/status tracking
- 📋 Spell slots management
- 📋 Character backgrounds with story prompts
- 📋 Character relationships
- 📋 Party composition view

## Troubleshooting

### Character Creator Not Opening
- Check that button is clickable
- Ensure no modals are already open
- Refresh the page if needed

### Can't Proceed to Next Step
Required selections:
- Step 1: Must select a race
- Step 2: Must select a class
- Step 4: Must select a main weapon
- Step 5: Must enter character name

### Stats Look Wrong
- Verify ability scores (8-18 range)
- Check racial bonuses are applied
- Confirm class selection
- Review equipment AC bonuses

### Character Not Saving
- Ensure all required fields filled
- Check browser console for errors
- Verify local storage not full

## Examples

### Creating a Classic Fighter
1. **Race**: Human (+1 to all)
2. **Class**: Warrior (d10 HP)
3. **Abilities**: STR 16, DEX 12, CON 14, INT 10, WIS 10, CHA 10
4. **Equipment**: Plate Armor, Longsword, Crossbow, Medium Pack
5. **Details**: Name "Aldric the Brave", Background "Soldier"
6. **Result**: HP 14, AC 18, Init +1

### Creating an Elf Wizard
1. **Race**: Elf (+2 DEX, +1 INT)
2. **Class**: Mage (d6 HP)
3. **Abilities**: STR 8, DEX 14, CON 12, INT 16, WIS 12, CHA 10
4. **Equipment**: No Armor, Staff, none, Magical Backpack
5. **Details**: Name "Elara Moonwhisper", Background "Sage"
6. **Result**: HP 7, AC 12, Init +2

## API Reference

### Store Actions
```typescript
// Add new character
addCharacter(character: Character): void

// Update existing character
updateCharacter(characterId: string, updates: Partial<Character>): void

// Delete character
deleteCharacter(characterId: string): void
```

### Component Props
```typescript
<CharacterCreator 
  opened={boolean}
  onClose={() => void}
/>

<CharactersView />
```

## Benefits

### For Players
- Quick character creation process
- Visual feedback at each step
- Automatic calculations
- Professional character sheets
- Easy management

### For GMs
- Track all player characters
- Quick reference for stats
- Export for printing
- Consistent character data

---

**The character creation system makes it easy to create and manage D&D characters for your campaigns!** 🎲⚔️


