# Character Backgrounds System Guide

## Overview
Character backgrounds now provide meaningful bonuses including gold, ability score increases, starting items, and skills. Each background represents your character's pre-adventuring life and grants unique benefits.

## Available Backgrounds

### Noble
**"You were born into wealth and privilege."**
- **Starting Gold**: 25 gp (highest!)
- **Ability Bonus**: +1 Charisma
- **Starting Items**:
  - Fine Clothes
  - Signet Ring
  - Scroll of Pedigree
- **Skills**: History, Persuasion
- **Best For**: Bards, characters who rely on social interaction

---

### Soldier
**"You served in an organized army or militia."**
- **Starting Gold**: 10 gp
- **Ability Bonuses**: +1 Strength, +1 Constitution
- **Starting Items**:
  - Insignia of Rank
  - Trophy from Battle
  - Gaming Set
- **Skills**: Athletics, Intimidation
- **Best For**: Warriors, martial characters

---

### Sage
**"You spent years learning the secrets of the multiverse."**
- **Starting Gold**: 10 gp
- **Ability Bonus**: +2 Intelligence
- **Starting Items**:
  - Bottle of Ink
  - Quill
  - Small Knife
  - Letter with Question
- **Skills**: Arcana, History
- **Best For**: Mages, knowledge-focused characters

---

### Criminal
**"You operated outside the law to survive."**
- **Starting Gold**: 15 gp
- **Ability Bonus**: +1 Dexterity
- **Starting Items**:
  - Crowbar
  - Dark Clothes with Hood
  - Belt Pouch
- **Skills**: Deception, Stealth
- **Best For**: Rogues, sneaky characters

---

### Folk Hero
**"You come from humble origins and rose to greatness."**
- **Starting Gold**: 10 gp
- **Ability Bonuses**: +1 Strength, +1 Wisdom
- **Starting Items**:
  - Shovel
  - Iron Pot
  - Common Clothes
  - Belt Pouch
- **Skills**: Animal Handling, Survival
- **Best For**: Rangers, down-to-earth characters

---

### Acolyte
**"You served in a temple devoted to a deity."**
- **Starting Gold**: 15 gp
- **Ability Bonus**: +2 Wisdom
- **Starting Items**:
  - Holy Symbol
  - Prayer Book
  - Incense
  - Vestments
- **Skills**: Insight, Religion
- **Best For**: Divine spellcasters, religious characters

---

### Entertainer
**"You thrived in front of an audience."**
- **Starting Gold**: 15 gp
- **Ability Bonus**: +2 Charisma
- **Starting Items**:
  - Musical Instrument
  - Costume
  - Love Letter from Admirer
- **Skills**: Acrobatics, Performance
- **Best For**: Bards, performers

---

### Guild Artisan
**"You are a member of an artisan's guild."**
- **Starting Gold**: 15 gp
- **Ability Bonus**: +1 Intelligence
- **Starting Items**:
  - Artisan's Tools
  - Letter of Introduction
  - Traveler's Clothes
- **Skills**: Insight, Persuasion
- **Best For**: Crafters, merchants

## How Backgrounds Work

### Bonuses Stack with Race
Ability score bonuses from backgrounds **stack** with racial bonuses:

**Example: Elf Sage**
- Base Intelligence: 14
- Elf racial bonus: +1 Intelligence
- Sage background bonus: +2 Intelligence
- **Total Intelligence: 17**

### Display in Character Creator

**Step 3: Ability Scores**
- Blue badge: Total ability score
- Green badge: Racial bonus
- Purple badge: Background bonus (NEW!)

**Step 5: Finalization**
When you select a background, you'll see:
- Background description
- Starting gold amount (yellow badge)
- Ability bonuses (purple badges)
- Starting items list
- Proficient skills

**Summary Panel**
- Shows selected background
- Displays starting gold
- All bonuses included in final stats

## Recommended Combinations

### Maximum Ability Scores

**Highest Strength (18):**
- Base: 16
- Dwarf: +1
- Soldier: +1
- Total: 18

**Highest Intelligence (19):**
- Base: 16
- Gnome: +2
- Sage: +2
- Total: 20! (Exceeds normal max)

**Highest Charisma (18):**
- Base: 15
- Tiefling: +2
- Noble: +1
- Total: 18

### Class-Optimized Builds

**Warrior Build:**
- Race: Dwarf
- Background: Soldier
- Result: +2 STR, +3 CON, 10 gold

**Mage Build:**
- Race: Gnome
- Background: Sage
- Result: +4 INT, +1 DEX, 10 gold

**Ranger Build:**
- Race: Elf
- Background: Folk Hero
- Result: +3 DEX, +1 INT, +1 STR, +1 WIS, 10 gold

**Rogue Build:**
- Race: Human
- Background: Criminal
- Result: +2 DEX, +1 all others, 15 gold

**Bard Build:**
- Race: Tiefling
- Background: Entertainer
- Result: +4 CHA, +2 INT, 15 gold

## Starting Gold by Background

| Background | Gold | Use For |
|------------|------|---------|
| Noble | 25 gp | Best for buying extra equipment |
| Soldier | 10 gp | Standard amount |
| Sage | 10 gp | Standard amount |
| Criminal | 15 gp | Good balance |
| Folk Hero | 10 gp | Standard amount |
| Acolyte | 15 gp | Good balance |
| Entertainer | 15 gp | Good balance |
| Guild Artisan | 15 gp | Good balance |

## UI Features

### Background Selection
- **Dropdown Select**: No typing needed
- **Live Preview**: See bonuses immediately
- **Detailed Info Card**: Shows all benefits
- **Visual Feedback**: Selected background highlighted

### Bonus Display
**Purple Badges**: Background ability bonuses
**Yellow Badges**: Starting gold
**Skill Tags**: Proficient skills
**Item Lists**: Starting equipment from background

### Integration
- Bonuses apply to ability scores
- Gold amount saved with character
- Skills listed in character details
- Items can be added to inventory (future)

## Data Structure

```typescript
interface BackgroundBonus {
  name: string;
  description: string;
  gold: number;
  abilityBonus?: {
    strength?: number;
    dexterity?: number;
    constitution?: number;
    intelligence?: number;
    wisdom?: number;
    charisma?: number;
  };
  items?: string[];
  skills?: string[];
}
```

## Character Sheet Updates

Characters now store:
- **background**: CharacterBackground enum (not free text)
- **startingGold**: Number (from background)
- **abilityScores**: Final scores (with all bonuses applied)

## Tips

### Choosing a Background

**For Combat Characters:**
- Soldier: STR + CON bonuses
- Folk Hero: STR + WIS bonuses

**For Magic Users:**
- Sage: +2 INT for wizards
- Acolyte: +2 WIS for clerics

**For Social Characters:**
- Noble: +1 CHA and most gold
- Entertainer: +2 CHA for performers

**For Skill Specialists:**
- Criminal: DEX bonus and stealth skills
- Guild Artisan: Crafting and social skills

### Maximizing Stats
1. Pick race for primary stat bonus
2. Pick background for secondary stat bonus
3. Distribute base points to reach desired totals
4. Can reach 20 in a stat at level 1!

### Gold Strategy
- Noble (25 gp): Buy extra healing potions
- Others (10-15 gp): Enough for basic supplies
- Save gold for magic items later

## Future Enhancements

### Planned
- 📋 More backgrounds (Outlier, Charlatan, etc.)
- 📋 Custom backgrounds
- 📋 Background features (special abilities)
- 📋 Starting equipment packs by background
- 📋 Background story prompts
- 📋 Relationship with NPCs from background

### Advanced
- 📋 Background-specific quests
- 📋 Social connections system
- 📋 Background reputation tracking
- 📋 Origin story generator

## Examples

### Example 1: Noble Warrior
- Race: Human
- Class: Warrior
- Background: Noble
- Final: STR 16, CHA 14, 25 gold, HP 11, AC 18
- Great for a knight or paladin-type character

### Example 2: Sage Mage
- Race: Gnome
- Class: Mage
- Background: Sage
- Final: INT 20, DEX 15, 10 gold, HP 6, AC 12
- Ultimate intelligence for powerful spells

### Example 3: Criminal Rogue
- Race: Elf
- Class: Rogue
- Background: Criminal
- Final: DEX 17, INT 12, 15 gold, HP 9, AC 14
- Perfect for a master thief

## Validation

Character creation requires:
- ✅ Race selected
- ✅ Class selected
- ✅ Ability scores set
- ✅ Main weapon selected
- ✅ Character name entered
- ✅ **Background selected** (NEW!)

Without a background, you cannot create the character.

---

**Backgrounds add depth and mechanical benefits to your characters, making each one unique!** 🎭⚔️


