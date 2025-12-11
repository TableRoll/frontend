import React, { useState, useEffect } from 'react';
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
import { useMapStore } from '../stores/mapStoreWithAPI';
import { Character, Asset } from '../types/models';
import { CharacterCreator } from './CharacterCreator';
import { notifications } from '@mantine/notifications';

export const CharactersView: React.FC = () => {
  const { characters, deleteCharacter, updateCharacter, addCharacter, loadCharacters, currentCampaign } = useMapStore();
  const [characterCreatorOpened, setCharacterCreatorOpened] = useState(false);
  const [editingCharacter, setEditingCharacter] = useState<Character | null>(null);

  // Reload characters when component mounts or campaign changes
  useEffect(() => {
    const reloadCharacters = async () => {
      try {
        await loadCharacters(currentCampaign?.id);
      } catch (error) {
        console.error('Failed to load characters:', error);
      }
    };
    reloadCharacters();
  }, [loadCharacters, currentCampaign?.id]);

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

  const handleSaveCharacter = async (character: Character) => {
    try {
      if (editingCharacter) {
        await updateCharacter(editingCharacter.id, character);
        setEditingCharacter(null);
      } else {
        await addCharacter(character);
      }
      // Reload characters to ensure the list is up to date
      await loadCharacters(currentCampaign?.id);
      setCharacterCreatorOpened(false);
    } catch (error) {
      console.error('Failed to save character:', error);
    }
  };

  const handleCloseCreator = () => {
    setCharacterCreatorOpened(false);
    setEditingCharacter(null);
  };

  const handleCreateAssetFromCharacter = async (character: Character) => {
    const { uploadAsset, currentCampaign, loadAssets } = useMapStore.getState();
    
    // Check if character has an avatar
    if (!character.avatar) {
      notifications.show({
        title: 'No Avatar',
        message: `Character ${character.name} has no avatar image. Please add an avatar image to create a token asset.`,
        color: 'orange',
        autoClose: 5000
      });
      return;
    }

    try {
      let file: File;
      const avatarUrl = character.avatar;

      // Check if it's a data URL (starts with data:)
      if (avatarUrl.startsWith('data:')) {
        // Convert data URL to File
        const response = await fetch(avatarUrl);
        const blob = await response.blob();
        file = new File([blob], `${character.name}_token.png`, { type: blob.type || 'image/png' });
      } else {
        // It's a regular URL - fetch it first, then convert to File
        console.log('Fetching avatar from URL:', avatarUrl);
        const response = await fetch(avatarUrl);
        if (!response.ok) {
          throw new Error(`Failed to fetch avatar image: ${response.status} ${response.statusText}`);
        }
        const blob = await response.blob();
        file = new File([blob], `${character.name}_token.png`, { type: blob.type || 'image/png' });
      }

      console.log('Uploading asset from character:', character.name, 'File size:', file.size);

      // Upload asset via API - this adds it to the store immediately
      const uploadResult = await uploadAsset(file, {
        name: `${character.name} Token`,
        assetType: 'token',
        campaignId: currentCampaign?.id,
        isPublic: false
      });

      console.log('Asset uploaded successfully, result:', uploadResult);

      // Small delay to ensure API has processed the upload
      await new Promise(resolve => setTimeout(resolve, 500));

      // Reload assets from API to ensure we have the latest data
      await loadAssets(currentCampaign?.id);

      // Verify the asset was added
      const { assets: loadedAssets } = useMapStore.getState();
      console.log('Loaded assets after upload:', loadedAssets.length, 'assets');
      console.log('All asset names:', loadedAssets.map(a => `${a.name} (${a.type})`));
      
      const newAsset = loadedAssets.find(a => 
        (a.name === `${character.name} Token` || a.name.includes(character.name)) && 
        a.type === 'token'
      );
      
      if (newAsset) {
        notifications.show({
          title: 'Asset Created',
          message: `Token asset created for ${character.name}. It's now available in the Asset menu when GM mode is enabled.`,
          color: 'green',
          autoClose: 5000
        });
        console.log('✅ Asset created and verified:', {
          id: newAsset.id,
          name: newAsset.name,
          type: newAsset.type,
          hasUrl: !!newAsset.url,
          hasThumbnail: !!newAsset.thumbnail
        });
      } else {
        console.warn('⚠️ Asset uploaded but not found in store after reload');
        console.warn('Available assets:', loadedAssets);
        notifications.show({
          title: 'Upload Complete',
          message: `Token asset uploaded for ${character.name}. If it doesn't appear, try refreshing the page or check the Assets tab.`,
          color: 'yellow',
          autoClose: 5000
        });
      }
    } catch (error) {
      console.error('❌ Failed to create asset from character:', error);
      notifications.show({
        title: 'Error',
        message: `Failed to create asset from character: ${error instanceof Error ? error.message : 'Unknown error'}`,
        color: 'red',
        autoClose: 5000
      });
    }
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