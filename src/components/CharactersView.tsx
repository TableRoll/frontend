import React, { useState } from 'react';
import {
  Container,
  Title,
  Text,
  Card,
  Group,
  Button,
  Badge,
  Stack,
  ActionIcon,
  Menu,
  Image,
  ScrollArea,
  Box,
  Alert,
  SimpleGrid,
  Progress,
  Divider
} from '@mantine/core';
import {
  IconPlus,
  IconDots,
  IconEdit,
  IconTrash,
  IconDownload,
  IconSword,
  IconShield,
  IconHeart,
  IconAlertCircle,
  IconUser
} from '@tabler/icons-react';
import { useMapStore } from '../stores/mapStore';
import { CharacterCreator } from './CharacterCreator';
import { notifications } from '@mantine/notifications';

export const CharactersView: React.FC = () => {
  const { characters, deleteCharacter, updateCharacter, addAsset } = useMapStore();
  const [characterCreatorOpened, setCharacterCreatorOpened] = useState(false);

  const calculateModifier = (score: number): number => {
    return Math.floor((score - 10) / 2);
  };

  const createTokenFromCharacter = (characterId: string) => {
    const character = characters.find(c => c.id === characterId);
    if (!character) return;

    // Check if character already has a token asset
    if (character.tokenId) {
      notifications.show({
        title: 'Token Asset Already Exists',
        message: `Token asset for ${character.name} already created. Check Assets tab.`,
        color: 'orange'
      });
      return;
    }

    // Create asset from character with full stats
    const assetId = `asset_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const newAsset = {
      id: assetId,
      name: character.name,
      type: 'token' as const,
      url: character.avatar || '',
      thumbnail: character.avatar || '',
      size: 0,
      uploadedAt: new Date(),
      tokenData: {
        hp: {
          current: character.currentHp,
          max: character.maxHp,
          temporary: 0
        },
        states: [],
        ownerId: 'player',
        locked: false,
        visible: true,
        size: 1,
        rotation: 0,
        // Store character stats in token data
        description: character.description,
        ac: character.armorClass,
        speed: character.speed,
        notes: `${character.race} ${character.class} - Level ${character.level}\nBackground: ${character.background}\nSTR: ${character.abilityScores.strength} DEX: ${character.abilityScores.dexterity} CON: ${character.abilityScores.constitution}\nINT: ${character.abilityScores.intelligence} WIS: ${character.abilityScores.wisdom} CHA: ${character.abilityScores.charisma}`
      }
    };
    
    addAsset(newAsset);

    // Update character with asset reference (using tokenId field to track asset)
    updateCharacter(characterId, { tokenId: assetId });

    notifications.show({
      title: 'Token Asset Created',
      message: `${character.name} token added to Assets. Drag from Asset Hotbar to place on map.`,
      color: 'green',
      autoClose: 5000
    });
  };

  return (
    <ScrollArea 
      h="100%" 
      scrollbarSize={8}
      scrollHideDelay={1000}
      style={{ 
        padding: '20px',
        height: 'calc(100vh - 60px)'
      }}
    >
      <Container size="xl">
        <Stack gap="xl">
          {/* Header */}
          <Group justify="space-between">
            <Box>
              <Title order={2}>Character Roster</Title>
              <Text c="dimmed">
                Manage your D&D characters
              </Text>
            </Box>
            
            <Button
              leftSection={<IconPlus size={16} />}
              onClick={() => setCharacterCreatorOpened(true)}
              size="lg"
            >
              Create Character
            </Button>
          </Group>

          {/* Characters Grid */}
          {characters.length === 0 ? (
            <Card withBorder p="xl">
              <Stack align="center" gap="md">
                <IconAlertCircle size={48} color="purple" />
                <Text size="lg" fw={600}>No Characters Yet</Text>
                <Text size="sm" c="dimmed" ta="center">
                  Create your first character to begin your adventure!
                </Text>
                <Button
                  leftSection={<IconPlus size={16} />}
                  onClick={() => setCharacterCreatorOpened(true)}
                  size="md"
                >
                  Create Your First Character
                </Button>
              </Stack>
            </Card>
          ) : (
            <SimpleGrid cols={2} spacing="lg">
              {characters.map((character) => {
                const hpPercent = (character.currentHp / character.maxHp) * 100;
                
                return (
                  <Card key={character.id} withBorder p="md" shadow="sm">
                    <Stack gap="md">
                      {/* Character Header */}
                      <Group justify="space-between">
                        <Group>
                          {character.avatar ? (
                            <Image
                              src={character.avatar}
                              width={80}
                              height={80}
                              radius="md"
                              alt={character.name}
                            />
                          ) : (
                            <Box
                              style={{
                                width: 80,
                                height: 80,
                                borderRadius: '8px',
                                backgroundColor: '#f1f3f5',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center'
                              }}
                            >
                              <Text size="xl" fw={700} c="dimmed">
                                {character.name.charAt(0).toUpperCase()}
                              </Text>
                            </Box>
                          )}
                          
                          <Box>
                            <Group gap="xs">
                              <Text size="lg" fw={600}>{character.name}</Text>
                              {character.tokenId && (
                                <Badge size="sm" color="green" variant="dot">Token Asset</Badge>
                              )}
                            </Group>
                            <Text size="sm" c="dimmed">
                              Level {character.level} {character.race.charAt(0).toUpperCase() + character.race.slice(1)} {character.class.charAt(0).toUpperCase() + character.class.slice(1)}
                            </Text>
                            <Group gap="xs" mt="xs">
                              <Badge size="sm" variant="light" color="purple">
                                {character.background.replace('_', ' ').split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}
                              </Badge>
                              <Badge size="sm" variant="light" color="yellow">
                                {character.startingGold} gp
                              </Badge>
                            </Group>
                          </Box>
                        </Group>
                        
                        <Menu shadow="md" width={200}>
                          <Menu.Target>
                            <ActionIcon variant="outline">
                              <IconDots size={16} />
                            </ActionIcon>
                          </Menu.Target>
                          
                          <Menu.Dropdown>
                            <Menu.Item 
                              leftSection={<IconUser size={14} />}
                              onClick={() => createTokenFromCharacter(character.id)}
                              disabled={!!character.tokenId}
                            >
                              {character.tokenId ? 'Token Asset Created' : 'Create Token Asset'}
                            </Menu.Item>
                            <Menu.Item leftSection={<IconEdit size={14} />}>
                              Edit Character
                            </Menu.Item>
                            <Menu.Item leftSection={<IconDownload size={14} />}>
                              Export
                            </Menu.Item>
                            <Menu.Divider />
                            <Menu.Item
                              leftSection={<IconTrash size={14} />}
                              color="red"
                              onClick={() => deleteCharacter(character.id)}
                            >
                              Delete
                            </Menu.Item>
                          </Menu.Dropdown>
                        </Menu>
                      </Group>

                      {/* HP Bar */}
                      <Box>
                        <Group justify="space-between" mb="xs">
                          <Group gap="xs">
                            <IconHeart size={16} color="red" />
                            <Text size="sm" fw={500}>Hit Points</Text>
                          </Group>
                          <Text size="sm" fw={600}>
                            {character.currentHp} / {character.maxHp}
                          </Text>
                        </Group>
                        <Progress
                          value={hpPercent}
                          color={hpPercent > 50 ? 'green' : hpPercent > 25 ? 'yellow' : 'red'}
                          size="lg"
                        />
                      </Box>

                      {/* Stats */}
                      <SimpleGrid cols={3} spacing="xs">
                        <Card withBorder p="xs">
                          <Text size="xs" c="dimmed" ta="center">AC</Text>
                          <Text size="md" fw={700} ta="center">{character.armorClass}</Text>
                        </Card>
                        <Card withBorder p="xs">
                          <Text size="xs" c="dimmed" ta="center">Initiative</Text>
                          <Text size="md" fw={700} ta="center">
                            {character.initiative >= 0 ? '+' : ''}{character.initiative}
                          </Text>
                        </Card>
                        <Card withBorder p="xs">
                          <Text size="xs" c="dimmed" ta="center">Speed</Text>
                          <Text size="md" fw={700} ta="center">{character.speed} ft</Text>
                        </Card>
                      </SimpleGrid>

                      {/* Ability Scores */}
                      <Box>
                        <Text size="xs" fw={500} mb="xs">Ability Scores</Text>
                        <SimpleGrid cols={6} spacing="xs">
                          {(Object.entries(character.abilityScores) as [string, number][]).map(([ability, score]) => {
                            const modifier = calculateModifier(score);
                            return (
                              <Box key={ability} style={{ textAlign: 'center' }}>
                                <Text size="xs" c="dimmed" tt="uppercase">
                                  {ability.slice(0, 3)}
                                </Text>
                                <Text size="sm" fw={700}>{score}</Text>
                                <Text size="xs" c="dimmed">
                                  {modifier >= 0 ? '+' : ''}{modifier}
                                </Text>
                              </Box>
                            );
                          })}
                        </SimpleGrid>
                      </Box>

                      {/* Equipment */}
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

                      {character.description && (
                        <Box>
                          <Text size="xs" c="dimmed" lineClamp={2}>
                            {character.description}
                          </Text>
                        </Box>
                      )}
                    </Stack>
                  </Card>
                );
              })}
            </SimpleGrid>
          )}
        </Stack>
      </Container>

      {/* Character Creator Modal */}
      <CharacterCreator
        opened={characterCreatorOpened}
        onClose={() => setCharacterCreatorOpened(false)}
      />
    </ScrollArea>
  );
};

