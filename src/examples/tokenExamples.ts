import { useMapStore } from '../stores/mapStore';
import { createNewToken, createPlayerToken, createNPCToken } from '../utils/tokenUtils';

/**
 * Example functions showing how to add tokens programmatically
 */

// Example 1: Add a simple token
export const addSimpleToken = () => {
  const { addToken } = useMapStore.getState();
  
  const newToken = createNewToken({
    name: 'Goblin',
    x: 200,
    y: 150,
    hp: {
      current: 7,
      max: 7,
      temporary: 0
    }
  });
  
  addToken(newToken);
};

// Example 2: Add a player character token
export const addPlayerCharacter = (playerName: string, playerId: string) => {
  const { addToken } = useMapStore.getState();
  
  const playerToken = createPlayerToken(playerName, playerId, {
    x: 100,
    y: 100,
    size: 1.2, // Slightly larger for PCs
    hp: {
      current: 25,
      max: 25,
      temporary: 5
    }
  });
  
  addToken(playerToken);
};

// Example 3: Add an NPC with custom properties
export const addNPC = (name: string, hp: number, x: number, y: number) => {
  const { addToken } = useMapStore.getState();
  
  const npcToken = createNPCToken(name, hp, {
    x,
    y,
    size: 1,
    locked: false, // NPCs can be moved
    visible: true,
    states: ['hostile'] // Example status effect
  });
  
  addToken(npcToken);
};

// Example 4: Add multiple tokens at once
export const addEncounterTokens = () => {
  const { addToken } = useMapStore.getState();
  
  // Add a group of goblins
  const goblins = [
    { name: 'Goblin 1', x: 200, y: 150 },
    { name: 'Goblin 2', x: 250, y: 150 },
    { name: 'Goblin 3', x: 200, y: 200 },
    { name: 'Goblin Chief', x: 225, y: 175 }
  ];
  
  goblins.forEach((goblin, index) => {
    const token = createNPCToken(
      goblin.name, 
      goblin.name.includes('Chief') ? 15 : 7, // Chief has more HP
      {
        x: goblin.x,
        y: goblin.y,
        size: goblin.name.includes('Chief') ? 1.2 : 1,
        states: goblin.name.includes('Chief') ? ['leader'] : []
      }
    );
    
    addToken(token);
  });
};

// Example 5: Add a token with custom sprite
export const addTokenWithSprite = (spriteUrl: string, name: string) => {
  const { addToken } = useMapStore.getState();
  
  const token = createNewToken({
    name,
    x: 300,
    y: 200,
    sprite: spriteUrl,
    size: 1.5,
    hp: {
      current: 20,
      max: 20,
      temporary: 0
    }
  });
  
  addToken(token);
};
