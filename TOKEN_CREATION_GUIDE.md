# 🎯 Token Creation Guide

This guide explains how to add new tokens to your D&D Map App. There are several ways to create tokens, from simple programmatic creation to full UI-based token creation.

## 📋 Table of Contents

1. [Token Structure](#token-structure)
2. [Method 1: Using the UI](#method-1-using-the-ui)
3. [Method 2: Programmatic Creation](#method-2-programmatic-creation)
4. [Method 3: From Assets](#method-3-from-assets)
5. [Examples](#examples)
6. [Keyboard Shortcuts](#keyboard-shortcuts)

## 🏗️ Token Structure

Each token has the following properties:

```typescript
interface Token {
  id: string;           // Unique identifier (auto-generated)
  name: string;         // Display name
  x: number;           // X position on map
  y: number;           // Y position on map
  rotation: number;    // Rotation in degrees (0-360)
  size: number;        // Size multiplier (0.1-5.0)
  sprite: string;      // Image URL or path
  hp: HealthPoints;    // Health points object
  states: string[];    // Status effects array
  ownerId: string;     // Player who owns this token
  layerId: string;     // Which layer the token is on
  locked: boolean;     // Whether token can be moved
  visible: boolean;    // Whether token is visible
  createdAt: Date;     // Creation timestamp
  updatedAt: Date;     // Last update timestamp
}

interface HealthPoints {
  current: number;     // Current HP
  max: number;         // Maximum HP
  temporary?: number;  // Temporary HP (optional)
}
```

## 🖱️ Method 1: Using the UI

### From the Map Canvas

1. **Open the Map View**: Navigate to the Map tab in your app
2. **Click the Add Token Button**: Look for the blue "+" button in the top-right corner
3. **Fill out the Token Creator Form**:
   - **Name**: Enter a descriptive name for your token
   - **Position**: Set X and Y coordinates (or leave at 0,0 to place manually)
   - **Size**: Adjust the token size (1.0 = normal size)
   - **Rotation**: Set initial rotation in degrees
   - **Owner**: Choose who owns this token (GM or a player)
   - **Health Points**: Set current, max, and temporary HP
   - **Token Image**: Upload an image file or leave blank for default circle
   - **Properties**: Set if the token is locked or visible
4. **Click "Create Token"**: The token will be added to the current scene

### From the Asset Panel

1. **Open the Assets Tab**: Navigate to the Assets section
2. **Find an Image Asset**: Look for image or token type assets
3. **Click the Menu Button**: Click the "..." button on the asset
4. **Select "Create Token"**: This will open the Token Creator with the asset pre-loaded
5. **Customize and Create**: Adjust settings and create the token

## 💻 Method 2: Programmatic Creation

### Using Utility Functions

```typescript
import { useMapStore } from '../stores/mapStore';
import { createNewToken, createPlayerToken, createNPCToken } from '../utils/tokenUtils';

// Get the store
const { addToken } = useMapStore.getState();

// Create a basic token
const basicToken = createNewToken({
  name: 'Goblin',
  x: 200,
  y: 150,
  hp: { current: 7, max: 7, temporary: 0 }
});
addToken(basicToken);

// Create a player character token
const playerToken = createPlayerToken('Aragorn', 'player1', {
  x: 100,
  y: 100,
  size: 1.2,
  hp: { current: 25, max: 25, temporary: 5 }
});
addToken(playerToken);

// Create an NPC token
const npcToken = createNPCToken('Dragon', 50, {
  x: 300,
  y: 200,
  size: 2.0,
  states: ['flying', 'hostile']
});
addToken(npcToken);
```

### Direct Store Usage

```typescript
import { useMapStore } from '../stores/mapStore';

const { addToken } = useMapStore.getState();

const customToken = {
  id: `token_${Date.now()}`,
  name: 'Custom Token',
  x: 150,
  y: 150,
  rotation: 0,
  size: 1,
  sprite: 'https://example.com/token-image.png',
  hp: {
    current: 15,
    max: 15,
    temporary: 0
  },
  states: ['blessed'],
  ownerId: 'gm',
  layerId: 'tokens',
  locked: false,
  visible: true,
  createdAt: new Date(),
  updatedAt: new Date()
};

addToken(customToken);
```

## 🖼️ Method 3: From Assets

### Creating Tokens from Uploaded Images

1. **Upload an Image**: Go to Assets → Upload Assets
2. **Select the Image**: Choose an image file (PNG, JPG, etc.)
3. **Create Token**: Use the "Create Token" option from the asset menu
4. **Customize**: The Token Creator will open with the image pre-loaded

### Programmatic Asset-to-Token Creation

```typescript
import { createTokenFromAsset } from '../utils/tokenUtils';

const asset = {
  id: 'asset_123',
  name: 'Goblin Warrior',
  type: 'token' as const,
  url: 'https://example.com/goblin.png',
  thumbnail: 'https://example.com/goblin-thumb.png',
  size: 1024,
  uploadedAt: new Date()
};

const token = createTokenFromAsset(asset.id, asset.url, asset.name, {
  x: 200,
  y: 150,
  size: 1.2,
  hp: { current: 12, max: 12, temporary: 0 }
});

addToken(token);
```

## 📚 Examples

### Example 1: Simple Goblin Encounter

```typescript
const addGoblinEncounter = () => {
  const { addToken } = useMapStore.getState();
  
  const goblins = [
    { name: 'Goblin 1', x: 200, y: 150 },
    { name: 'Goblin 2', x: 250, y: 150 },
    { name: 'Goblin 3', x: 200, y: 200 }
  ];
  
  goblins.forEach(goblin => {
    const token = createNPCToken('Goblin', 7, {
      name: goblin.name,
      x: goblin.x,
      y: goblin.y,
      states: ['hostile']
    });
    addToken(token);
  });
};
```

### Example 2: Player Characters

```typescript
const addPlayerParty = () => {
  const { addToken } = useMapStore.getState();
  
  const party = [
    { name: 'Aragorn', id: 'player1', x: 100, y: 100 },
    { name: 'Legolas', id: 'player2', x: 120, y: 100 },
    { name: 'Gimli', id: 'player3', x: 100, y: 120 }
  ];
  
  party.forEach(player => {
    const token = createPlayerToken(player.name, player.id, {
      x: player.x,
      y: player.y,
      size: 1.1,
      hp: { current: 20, max: 20, temporary: 0 }
    });
    addToken(token);
  });
};
```

### Example 3: Boss Monster

```typescript
const addBossMonster = () => {
  const { addToken } = useMapStore.getState();
  
  const boss = createNPCToken('Ancient Dragon', 200, {
    x: 400,
    y: 300,
    size: 3.0,
    states: ['legendary', 'flying', 'hostile'],
    locked: false,
    visible: true
  });
  
  addToken(boss);
};
```

## ⌨️ Keyboard Shortcuts

- **T**: Open Token Creator (when on Map view)
- **G**: Toggle grid visibility
- **S**: Toggle snap-to-grid
- **R**: Reset viewport
- **F**: Fit map to screen
- **+/-**: Zoom in/out

## 🎨 Token Customization Tips

### Size Guidelines
- **Small creatures**: 0.5-0.8 (rats, spiders)
- **Medium creatures**: 1.0 (humans, goblins)
- **Large creatures**: 1.5-2.0 (ogres, bears)
- **Huge creatures**: 2.5-3.0 (dragons, giants)

### Health Point Suggestions
- **Minions**: 1-5 HP
- **Standard enemies**: 6-15 HP
- **Elite enemies**: 16-30 HP
- **Bosses**: 50+ HP
- **Player characters**: 15-25 HP (depending on level)

### Status Effects Examples
- `['hostile']` - Enemy token
- `['friendly']` - Ally token
- `['neutral']` - Neutral NPC
- `['flying']` - Flying creature
- `['invisible']` - Hidden token
- `['blessed']` - Has beneficial effect
- `['cursed']` - Has negative effect

## 🔧 Troubleshooting

### Token Not Appearing
1. Check if you have a current scene loaded
2. Verify the token's `visible` property is `true`
3. Ensure the token's position is within the map bounds
4. Check if the token layer is visible

### Token Not Moving
1. Verify the token's `locked` property is `false`
2. Check if you're in GM mode (some tokens require GM permissions)
3. Ensure the token layer is not locked

### Image Not Loading
1. Verify the image URL is accessible
2. Check if the image format is supported (PNG, JPG, GIF)
3. Ensure the image file size is reasonable (< 5MB recommended)

## 🚀 Advanced Features

### Custom Token States
You can add custom status effects to tokens:

```typescript
const token = createNewToken({
  name: 'Blessed Warrior',
  states: ['blessed', 'haste', 'protection'],
  // ... other properties
});
```

### Token Ownership
Control who can interact with tokens:

```typescript
const playerToken = createNewToken({
  name: 'Player Character',
  ownerId: 'player123', // Only this player can move it
  // ... other properties
});
```

### Layer Management
Place tokens on different layers:

```typescript
const backgroundToken = createNewToken({
  name: 'Background Element',
  layerId: 'background', // Won't interfere with gameplay tokens
  // ... other properties
});
```

This guide should help you create and manage tokens effectively in your D&D Map App! 🎲
