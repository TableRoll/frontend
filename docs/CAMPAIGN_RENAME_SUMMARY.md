# Scene → Campaign Rename Summary

## What's Been Completed

### ✅ 1. Type Definitions (src/types/models.ts)
- Created `Campaign` interface with enhanced fields:
  - `sessionNumber`: Track which session the campaign is on
  - `lastPlayedAt`: When was this campaign last used
- Kept `Scene` as type alias for backwards compatibility
- Updated `AppState` to use `currentCampaign` instead of `currentScene`

### ✅ 2. Store Implementation (src/stores/mapStore.ts)
- Added `campaigns` array alongside `scenes` (kept for backwards compat)
- Implemented new campaign methods:
  - `setCurrentCampaign()` - Load a campaign
  - `addCampaign()` - Create new campaign
  - `updateCampaign()` - Modify campaign
  - `deleteCampaign()` - Remove campaign
  - `changeCampaignMap()` - Switch maps within campaign
- Updated all token operations to work with campaigns
- Created backwards-compatible Scene methods that call Campaign methods
- Updated sample data with two example campaigns:
  - "Lost Mines of Phandelver" (Session 3)
  - "Curse of Strahd" (Session 1)
- Updated persist configuration to save campaigns

### ✅ 3. Dashboard - Partial (src/components/Dashboard.tsx)
- Updated imports to use `Campaign`
- Renamed state variables
- Updated store hooks to use campaign methods
- Created `handleCreateCampaign()` function

## What Remains To Do

### 🔄 4. Dashboard UI Updates
Need to update all UI text and components from "Scene" to "Campaign":

#### Quick Stats Section
```typescript
// Line ~168 - Update badge text
<Text size="sm" c="dimmed">Campaigns</Text>
<Text size="xl" fw={700}>{campaigns.length}</Text>
```

#### Main Sections
- "Scenes Section" → "Campaigns Section" (title)
- "Create Scene" button → "New Campaign" button  
- Scene cards → Campaign cards with session number
- Scene menu options → Campaign menu options

#### Modals
- "Create Scene Modal" → "Create Campaign Modal"
  - Update title
  - Update field labels
  - Update button text
  - Add session number field
- "Change Scene Map" → "Change Campaign Map"
  - Update all references

#### Data Display
Show enhanced campaign info:
- Session number badge
- Last played date
- Token count per map in history

### 🔄 5. MapCanvas Component
Update references from `currentScene` to `currentCampaign`:
- Import statements
- Store hooks
- Conditional rendering
- Error messages

### 🔄 6. AppShell Component  
Update:
- Store hooks
- Scene info display → Campaign info display
- Navigation text

### 🔄 7. Other Components
Check and update:
- TokenCreator
- Any component using scene data

### 🔄 8. Documentation
Create/Update guides:
- Campaign management guide
- Map switching within campaigns
- Session tracking
- Update existing guides

## Terminology Changes

| Old Term | New Term | Context |
|----------|----------|---------|
| Scene | Campaign | Main concept |
| Create Scene | New Campaign | Button/Action |
| Scene Name | Campaign Name | Form field |
| Active Scene | Active Campaign | Status |
| Switch Scene | Switch Campaign | Action |
| Scene Settings | Campaign Settings | UI Section |

## Benefits of Campaign Model

### Better Organization
- Campaigns persist across multiple game sessions
- Track progression with session numbers
- See when you last played each campaign

### Enhanced Features
- Multiple maps per campaign with token preservation
- Session history tracking
- Campaign-level metadata (description, notes)
- Better reflects D&D terminology

### Future Enhancements
Campaigns enable:
- Session notes and summaries
- Campaign arcs and chapters
- Player progression tracking
- Story timeline
- Campaign sharing/export

## Migration Strategy

### Backwards Compatibility
- All old Scene methods still work (call Campaign methods internally)
- `scenes` array kept in sync with `campaigns` array
- Type alias `Scene = Campaign` maintains code compatibility
- Gradual migration - can update components one at a time

### Data Migration
No data migration needed:
- Existing scenes automatically become campaigns
- New fields get default values
- Token history preserved

## Implementation Notes

### Key Design Decisions
1. **Dual Arrays**: Keep both `campaigns` and `scenes` arrays in sync for backwards compatibility
2. **Method Proxies**: Old scene methods call new campaign methods
3. **Enhanced Data**: Added session tracking and last played timestamps
4. **Gradual Migration**: Can update UI incrementally without breaking existing code

### Testing Checklist
- [ ] Create new campaign
- [ ] Load existing campaign
- [ ] Switch between campaigns
- [ ] Change map within campaign
- [ ] Add/move tokens
- [ ] Campaign persists across sessions
- [ ] Session number increments
- [ ] Last played updates
- [ ] Token history works
- [ ] Export/import works

## Next Steps

1. **Complete Dashboard UI** - Finish updating all text and components
2. **Update MapCanvas** - Change scene references to campaign
3. **Update AppShell** - Update UI components
4. **Test Thoroughly** - Verify all functionality works
5. **Update Documentation** - Create comprehensive campaign guide
6. **Polish UI** - Add session badges, last played info, etc.

## Questions for User

1. **Session Auto-Increment**: Should session number auto-increment when loading a campaign?
2. **Campaign Archives**: Want ability to archive completed campaigns?
3. **Session Notes**: Add notes/summary per session?
4. **Campaign Templates**: Pre-made campaign templates for popular adventures?

---

*This rename better reflects the D&D concept of ongoing campaigns that span multiple sessions and can include various locations/encounters.*




