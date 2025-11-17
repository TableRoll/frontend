import React, { useState } from 'react';
import {
  Container,
  Title,
  Text,
  Button,
  Card,
  Group,
  Badge,
  Stack,
  Grid,
  Box,
  Progress,
  ActionIcon,
  Menu,
  Modal,
  Alert
} from '@mantine/core';
import {
  IconPlus,
  IconDots,
  IconEdit,
  IconTrash,
  IconHeart,
  IconShield,
  IconSword,
  IconUser,
  IconAlertCircle,
  IconPhoto
} from '@tabler/icons-react';
import { useMapStore } from '../stores/mapStore';
import { Character, Asset } from '../types/models';
import { CharacterCreator } from './CharacterCreator';

export const CharactersView: React.FC = () => {
  const { characters, deleteCharacter, updateCharacter, addCharacter } = useMapStore();
  const [characterCreatorOpened, setCharacterCreatorOpened] = useState(false);
  const [editingCharacter, setEditingCharacter] = useState<Character | null>(null);

  const calculateModifier = (score: number): number => {
    return Math.floor((score - 10) / 2);
  };

  const getModifierString = (score: number): string => {
    const mod = calculateModifier(score);
    return mod >= 0 ? `+${mod}` : `${mod}`;
  };

  const handleDeleteCharacter = (characterId: string) => {
    if (window.confirm('Are you sure you want to delete this character?')) {
      deleteCharacter(characterId);
    }
  };

  const handleEditCharacter = (character: Character) => {
    setEditingCharacter(character);
    setCharacterCreatorOpened(true);
  };

  const handleSaveCharacter = (character: Character) => {
    if (editingCharacter) {
      updateCharacter(editingCharacter.id, character);
      setEditingCharacter(null);
    } else {
      addCharacter(character);
    }
    setCharacterCreatorOpened(false);
  };

  const handleCloseCreator = () => {
    setCharacterCreatorOpened(false);
    setEditingCharacter(null);
  };

  const handleCreateAssetFromCharacter = (character: Character) => {
    const { addAsset } = useMapStore.getState();
    
    const asset: Asset = {
      id: `asset_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      name: `${character.name} Token`,
      type: 'token',
      url: character.avatar || '',
      thumbnail: character.avatar || '',
      size: 0,
      uploadedAt: new Date(),
      tokenData: {
        hp: {
          current: character.hp.current,
          max: character.hp.max,
          temporary: 0
        },
        states: [],
        ownerId: character.id,
        locked: false,
        visible: true,
        size: 1,
        rotation: 0,
        description: character.description,
        ac: character.armorClass,
        speed: character.speed,
        modifiers: {
          str: character.abilityScores?.strength ? Math.floor((character.abilityScores.strength - 10) / 2) : 0,
          dex: character.abilityScores?.dexterity ? Math.floor((character.abilityScores.dexterity - 10) / 2) : 0,
          con: character.abilityScores?.constitution ? Math.floor((character.abilityScores.constitution - 10) / 2) : 0,
          int: character.abilityScores?.intelligence ? Math.floor((character.abilityScores.intelligence - 10) / 2) : 0,
          wis: character.abilityScores?.wisdom ? Math.floor((character.abilityScores.wisdom - 10) / 2) : 0,
          cha: character.abilityScores?.charisma ? Math.floor((character.abilityScores.charisma - 10) / 2) : 0
        }
      }
    };
    
    addAsset(asset);
    // Show success notification
    console.log(`Created asset from character: ${character.name}`);
  };

  if (characters.length === 0) {
    return (
      <Container fluid py="xl">
        <Stack align="center" gap="lg">
          <Box ta="center">
            <IconUser size={64} color="gray" />
            <Title order={2} mt="md" c="dimmed">
              No Characters Yet
            </Title>
            <Text size="sm" c="dimmed" ta="center">
              Create your first character to begin your adventure!
            </Text>
            <Button
              leftSection={<IconPlus size={16} />}
              onClick={() => setCharacterCreatorOpened(true)}
              size="md"
              mt="md"
            >
              Create Your First Character
            </Button>
          </Box>
        </Stack>

        <CharacterCreator
          opened={characterCreatorOpened}
          onClose={handleCloseCreator}
          onSave={handleSaveCharacter}
          campaignId=""
        />
      </Container>
    );
  }

  return (
    <Container fluid py="xl">
      <Group justify="space-between" mb="xl">
        <div>
          <Title order={1}>Characters</Title>
          <Text c="dimmed">Manage your D&D characters</Text>
        </div>
        <Button
          leftSection={<IconPlus size={16} />}
          onClick={() => setCharacterCreatorOpened(true)}
          size="lg"
        >
          Create Character
        </Button>
      </Group>

      <Grid>
        {characters.map((character) => {
          const hpPercentage = character.hp ? (character.hp.current / character.hp.max) * 100 : 0;
          const isHealthy = hpPercentage > 50;
          const isWounded = hpPercentage > 25 && hpPercentage <= 50;
          const isCritical = hpPercentage <= 25;

          return (
            <Grid.Col key={character.id} span={{ base: 12, sm: 6, md: 4 }}>
              <Card withBorder shadow="sm" h="100%">
                <Stack gap="md" h="100%">
                  {/* Header */}
                  <Group justify="space-between">
                    <div>
                      <Text fw={600} size="lg">{character.name}</Text>
                      <Text size="sm" c="dimmed">
                        {character.race && character.class 
                          ? `${character.race} ${character.class}`
                          : 'Adventurer'
                        }
                      </Text>
                    </div>
                    <Menu>
                      <Menu.Target>
                        <ActionIcon variant="subtle">
                          <IconDots size={16} />
                        </ActionIcon>
                      </Menu.Target>
                      <Menu.Dropdown>
                        <Menu.Item
                          leftSection={<IconEdit size={14} />}
                          onClick={() => handleEditCharacter(character)}
                        >
                          Edit
                        </Menu.Item>
                        <Menu.Item
                          leftSection={<IconPhoto size={14} />}
                          onClick={() => handleCreateAssetFromCharacter(character)}
                        >
                          Create Asset
                        </Menu.Item>
                        <Menu.Item
                          leftSection={<IconTrash size={14} />}
                          color="red"
                          onClick={() => handleDeleteCharacter(character.id)}
                        >
                          Delete
                        </Menu.Item>
                      </Menu.Dropdown>
                    </Menu>
                  </Group>

                  {/* Character Image */}
                  {character.avatar && (
                    <Box ta="center">
                      <Box
                        style={{
                          width: 80,
                          height: 80,
                          borderRadius: '50%',
                          overflow: 'hidden',
                          margin: '0 auto',
                          border: '2px solid #e9ecef'
                        }}
                      >
                        <img
                          src={character.avatar}
                          alt={character.name}
                          style={{
                            width: '100%',
                            height: '100%',
                            objectFit: 'cover'
                          }}
                          onError={(e) => {
                            e.currentTarget.style.display = 'none';
                          }}
                        />
                      </Box>
                    </Box>
                  )}

                  {/* HP Bar */}
                  {character.hp && (
                    <Box>
                      <Group justify="space-between" mb="xs">
                        <Text size="sm" fw={500}>Health</Text>
                        <Text size="sm" c="dimmed">
                          {character.hp.current}/{character.hp.max}
                        </Text>
                      </Group>
                      <Progress
                        value={hpPercentage}
                        color={
                          isHealthy ? 'green' : 
                          isWounded ? 'yellow' : 
                          isCritical ? 'red' : 'gray'
                        }
                        size="sm"
                      />
                    </Box>
                  )}

                  {/* Stats */}
                  <Grid>
                    <Grid.Col span={6}>
                      <Box ta="center">
                        <Text size="xs" c="dimmed" ta="center">AC</Text>
                        <Text size="md" fw={700} ta="center">{character.armorClass || 10}</Text>
                      </Box>
                    </Grid.Col>
                    <Grid.Col span={6}>
                      <Box ta="center">
                        <Text size="xs" c="dimmed" ta="center">Speed</Text>
                        <Text size="md" fw={700} ta="center">{character.speed || 30} ft</Text>
                      </Box>
                    </Grid.Col>
                  </Grid>

                  {/* Ability Scores */}
                  {character.abilityScores && (
                    <Box>
                      <Text size="xs" fw={500} mb="xs">Ability Scores</Text>
                      <Grid>
                        {Object.entries(character.abilityScores).map(([ability, score]) => (
                          <Grid.Col key={ability} span={4}>
                            <Box ta="center">
                              <Text size="xs" c="dimmed" tt="capitalize">
                                {ability === 'str' ? 'STR' :
                                 ability === 'dex' ? 'DEX' :
                                 ability === 'con' ? 'CON' :
                                 ability === 'int' ? 'INT' :
                                 ability === 'wis' ? 'WIS' : 'CHA'}
                              </Text>
                              <Text size="sm" fw={600}>
                                {score} ({getModifierString(score)})
                              </Text>
                            </Box>
                          </Grid.Col>
                        ))}
                      </Grid>
                    </Box>
                  )}

                  {/* Equipment */}
                  {character.equipment && (
                    <Box>
                      <Text size="xs" fw={500} mb="xs">Equipment</Text>
                      <Group gap="xs">
                        {character.equipment.armor && (
                          <Badge size="sm" leftSection={<IconShield size={12} />}>
                            {character.equipment.armor.name}
                          </Badge>
                        )}
                        {character.equipment.mainWeapon && (
                          <Badge size="sm" leftSection={<IconSword size={12} />}>
                            {character.equipment.mainWeapon.name}
                          </Badge>
                        )}
                        {character.equipment.rangedWeapon && (
                          <Badge size="sm" variant="light">
                            {character.equipment.rangedWeapon.name}
                          </Badge>
                        )}
                      </Group>
                    </Box>
                  )}

                  {/* Description */}
                  {character.description && (
                    <Box>
                      <Text size="xs" c="dimmed" lineClamp={3}>
                        {character.description}
                      </Text>
                    </Box>
                  )}

                  {/* Spacer to push content to top */}
                  <Box style={{ flex: 1 }} />
                </Stack>
              </Card>
            </Grid.Col>
          );
        })}
      </Grid>

      <CharacterCreator
        opened={characterCreatorOpened}
        onClose={handleCloseCreator}
        onSave={handleSaveCharacter}
        campaignId="default_campaign"
      />
    </Container>
  );
};