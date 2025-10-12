import { Token, HealthPoints } from '../types/models';

/**
 * Creates a new token with default values
 */
export const createNewToken = (overrides: Partial<Token> = {}): Token => {
  const now = new Date();
  
  return {
    id: `token_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    name: 'New Token',
    x: 0,
    y: 0,
    rotation: 0,
    size: 1,
    sprite: '', // Will show as a circle with first letter of name
    hp: {
      current: 10,
      max: 10,
      temporary: 0
    } as HealthPoints,
    states: [],
    ownerId: 'gm', // Default to GM
    layerId: 'tokens', // Default to tokens layer
    locked: false,
    visible: true,
    createdAt: now,
    updatedAt: now,
    ...overrides
  };
};

/**
 * Creates a token from an asset (image)
 */
export const createTokenFromAsset = (
  assetId: string, 
  assetUrl: string, 
  assetName: string,
  overrides: Partial<Token> = {}
): Token => {
  return createNewToken({
    name: assetName,
    sprite: assetUrl,
    ...overrides
  });
};

/**
 * Creates a player character token
 */
export const createPlayerToken = (
  playerName: string,
  playerId: string,
  overrides: Partial<Token> = {}
): Token => {
  return createNewToken({
    name: playerName,
    ownerId: playerId,
    hp: {
      current: 20,
      max: 20,
      temporary: 0
    },
    ...overrides
  });
};

/**
 * Creates an NPC/monster token
 */
export const createNPCToken = (
  name: string,
  hp: number,
  overrides: Partial<Token> = {}
): Token => {
  return createNewToken({
    name,
    ownerId: 'gm',
    hp: {
      current: hp,
      max: hp,
      temporary: 0
    },
    ...overrides
  });
};
