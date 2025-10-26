import React, { useState } from 'react';
import {
  Modal,
  Stepper,
  Button,
  Group,
  TextInput,
  Textarea,
  NumberInput,
  Card,
  Text,
  Stack,
  Grid,
  SimpleGrid,
  Box,
  Badge,
  FileInput,
  Paper,
  Center,
  Select,
  Divider,
  Alert
} from '@mantine/core';
import {
  IconCheck,
  IconChevronRight,
  IconChevronLeft,
  IconAlertCircle
} from '@tabler/icons-react';
import {
  Character,
  CharacterRace,
  CharacterClass,
  CharacterBackground,
  AbilityScores,
  ArmorType,
  WeaponType,
  BackpackType
} from '../types/models';
import { charactersAPI } from '../services/api';

interface CharacterCreatorProps {
  opened: boolean;
  onClose: () => void;
  onSave: (character: Character) => void;
  campaignId: string;
}

// Race data with bonuses
const races: Record<CharacterRace, { name: string; description: string; bonuses: Partial<AbilityScores> }> = {
  human: {
    name: 'Human',
    description: 'Versatile and ambitious, humans are the most adaptable race.',
    bonuses: { strength: 1, dexterity: 1, constitution: 1, intelligence: 1, wisdom: 1, charisma: 1 }
  },
  elf: {
    name: 'Elf',
    description: 'Graceful and long-lived, elves are masters of magic and archery.',
    bonuses: { dexterity: 2, intelligence: 1 }
  },
  dwarf: {
    name: 'Dwarf',
    description: 'Hardy and resilient, dwarves are renowned warriors and craftsmen.',
    bonuses: { constitution: 2, strength: 1 }
  },
  gnome: {
    name: 'Gnome',
    description: 'Small and clever, gnomes are inventive and energetic.',
    bonuses: { intelligence: 2, dexterity: 1 }
  },
  tiefling: {
    name: 'Tiefling',
    description: 'Born of infernal heritage, tieflings possess innate magical abilities.',
    bonuses: { charisma: 2, intelligence: 1 }
  }
};

// Class data
const classes: Record<CharacterClass, { name: string; description: string; hitDie: number; primaryStat: keyof AbilityScores }> = {
  warrior: {
    name: 'Warrior',
    description: 'Master of martial combat and physical prowess.',
    hitDie: 10,
    primaryStat: 'strength'
  },
  mage: {
    name: 'Mage',
    description: 'Wielder of arcane magic and mystical powers.',
    hitDie: 6,
    primaryStat: 'intelligence'
  },
  ranger: {
    name: 'Ranger',
    description: 'Expert tracker and wilderness survivor.',
    hitDie: 10,
    primaryStat: 'dexterity'
  },
  rogue: {
    name: 'Rogue',
    description: 'Skilled in stealth, deception, and precision strikes.',
    hitDie: 8,
    primaryStat: 'dexterity'
  },
  bard: {
    name: 'Bard',
    description: 'Charismatic performer who weaves magic through music.',
    hitDie: 8,
    primaryStat: 'charisma'
  }
};

// Equipment options
const armorOptions: Record<ArmorType, { name: string; ac: number }> = {
  none: { name: 'No Armor', ac: 10 },
  light: { name: 'Leather Armor', ac: 11 },
  medium: { name: 'Chain Shirt', ac: 13 },
  heavy: { name: 'Plate Armor', ac: 18 },
  shield: { name: 'Shield', ac: 2 }
};

const weaponOptions: Record<WeaponType, { name: string; damage: string }> = {
  sword: { name: 'Longsword', damage: '1d8' },
  axe: { name: 'Battleaxe', damage: '1d8' },
  mace: { name: 'Mace', damage: '1d6' },
  dagger: { name: 'Dagger', damage: '1d4' },
  bow: { name: 'Longbow', damage: '1d8' },
  crossbow: { name: 'Crossbow', damage: '1d8' },
  staff: { name: 'Quarterstaff', damage: '1d6' },
  wand: { name: 'Wand', damage: '1d6' }
};

const backpackOptions: Record<BackpackType, { name: string; capacity: number }> = {
  small: { name: 'Small Pack', capacity: 10 },
  medium: { name: 'Adventurer\'s Pack', capacity: 20 },
  large: { name: 'Explorer\'s Pack', capacity: 30 },
  magical: { name: 'Bag of Holding', capacity: 100 }
};

// Background options with bonuses
interface BackgroundBonus {
  name: string;
  description: string;
  gold: number;
  abilityBonus?: Partial<AbilityScores>;
  items?: string[];
  skills?: string[];
}

const backgroundOptions: Record<CharacterBackground, BackgroundBonus> = {
  noble: {
    name: 'Noble',
    description: 'You were born into wealth and privilege.',
    gold: 25,
    abilityBonus: { charisma: 1 },
    items: ['Fine Clothes', 'Signet Ring', 'Scroll of Pedigree'],
    skills: ['History', 'Persuasion']
  },
  soldier: {
    name: 'Soldier',
    description: 'You served in an organized army or militia.',
    gold: 10,
    abilityBonus: { strength: 1, constitution: 1 },
    items: ['Insignia of Rank', 'Trophy from Battle', 'Gaming Set'],
    skills: ['Athletics', 'Intimidation']
  },
  sage: {
    name: 'Sage',
    description: 'You spent years learning the secrets of the multiverse.',
    gold: 10,
    abilityBonus: { intelligence: 2 },
    items: ['Bottle of Ink', 'Quill', 'Small Knife', 'Letter with Question'],
    skills: ['Arcana', 'History']
  },
  criminal: {
    name: 'Criminal',
    description: 'You operated outside the law to survive.',
    gold: 15,
    abilityBonus: { dexterity: 1 },
    items: ['Crowbar', 'Dark Clothes with Hood', 'Belt Pouch'],
    skills: ['Deception', 'Stealth']
  },
  folk_hero: {
    name: 'Folk Hero',
    description: 'You come from humble origins and rose to greatness.',
    gold: 10,
    abilityBonus: { strength: 1, wisdom: 1 },
    items: ['Shovel', 'Iron Pot', 'Common Clothes', 'Belt Pouch'],
    skills: ['Animal Handling', 'Survival']
  },
  acolyte: {
    name: 'Acolyte',
    description: 'You served in a temple devoted to a deity.',
    gold: 15,
    abilityBonus: { wisdom: 2 },
    items: ['Holy Symbol', 'Prayer Book', 'Incense', 'Vestments'],
    skills: ['Insight', 'Religion']
  },
  entertainer: {
    name: 'Entertainer',
    description: 'You thrived in front of an audience.',
    gold: 15,
    abilityBonus: { charisma: 2 },
    items: ['Musical Instrument', 'Costume', 'Love Letter from Admirer'],
    skills: ['Acrobatics', 'Performance']
  },
  guild_artisan: {
    name: 'Guild Artisan',
    description: 'You are a member of an artisan\'s guild.',
    gold: 15,
    abilityBonus: { intelligence: 1 },
    items: ['Artisan\'s Tools', 'Letter of Introduction', 'Traveler\'s Clothes'],
    skills: ['Insight', 'Persuasion']
  }
};

export const CharacterCreator: React.FC<CharacterCreatorProps> = ({ opened, onClose, onSave, campaignId }) => {
  const [active, setActive] = useState(0);

  // Character data
  const [selectedRace, setSelectedRace] = useState<CharacterRace | null>(null);
  const [selectedClass, setSelectedClass] = useState<CharacterClass | null>(null);
  const [abilityScores, setAbilityScores] = useState<AbilityScores>({
    strength: 10,
    dexterity: 10,
    constitution: 10,
    intelligence: 10,
    wisdom: 10,
    charisma: 10
  });
  const [selectedArmor, setSelectedArmor] = useState<ArmorType>('none');
  const [selectedMainWeapon, setSelectedMainWeapon] = useState<WeaponType | null>(null);
  const [selectedRangedWeapon, setSelectedRangedWeapon] = useState<WeaponType | null>(null);
  const [selectedBackpack, setSelectedBackpack] = useState<BackpackType>('medium');
  const [characterName, setCharacterName] = useState('');
  const [description, setDescription] = useState('');
  const [selectedBackground, setSelectedBackground] = useState<CharacterBackground | null>(null);
  const [avatar, setAvatar] = useState<string>('');

  const nextStep = () => setActive((current) => (current < 4 ? current + 1 : current));
  const prevStep = () => setActive((current) => (current > 0 ? current - 1 : current));

  const calculateModifier = (score: number): number => {
    return Math.floor((score - 10) / 2);
  };

  const getTotalAbilityScore = (ability: keyof AbilityScores): number => {
    let total = abilityScores[ability];
    
    // Add racial bonus
    if (selectedRace && races[selectedRace].bonuses[ability]) {
      total += races[selectedRace].bonuses[ability]!;
    }
    
    // Add background bonus
    if (selectedBackground && backgroundOptions[selectedBackground].abilityBonus?.[ability]) {
      total += backgroundOptions[selectedBackground].abilityBonus![ability]!;
    }
    
    return total;
  };

  const calculateHP = (): number => {
    if (!selectedClass) return 10;
    const hitDie = classes[selectedClass].hitDie;
    const totalCon = getTotalAbilityScore('constitution');
    const conMod = calculateModifier(totalCon);
    return hitDie + conMod;
  };

  const calculateAC = (): number => {
    const baseAC = armorOptions[selectedArmor].ac;
    const totalDex = getTotalAbilityScore('dexterity');
    const dexMod = calculateModifier(totalDex);
    return baseAC + (selectedArmor === 'heavy' ? 0 : Math.min(dexMod, selectedArmor === 'medium' ? 2 : 10));
  };

  const getStartingGold = (): number => {
    return selectedBackground ? backgroundOptions[selectedBackground].gold : 10;
  };

  const handleAvatarUpload = (file: File | null) => {
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setAvatar(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCreateCharacter = async () => {
    if (!selectedRace || !selectedClass || !characterName || !selectedBackground) {
      return;
    }

    try {
      // Calculate final ability scores with all bonuses
      const finalAbilityScores: AbilityScores = {
        strength: getTotalAbilityScore('strength'),
        dexterity: getTotalAbilityScore('dexterity'),
        constitution: getTotalAbilityScore('constitution'),
        intelligence: getTotalAbilityScore('intelligence'),
        wisdom: getTotalAbilityScore('wisdom'),
        charisma: getTotalAbilityScore('charisma')
      };

      // Equipment will be handled by the API based on class/background

      const characterData = {
        name: characterName,
        description,
        imageUrl: avatar,
        campaignId,
        raceId: selectedRace, // This should be the race ID from the API
        classId: selectedClass, // This should be the class ID from the API
        backgroundId: selectedBackground, // This should be the background ID from the API
        level: 1,
        abilityScores: finalAbilityScores,
        hpMax: calculateHP(),
        armorClass: calculateAC(),
        speed: 30,
        size: 'medium'
      };

      // Create character via API
      const response = await charactersAPI.create(characterData);
      const character = response.character;

      // Call the onSave callback with the created character
      onSave(character);
      handleClose();
    } catch (error) {
      console.error('Failed to create character:', error);
      // You might want to show an error message to the user here
    }
  };

  const handleClose = () => {
    setActive(0);
    setSelectedRace(null);
    setSelectedClass(null);
    setAbilityScores({
      strength: 10,
      dexterity: 10,
      constitution: 10,
      intelligence: 10,
      wisdom: 10,
      charisma: 10
    });
    setSelectedArmor('none');
    setSelectedMainWeapon(null);
    setSelectedRangedWeapon(null);
    setSelectedBackpack('medium');
    setCharacterName('');
    setDescription('');
    setSelectedBackground(null);
    setAvatar('');
    onClose();
  };

  return (
    <Modal
      opened={opened}
      onClose={handleClose}
      title="Create Character"
      size="xl"
      closeOnClickOutside={false}
    >
      <Stepper active={active} onStepClick={setActive}>
        {/* Step 1: Race Selection */}
        <Stepper.Step label="Race" description="Choose your race">
          <Stack gap="md">
            <Text size="lg" fw={600}>Choose Your Race</Text>
            <Text size="sm" c="dimmed">Each race has unique ability bonuses and traits</Text>
            
            <SimpleGrid cols={2} spacing="md">
              {(Object.keys(races) as CharacterRace[]).map((raceKey) => {
                const race = races[raceKey];
                return (
                  <Card
                    key={raceKey}
                    withBorder
                    p="md"
                    style={{
                      cursor: 'pointer',
                      border: selectedRace === raceKey ? '2px solid #228be6' : '1px solid #dee2e6',
                      backgroundColor: selectedRace === raceKey ? '#e7f5ff' : 'white'
                    }}
                    onClick={() => setSelectedRace(raceKey)}
                  >
                    <Stack gap="xs">
                      <Group justify="space-between">
                        <Text fw={600}>{race.name}</Text>
                        {selectedRace === raceKey && (
                          <Badge color="blue" size="sm">Selected</Badge>
                        )}
                      </Group>
                      <Text size="sm" c="dimmed">{race.description}</Text>
                      <Divider />
                      <Text size="xs" fw={500}>Ability Bonuses:</Text>
                      <Group gap="xs">
                        {Object.entries(race.bonuses).map(([stat, bonus]) => (
                          <Badge key={stat} size="xs" variant="light">
                            {stat.slice(0, 3).toUpperCase()} +{bonus}
                          </Badge>
                        ))}
                      </Group>
                    </Stack>
                  </Card>
                );
              })}
            </SimpleGrid>
          </Stack>
        </Stepper.Step>

        {/* Step 2: Class Selection */}
        <Stepper.Step label="Class" description="Choose your class">
          <Stack gap="md">
            <Text size="lg" fw={600}>Choose Your Class</Text>
            <Text size="sm" c="dimmed">Your class determines your abilities and playstyle</Text>
            
            <SimpleGrid cols={2} spacing="md">
              {(Object.keys(classes) as CharacterClass[]).map((classKey) => {
                const charClass = classes[classKey];
                return (
                  <Card
                    key={classKey}
                    withBorder
                    p="md"
                    style={{
                      cursor: 'pointer',
                      border: selectedClass === classKey ? '2px solid #228be6' : '1px solid #dee2e6',
                      backgroundColor: selectedClass === classKey ? '#e7f5ff' : 'white'
                    }}
                    onClick={() => setSelectedClass(classKey)}
                  >
                    <Stack gap="xs">
                      <Group justify="space-between">
                        <Text fw={600}>{charClass.name}</Text>
                        {selectedClass === classKey && (
                          <Badge color="blue" size="sm">Selected</Badge>
                        )}
                      </Group>
                      <Text size="sm" c="dimmed">{charClass.description}</Text>
                      <Divider />
                      <Group gap="md">
                        <Box>
                          <Text size="xs" c="dimmed">Hit Die</Text>
                          <Text size="sm" fw={600}>d{charClass.hitDie}</Text>
                        </Box>
                        <Box>
                          <Text size="xs" c="dimmed">Primary</Text>
                          <Text size="sm" fw={600}>{charClass.primaryStat.slice(0, 3).toUpperCase()}</Text>
                        </Box>
                      </Group>
                    </Stack>
                  </Card>
                );
              })}
            </SimpleGrid>
          </Stack>
        </Stepper.Step>

        {/* Step 3: Ability Scores */}
        <Stepper.Step label="Abilities" description="Set ability scores">
          <Stack gap="md">
            <Text size="lg" fw={600}>Ability Scores</Text>
            <Text size="sm" c="dimmed">Distribute points for your character's abilities (8-18)</Text>
            
            <Grid>
              {(Object.keys(abilityScores) as (keyof AbilityScores)[]).map((ability) => {
                const score = abilityScores[ability];
                const raceBonus = (selectedRace && races[selectedRace].bonuses[ability]) || 0;
                const backgroundBonus = (selectedBackground && backgroundOptions[selectedBackground].abilityBonus?.[ability]) || 0;
                const totalScore = score + raceBonus + backgroundBonus;
                const totalModifier = calculateModifier(totalScore);
                
                return (
                  <Grid.Col span={6} key={ability}>
                    <Card withBorder p="md">
                      <Stack gap="xs">
                        <Group justify="space-between">
                          <Text fw={600} tt="capitalize">{ability}</Text>
                          <Group gap="xs">
                            <Badge color="blue" size="lg">{totalScore}</Badge>
                            {raceBonus > 0 && (
                              <Badge color="green" size="sm" title="Racial Bonus">+{raceBonus}</Badge>
                            )}
                            {backgroundBonus > 0 && (
                              <Badge color="purple" size="sm" title="Background Bonus">+{backgroundBonus}</Badge>
                            )}
                          </Group>
                        </Group>
                        <NumberInput
                          value={score}
                          onChange={(value) => setAbilityScores(prev => ({
                            ...prev,
                            [ability]: typeof value === 'number' ? value : 10
                          }))}
                          min={8}
                          max={18}
                          step={1}
                        />
                        <Text size="xs" c="dimmed">
                          Modifier: {totalModifier >= 0 ? '+' : ''}{totalModifier}
                        </Text>
                      </Stack>
                    </Card>
                  </Grid.Col>
                );
              })}
            </Grid>
          </Stack>
        </Stepper.Step>

        {/* Step 4: Starting Gear */}
        <Stepper.Step label="Equipment" description="Choose starting gear">
          <Stack gap="md">
            <Text size="lg" fw={600}>Starting Equipment</Text>
            <Text size="sm" c="dimmed">Select your armor, weapons, and backpack</Text>
            
            {/* Armor Selection */}
            <Box>
              <Text size="sm" fw={500} mb="xs">Armor</Text>
              <SimpleGrid cols={2} spacing="sm">
                {(Object.keys(armorOptions) as ArmorType[]).map((armorKey) => {
                  const armor = armorOptions[armorKey];
                  return (
                    <Card
                      key={armorKey}
                      withBorder
                      p="sm"
                      style={{
                        cursor: 'pointer',
                        border: selectedArmor === armorKey ? '2px solid #228be6' : '1px solid #dee2e6',
                        backgroundColor: selectedArmor === armorKey ? '#e7f5ff' : 'white'
                      }}
                      onClick={() => setSelectedArmor(armorKey)}
                    >
                      <Group justify="space-between">
                        <Text size="sm" fw={500}>{armor.name}</Text>
                        <Badge size="sm">AC {armor.ac}</Badge>
                      </Group>
                    </Card>
                  );
                })}
              </SimpleGrid>
            </Box>

            {/* Main Weapon */}
            <Box>
              <Text size="sm" fw={500} mb="xs">Main Weapon</Text>
              <SimpleGrid cols={2} spacing="sm">
                {(['sword', 'axe', 'mace', 'dagger', 'staff', 'wand'] as WeaponType[]).map((weaponKey) => {
                  const weapon = weaponOptions[weaponKey];
                  return (
                    <Card
                      key={weaponKey}
                      withBorder
                      p="sm"
                      style={{
                        cursor: 'pointer',
                        border: selectedMainWeapon === weaponKey ? '2px solid #228be6' : '1px solid #dee2e6',
                        backgroundColor: selectedMainWeapon === weaponKey ? '#e7f5ff' : 'white'
                      }}
                      onClick={() => setSelectedMainWeapon(weaponKey)}
                    >
                      <Group justify="space-between">
                        <Text size="sm" fw={500}>{weapon.name}</Text>
                        <Badge size="sm">{weapon.damage}</Badge>
                      </Group>
                    </Card>
                  );
                })}
              </SimpleGrid>
            </Box>

            {/* Ranged Weapon */}
            <Box>
              <Text size="sm" fw={500} mb="xs">Ranged Weapon</Text>
              <SimpleGrid cols={2} spacing="sm">
                {(['bow', 'crossbow'] as WeaponType[]).map((weaponKey) => {
                  const weapon = weaponOptions[weaponKey];
                  return (
                    <Card
                      key={weaponKey}
                      withBorder
                      p="sm"
                      style={{
                        cursor: 'pointer',
                        border: selectedRangedWeapon === weaponKey ? '2px solid #228be6' : '1px solid #dee2e6',
                        backgroundColor: selectedRangedWeapon === weaponKey ? '#e7f5ff' : 'white'
                      }}
                      onClick={() => setSelectedRangedWeapon(weaponKey)}
                    >
                      <Group justify="space-between">
                        <Text size="sm" fw={500}>{weapon.name}</Text>
                        <Badge size="sm">{weapon.damage}</Badge>
                      </Group>
                    </Card>
                  );
                })}
              </SimpleGrid>
            </Box>

            {/* Backpack */}
            <Box>
              <Text size="sm" fw={500} mb="xs">Backpack</Text>
              <SimpleGrid cols={2} spacing="sm">
                {(Object.keys(backpackOptions) as BackpackType[]).map((backpackKey) => {
                  const backpack = backpackOptions[backpackKey];
                  return (
                    <Card
                      key={backpackKey}
                      withBorder
                      p="sm"
                      style={{
                        cursor: 'pointer',
                        border: selectedBackpack === backpackKey ? '2px solid #228be6' : '1px solid #dee2e6',
                        backgroundColor: selectedBackpack === backpackKey ? '#e7f5ff' : 'white'
                      }}
                      onClick={() => setSelectedBackpack(backpackKey)}
                    >
                      <Group justify="space-between">
                        <Text size="sm" fw={500}>{backpack.name}</Text>
                        <Badge size="sm">{backpack.capacity} items</Badge>
                      </Group>
                    </Card>
                  );
                })}
              </SimpleGrid>
            </Box>
          </Stack>
        </Stepper.Step>

        {/* Step 5: Finalization */}
        <Stepper.Step label="Details" description="Name and background">
          <Stack gap="md">
            <Text size="lg" fw={600}>Finalize Your Character</Text>
            
            <Grid>
              <Grid.Col span={8}>
                <Stack gap="md">
                  <TextInput
                    label="Character Name"
                    placeholder="Enter character name"
                    value={characterName}
                    onChange={(e) => setCharacterName(e.target.value)}
                    required
                  />

                  <Box>
                    <Select
                      label="Background"
                      placeholder="Choose a background"
                      data={[
                        { value: 'noble', label: 'Noble' },
                        { value: 'soldier', label: 'Soldier' },
                        { value: 'sage', label: 'Sage' },
                        { value: 'criminal', label: 'Criminal' },
                        { value: 'folk_hero', label: 'Folk Hero' },
                        { value: 'acolyte', label: 'Acolyte' },
                        { value: 'entertainer', label: 'Entertainer' },
                        { value: 'guild_artisan', label: 'Guild Artisan' }
                      ]}
                      value={selectedBackground}
                      onChange={(value) => setSelectedBackground(value as CharacterBackground)}
                      required
                    />
                    {selectedBackground && (
                      <Card withBorder p="sm" mt="xs" style={{ backgroundColor: '#f8f9fa' }}>
                        <Stack gap="xs">
                          <Text size="sm" fw={500}>{backgroundOptions[selectedBackground].name}</Text>
                          <Text size="xs" c="dimmed">{backgroundOptions[selectedBackground].description}</Text>
                          <Divider />
                          <Group gap="xs">
                            <Badge color="yellow" size="sm">
                              {backgroundOptions[selectedBackground].gold} Gold
                            </Badge>
                            {backgroundOptions[selectedBackground].abilityBonus && 
                              Object.entries(backgroundOptions[selectedBackground].abilityBonus!).map(([stat, bonus]) => (
                                <Badge key={stat} color="purple" size="sm">
                                  {stat.slice(0, 3).toUpperCase()} +{bonus}
                                </Badge>
                              ))
                            }
                          </Group>
                          {backgroundOptions[selectedBackground].items && (
                            <Box>
                              <Text size="xs" fw={500}>Starting Items:</Text>
                              <Text size="xs" c="dimmed">
                                {backgroundOptions[selectedBackground].items!.join(', ')}
                              </Text>
                            </Box>
                          )}
                          {backgroundOptions[selectedBackground].skills && (
                            <Box>
                              <Text size="xs" fw={500}>Skills:</Text>
                              <Text size="xs" c="dimmed">
                                {backgroundOptions[selectedBackground].skills!.join(', ')}
                              </Text>
                            </Box>
                          )}
                        </Stack>
                      </Card>
                    )}
                  </Box>

                  <Textarea
                    label="Description"
                    placeholder="Describe your character's appearance and personality"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    minRows={4}
                  />

                  <Box>
                    <FileInput
                      label="Character Portrait"
                      description="This image will be used as the token avatar on the map"
                      placeholder="Upload character image"
                      accept="image/*"
                      onChange={handleAvatarUpload}
                    />
                    
                    {!avatar && (
                      <Alert icon={<IconAlertCircle size={16} />} color="blue" mt="xs">
                        <Text size="xs">
                          💡 Upload a portrait to use a custom image for your token. 
                          Without one, the token will display the first letter of your character's name.
                        </Text>
                      </Alert>
                    )}
                    
                    {avatar && (
                      <Card withBorder p="sm" mt="xs" style={{ backgroundColor: '#e7f5ff' }}>
                        <Stack gap="xs">
                          <Text size="xs" fw={500} c="blue">Token Preview</Text>
                          <Center>
                            <Box
                              style={{
                                width: 100,
                                height: 100,
                                borderRadius: '50%',
                                border: '3px solid #228be6',
                                backgroundImage: `url(${avatar})`,
                                backgroundSize: 'cover',
                                backgroundPosition: 'center',
                                overflow: 'hidden',
                                boxShadow: '0 4px 12px rgba(34, 139, 230, 0.3)'
                              }}
                            />
                          </Center>
                          <Text size="xs" c="blue" ta="center" fw={500}>
                            ✓ This portrait will be your token on the map
                          </Text>
                        </Stack>
                      </Card>
                    )}
                  </Box>
                </Stack>
              </Grid.Col>

              <Grid.Col span={4}>
                <Paper withBorder p="md">
                  <Stack gap="sm">
                    <Text size="sm" fw={600} ta="center">Character Summary</Text>
                    
                    {avatar ? (
                      <Stack gap="xs">
                        <Center>
                          <Box
                            style={{
                              width: 120,
                              height: 120,
                              borderRadius: '50%',
                              border: '3px solid #495057',
                              backgroundImage: `url(${avatar})`,
                              backgroundSize: 'cover',
                              backgroundPosition: 'center',
                              overflow: 'hidden',
                              boxShadow: '0 2px 8px rgba(0,0,0,0.15)'
                            }}
                          />
                        </Center>
                        <Text size="xs" c="dimmed" ta="center">
                          Token Avatar
                        </Text>
                      </Stack>
                    ) : (
                      <Stack gap="xs">
                        <Center>
                          <Box
                            style={{
                              width: 120,
                              height: 120,
                              borderRadius: '50%',
                              border: '3px solid #495057',
                              backgroundColor: '#868e96',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center'
                            }}
                          >
                            <Text size="xl" c="white" fw={700}>
                              {characterName ? characterName.charAt(0).toUpperCase() : '?'}
                            </Text>
                          </Box>
                        </Center>
                        <Text size="xs" c="dimmed" ta="center">
                          No portrait - token will show first letter
                        </Text>
                      </Stack>
                    )}

                    <Divider />

                    <Box>
                      <Text size="xs" c="dimmed">Race</Text>
                      <Text size="sm" fw={500}>{selectedRace ? races[selectedRace].name : '-'}</Text>
                    </Box>

                    <Box>
                      <Text size="xs" c="dimmed">Class</Text>
                      <Text size="sm" fw={500}>{selectedClass ? classes[selectedClass].name : '-'}</Text>
                    </Box>

                    <Box>
                      <Text size="xs" c="dimmed">Level</Text>
                      <Text size="sm" fw={500}>1</Text>
                    </Box>

                    <Box>
                      <Text size="xs" c="dimmed">Background</Text>
                      <Text size="sm" fw={500}>
                        {selectedBackground ? backgroundOptions[selectedBackground].name : '-'}
                      </Text>
                    </Box>

                    <Divider />

                    <Box>
                      <Text size="xs" c="dimmed">Hit Points</Text>
                      <Text size="sm" fw={500}>{calculateHP()}</Text>
                    </Box>

                    <Box>
                      <Text size="xs" c="dimmed">Armor Class</Text>
                      <Text size="sm" fw={500}>{calculateAC()}</Text>
                    </Box>

                    <Box>
                      <Text size="xs" c="dimmed">Speed</Text>
                      <Text size="sm" fw={500}>30 ft</Text>
                    </Box>

                    <Box>
                      <Text size="xs" c="dimmed">Initiative</Text>
                      <Text size="sm" fw={500}>
                        {calculateModifier(getTotalAbilityScore('dexterity')) >= 0 ? '+' : ''}
                        {calculateModifier(getTotalAbilityScore('dexterity'))}
                      </Text>
                    </Box>

                    <Box>
                      <Text size="xs" c="dimmed">Starting Gold</Text>
                      <Badge color="yellow" size="sm">{getStartingGold()} gp</Badge>
                    </Box>
                  </Stack>
                </Paper>
              </Grid.Col>
            </Grid>
          </Stack>
        </Stepper.Step>

        <Stepper.Completed>
          <Stack gap="md" align="center" py="xl">
            <IconCheck size={64} color="green" />
            <Text size="xl" fw={600}>Character Created!</Text>
            <Text size="sm" c="dimmed">Your character has been added to your roster</Text>
          </Stack>
        </Stepper.Completed>
      </Stepper>

      <Group justify="space-between" mt="xl">
        <Button variant="outline" onClick={prevStep} disabled={active === 0}>
          <IconChevronLeft size={16} />
          Back
        </Button>
        
        {active < 4 ? (
          <Button 
            onClick={nextStep}
            disabled={
              (active === 0 && !selectedRace) ||
              (active === 1 && !selectedClass) ||
              (active === 3 && !selectedMainWeapon)
            }
          >
            Next
            <IconChevronRight size={16} />
          </Button>
        ) : (
          <Button 
            onClick={handleCreateCharacter}
            disabled={!characterName || !selectedBackground}
            color="green"
          >
            Create Character
            <IconCheck size={16} />
          </Button>
        )}
      </Group>
    </Modal>
  );
};

