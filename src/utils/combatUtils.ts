import { CombatParticipant } from '../types/models';

export interface CombatRoll {
  total: number;
  rolls: number[];
  modifier: number;
  advantage?: boolean;
  disadvantage?: boolean;
}

export interface DamageRoll {
  total: number;
  rolls: number[];
  modifier: number;
  damageType: string;
}

/**
 * Roll a die with the specified number of sides
 */
export const rollDie = (sides: number): number => {
  return Math.floor(Math.random() * sides) + 1;
};

/**
 * Roll multiple dice
 */
export const rollDice = (count: number, sides: number): number[] => {
  return Array.from({ length: count }, () => rollDie(sides));
};

/**
 * Roll for initiative (d20 + Dex modifier)
 */
export const rollInitiative = (dexModifier: number): CombatRoll => {
  const roll = rollDie(20);
  const total = roll + dexModifier;
  
  return {
    total,
    rolls: [roll],
    modifier: dexModifier
  };
};

/**
 * Roll with advantage (roll twice, take higher)
 */
export const rollWithAdvantage = (modifier: number = 0): CombatRoll => {
  const roll1 = rollDie(20);
  const roll2 = rollDie(20);
  const higher = Math.max(roll1, roll2);
  const total = higher + modifier;
  
  return {
    total,
    rolls: [roll1, roll2],
    modifier,
    advantage: true
  };
};

/**
 * Roll with disadvantage (roll twice, take lower)
 */
export const rollWithDisadvantage = (modifier: number = 0): CombatRoll => {
  const roll1 = rollDie(20);
  const roll2 = rollDie(20);
  const lower = Math.min(roll1, roll2);
  const total = lower + modifier;
  
  return {
    total,
    rolls: [roll1, roll2],
    modifier,
    disadvantage: true
  };
};

/**
 * Roll for attack (d20 + attack modifier)
 */
export const rollAttack = (attackModifier: number, advantage?: boolean, disadvantage?: boolean): CombatRoll => {
  if (advantage && !disadvantage) {
    return rollWithAdvantage(attackModifier);
  } else if (disadvantage && !advantage) {
    return rollWithDisadvantage(attackModifier);
  } else {
    const roll = rollDie(20);
    return {
      total: roll + attackModifier,
      rolls: [roll],
      modifier: attackModifier
    };
  }
};

/**
 * Roll for damage
 */
export const rollDamage = (damageDice: string, modifier: number = 0, damageType: string = 'slashing'): DamageRoll => {
  // Parse damage dice (e.g., "2d6", "1d8", "1d4+1")
  const match = damageDice.match(/(\d+)d(\d+)([+-]\d+)?/);
  if (!match) {
    throw new Error(`Invalid damage dice format: ${damageDice}`);
  }
  
  const count = parseInt(match[1]);
  const sides = parseInt(match[2]);
  const extraModifier = match[3] ? parseInt(match[3]) : 0;
  
  const rolls = rollDice(count, sides);
  const total = rolls.reduce((sum, roll) => sum + roll, 0) + modifier + extraModifier;
  
  return {
    total,
    rolls,
    modifier: modifier + extraModifier,
    damageType
  };
};

/**
 * Calculate initiative order for combat participants
 */
export const calculateInitiativeOrder = (participants: CombatParticipant[]): CombatParticipant[] => {
  return [...participants].sort((a, b) => {
    // Sort by initiative (highest first)
    if (b.initiative !== a.initiative) {
      return b.initiative - a.initiative;
    }
    // If initiative is tied, sort by Dex modifier (highest first)
    return b.dexModifier - a.dexModifier;
  });
};

/**
 * Get the next participant in turn order
 */
export const getNextParticipant = (participants: CombatParticipant[], currentIndex: number): number => {
  return (currentIndex + 1) % participants.length;
};

/**
 * Check if a roll is a critical hit (natural 20)
 */
export const isCriticalHit = (roll: number): boolean => {
  return roll === 20;
};

/**
 * Check if a roll is a critical miss (natural 1)
 */
export const isCriticalMiss = (roll: number): boolean => {
  return roll === 1;
};

/**
 * Calculate armor class
 */
export const calculateAC = (baseAC: number, dexModifier: number, armorBonus: number = 0): number => {
  return baseAC + dexModifier + armorBonus;
};

/**
 * Calculate hit points
 */
export const calculateHP = (level: number, hitDie: number, conModifier: number): { current: number; max: number } => {
  const maxHP = level * (Math.floor(hitDie / 2) + 1 + conModifier);
  return {
    current: maxHP,
    max: maxHP
  };
};

/**
 * Apply damage to a participant
 */
export const applyDamage = (participant: CombatParticipant, damage: number): CombatParticipant => {
  const newCurrentHP = Math.max(0, participant.hp.current - damage);
  return {
    ...participant,
    hp: {
      ...participant.hp,
      current: newCurrentHP
    }
  };
};

/**
 * Apply healing to a participant
 */
export const applyHealing = (participant: CombatParticipant, healing: number): CombatParticipant => {
  const newCurrentHP = Math.min(participant.hp.max, participant.hp.current + healing);
  return {
    ...participant,
    hp: {
      ...participant.hp,
      current: newCurrentHP
    }
  };
};
