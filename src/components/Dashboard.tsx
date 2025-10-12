import React, { useState, useRef, useEffect } from 'react';
import {
  Container,
  Title,
  Text,
  Grid,
  Card,
  Group,
  Button,
  Badge,
  Stack,
  Modal,
  TextInput,
  Textarea,
  NumberInput,
  FileInput,
  Select,
  ActionIcon,
  Menu,
  Image,
  ScrollArea,
  Box,
  Alert,
  Timeline,
  SimpleGrid
} from '@mantine/core';
import {
  IconPlus,
  IconUpload,
  IconMap,
  IconUsers,
  IconMusic,
  IconDots,
  IconEdit,
  IconTrash,
  IconPlayerPlay,
  IconDownload,
  IconShare,
  IconUser,
  IconAlertCircle,
  IconX
} from '@tabler/icons-react';
import { useMapStore } from '../stores/mapStore';
import { Map, Campaign } from '../types/models';
import { formatDate } from '../utils/dateUtils';
import { CharacterCreator } from './CharacterCreator';
import { notifications } from '@mantine/notifications';

// Map Preview Component with Grid Overlay
interface MapPreviewProps {
  imageUrl: string;
  gridSize: number;
  gridType: 'square' | 'hex';
  width: number;
  height: number;
}

const MapPreview: React.FC<MapPreviewProps> = ({ imageUrl, gridSize, gridType, width, height }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Draw map image
    const img = document.createElement('img');
    img.onload = () => {
      // Calculate scale to fit preview
      const maxPreviewWidth = 600;
      const maxPreviewHeight = 400;
      const scale = Math.min(maxPreviewWidth / width, maxPreviewHeight / height, 1);
      
      const scaledWidth = width * scale;
      const scaledHeight = height * scale;
      const scaledGridSize = gridSize * scale;
      
      // Set canvas size
      canvas.width = scaledWidth;
      canvas.height = scaledHeight;
      
      // Draw image
      ctx.drawImage(img, 0, 0, scaledWidth, scaledHeight);
      
      // Draw grid overlay
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.5)';
      ctx.lineWidth = 1;
      
      if (gridType === 'square') {
        // Draw vertical lines
        for (let x = 0; x <= scaledWidth; x += scaledGridSize) {
          ctx.beginPath();
          ctx.moveTo(x, 0);
          ctx.lineTo(x, scaledHeight);
          ctx.stroke();
        }
        
        // Draw horizontal lines
        for (let y = 0; y <= scaledHeight; y += scaledGridSize) {
          ctx.beginPath();
          ctx.moveTo(0, y);
          ctx.lineTo(scaledWidth, y);
          ctx.stroke();
        }
      } else if (gridType === 'hex') {
        // Draw hex grid (simplified)
        const hexWidth = scaledGridSize * 2;
        const hexHeight = scaledGridSize * Math.sqrt(3);
        
        for (let y = 0; y < scaledHeight; y += hexHeight * 0.75) {
          for (let x = 0; x < scaledWidth; x += hexWidth) {
            const offsetX = (Math.floor(y / (hexHeight * 0.75)) % 2 === 0) ? 0 : hexWidth / 2;
            drawHex(ctx, x + offsetX, y, scaledGridSize);
          }
        }
      }
      
      // Draw border
      ctx.strokeStyle = 'rgba(0, 0, 0, 0.3)';
      ctx.lineWidth = 2;
      ctx.strokeRect(0, 0, scaledWidth, scaledHeight);
    };
    img.src = imageUrl;
  }, [imageUrl, gridSize, gridType, width, height]);
  
  const drawHex = (ctx: CanvasRenderingContext2D, x: number, y: number, size: number) => {
    ctx.beginPath();
    for (let i = 0; i < 6; i++) {
      const angle = (i * Math.PI) / 3;
      const xPos = x + size * Math.cos(angle);
      const yPos = y + size * Math.sin(angle);
      if (i === 0) {
        ctx.moveTo(xPos, yPos);
      } else {
        ctx.lineTo(xPos, yPos);
      }
    }
    ctx.closePath();
    ctx.stroke();
  };
  
  return (
    <Box
      style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#2c2c2c',
        borderRadius: '8px',
        padding: '16px',
        minHeight: '200px'
      }}
    >
      <canvas 
        ref={canvasRef}
        style={{
          maxWidth: '100%',
          height: 'auto',
          borderRadius: '4px'
        }}
      />
    </Box>
  );
};

export const Dashboard: React.FC = () => {
  const [mapModalOpened, setMapModalOpened] = useState(false);
  const [campaignModalOpened, setCampaignModalOpened] = useState(false);
  const [changeMapModalOpened, setChangeMapModalOpened] = useState(false);
  const [characterCreatorOpened, setCharacterCreatorOpened] = useState(false);
  const [selectedMap, setSelectedMap] = useState<Map | null>(null);
  const [newMap, setNewMap] = useState<Partial<Map>>({});
  const [newCampaign, setNewCampaign] = useState<Partial<Campaign>>({});
  const [previewGridSize, setPreviewGridSize] = useState(50);
  const [previewGridType, setPreviewGridType] = useState<'square' | 'hex'>('square');
  const [imageNaturalSize, setImageNaturalSize] = useState<{ width: number; height: number } | null>(null);

  const {
    maps,
    campaigns,
    characters,
    assets,
    playlists,
    currentMap,
    currentCampaign,
    currentPlayer,
    addMap,
    addCampaign,
    setCurrentCampaign,
    deleteMap,
    deleteCampaign,
    deleteCharacter,
    updateCharacter,
    addAsset,
    deactivateMap,
    changeCampaignMap
  } = useMapStore();

  const handleCreateMap = () => {
    if (newMap.name) {
      const map: Map = {
        id: `map_${Date.now()}`,
        name: newMap.name,
        widthPx: newMap.widthPx || 2048,
        heightPx: newMap.heightPx || 1536,
        thumbnail: newMap.thumbnail || '',
        tileSource: newMap.tileSource,
        layers: [
          { id: 'bg', type: 'background', name: 'Background', visible: true, opacity: 1, locked: false, order: 0 },
          { id: 'grid', type: 'grid', name: 'Grid', visible: true, opacity: 0.5, locked: false, order: 1, gridType: previewGridType, gridSize: previewGridSize },
          { id: 'tokens', type: 'tokens', name: 'Tokens', visible: true, opacity: 1, locked: false, order: 2 }
        ],
        createdAt: new Date(),
        updatedAt: new Date()
      };
      addMap(map);
      setNewMap({});
      setImageNaturalSize(null);
      setPreviewGridSize(50);
      setPreviewGridType('square');
      setMapModalOpened(false);
    }
  };

  const handleCreateCampaign = () => {
    if (newCampaign.name && selectedMap) {
      const campaign: Campaign = {
        id: `campaign_${Date.now()}`,
        name: newCampaign.name,
        mapId: selectedMap.id,
        tokens: [],
        active: false,
        description: newCampaign.description,
        sessionNumber: 1,
        createdAt: new Date(),
        updatedAt: new Date(),
        lastPlayedAt: undefined,
        mapTokenHistory: {}
      };
      addCampaign(campaign);
      setNewCampaign({});
      setSelectedMap(null);
      setCampaignModalOpened(false);
    }
  };

  const handleMapUpload = (file: File | null) => {
    if (file) {
      // In a real app, this would upload to a server
      const reader = new FileReader();
      reader.onload = (e) => {
        const thumbnail = e.target?.result as string;
        
        // Load image to get natural dimensions
        const img = document.createElement('img');
        img.onload = () => {
          setImageNaturalSize({ width: img.naturalWidth, height: img.naturalHeight });
          setNewMap(prev => ({ 
            ...prev, 
            thumbnail,
            tileSource: thumbnail,
            widthPx: img.naturalWidth,
            heightPx: img.naturalHeight
          }));
        };
        img.src = thumbnail;
      };
      reader.readAsDataURL(file);
    }
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

  const recentActivity = [
    { id: 1, type: 'map', action: 'created', item: 'Ruined Keep', user: 'GM', time: '2 hours ago' },
    { id: 2, type: 'scene', action: 'started', item: 'Battle Scene', user: 'GM', time: '1 hour ago' },
    { id: 3, type: 'token', action: 'moved', item: 'Goblin A', user: 'Player 1', time: '30 min ago' },
    { id: 4, type: 'audio', action: 'played', item: 'Battle Music', user: 'GM', time: '15 min ago' }
  ];

  return (
    <ScrollArea 
      h="100%" 
      scrollbarSize={8}
      scrollHideDelay={1000}
      style={{ 
        padding: '20px',
        height: 'calc(100vh - 60px)' // Subtract header height
      }}
    >
      <Container size="xl" style={{ paddingTop: '0px', paddingBottom: '20px' }}>
        <Stack gap="xl">
        {/* Header */}
        <Box>
          <Title order={1} mb="xs" style={{ color: '#212529' }}>
            Dashboard
          </Title>
          <Text c="dimmed" size="lg">
            Welcome back, {currentPlayer?.name || 'Game Master'}! Manage your maps, scenes, and campaigns.
          </Text>
        </Box>

        {/* Quick Stats */}
        <Grid>
          <Grid.Col span={3}>
            <Card withBorder>
              <Group justify="space-between">
                <Box>
                  <Text size="sm" c="dimmed">Maps</Text>
                  <Text size="xl" fw={700}>{maps.length}</Text>
                </Box>
                <IconMap size={24} color="blue" />
              </Group>
            </Card>
          </Grid.Col>
          <Grid.Col span={3}>
            <Card withBorder>
              <Group justify="space-between">
                <Box>
                  <Text size="sm" c="dimmed">Campaigns</Text>
                  <Text size="xl" fw={700}>{campaigns.length}</Text>
                </Box>
                <IconUsers size={24} color="green" />
              </Group>
            </Card>
          </Grid.Col>
          <Grid.Col span={3}>
            <Card withBorder>
              <Group justify="space-between">
                <Box>
                  <Text size="sm" c="dimmed">Assets</Text>
                  <Text size="xl" fw={700}>{assets.length}</Text>
                </Box>
                <IconUpload size={24} color="orange" />
              </Group>
            </Card>
          </Grid.Col>
          <Grid.Col span={3}>
            <Card withBorder>
              <Group justify="space-between">
                <Box>
                  <Text size="sm" c="dimmed">Characters</Text>
                  <Text size="xl" fw={700}>{characters.length}</Text>
                </Box>
                <IconUser size={24} color="purple" />
              </Group>
            </Card>
          </Grid.Col>
        </Grid>

        {/* Characters Section */}
        <Card withBorder>
          <Group justify="space-between" mb="md">
            <Title order={3}>Characters</Title>
            <Button
              leftSection={<IconPlus size={16} />}
              onClick={() => setCharacterCreatorOpened(true)}
            >
              New Character
            </Button>
          </Group>

          <ScrollArea.Autosize mah={300}>
            <Stack gap="sm">
              {characters.length === 0 ? (
                <Alert icon={<IconAlertCircle size={16} />} color="purple">
                  No characters yet. Create your first character to begin your adventure!
                </Alert>
              ) : (
                <SimpleGrid cols={2} spacing="sm">
                  {characters.map((character) => (
                    <Card key={character.id} withBorder p="sm">
                      <Group>
                        {character.avatar && (
                          <Image
                            src={character.avatar}
                            width={60}
                            height={60}
                            radius="md"
                            alt={character.name}
                          />
                        )}
                        <Box style={{ flex: 1 }}>
                          <Text fw={500}>{character.name}</Text>
                          <Text size="sm" c="dimmed">
                            Level {character.level} {character.race.charAt(0).toUpperCase() + character.race.slice(1)} {character.class.charAt(0).toUpperCase() + character.class.slice(1)}
                          </Text>
                          <Group gap="xs" mt="xs">
                            <Badge size="xs" color="red">HP {character.currentHp}/{character.maxHp}</Badge>
                            <Badge size="xs" color="blue">AC {character.armorClass}</Badge>
                            <Badge size="xs" color="yellow">{character.startingGold} gp</Badge>
                          </Group>
                        </Box>
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
                            <Menu.Item
                              leftSection={<IconEdit size={14} />}
                            >
                              Edit
                            </Menu.Item>
                            <Menu.Item
                              leftSection={<IconDownload size={14} />}
                            >
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
                    </Card>
                  ))}
                </SimpleGrid>
              )}
            </Stack>
          </ScrollArea.Autosize>
        </Card>

        <Grid>
          {/* Maps Section */}
          <Grid.Col span={8}>
            <Card withBorder>
              <Group justify="space-between" mb="md">
                <Title order={3}>Maps</Title>
                <Button
                  leftSection={<IconPlus size={16} />}
                  onClick={() => setMapModalOpened(true)}
                >
                  New Map
                </Button>
              </Group>

              <ScrollArea.Autosize mah={400}>
                <Stack gap="sm">
                  {maps.length === 0 ? (
                    <Alert icon={<IconAlertCircle size={16} />} color="blue">
                      No maps yet. Create your first map to get started!
                    </Alert>
                  ) : (
                    maps.map((map) => (
                      <Card key={map.id} withBorder p="sm">
                        <Group justify="space-between">
                          <Group>
                            {map.thumbnail && (
                              <Image
                                src={map.thumbnail}
                                width={60}
                                height={45}
                                radius="sm"
                                alt={map.name}
                              />
                            )}
                            <Box>
                              <Text fw={500}>{map.name}</Text>
                              <Text size="sm" c="dimmed">
                                {map.widthPx} × {map.heightPx}px
                              </Text>
                              <Text size="xs" c="dimmed">
                                Created {formatDate(map.createdAt)}
                              </Text>
                            </Box>
                          </Group>
                          
                          <Group>
                            {currentMap?.id === map.id && (
                              <Badge color="green" size="sm">Active</Badge>
                            )}
                            
                            <Menu shadow="md" width={200}>
                              <Menu.Target>
                                <ActionIcon variant="outline">
                                  <IconDots size={16} />
                                </ActionIcon>
                              </Menu.Target>
                              
                              <Menu.Dropdown>
                                <Menu.Item
                                  leftSection={<IconEdit size={14} />}
                                  onClick={() => {
                                    setSelectedMap(map);
                                    setNewMap(map);
                                    setMapModalOpened(true);
                                  }}
                                >
                                  Edit
                                </Menu.Item>
                                <Menu.Item
                                  leftSection={<IconShare size={14} />}
                                  onClick={() => setCampaignModalOpened(true)}
                                >
                                  Create Campaign
                                </Menu.Item>
                                {currentMap?.id === map.id && (
                                  <Menu.Item
                                    leftSection={<IconX size={14} />}
                                    onClick={deactivateMap}
                                  >
                                    Deactivate Map
                                  </Menu.Item>
                                )}
                                <Menu.Divider />
                                <Menu.Item
                                  leftSection={<IconTrash size={14} />}
                                  color="red"
                                  onClick={() => deleteMap(map.id)}
                                >
                                  Delete
                                </Menu.Item>
                              </Menu.Dropdown>
                            </Menu>
                          </Group>
                        </Group>
                      </Card>
                    ))
                  )}
                </Stack>
              </ScrollArea.Autosize>
            </Card>
          </Grid.Col>

          {/* Recent Activity */}
          <Grid.Col span={4}>
            <Card withBorder>
              <Title order={3} mb="md">Recent Activity</Title>
              
              <Timeline active={-1} bulletSize={24} lineWidth={2}>
                {recentActivity.map((activity) => (
                  <Timeline.Item
                    key={activity.id}
                    bullet={
                      activity.type === 'map' ? <IconMap size={12} /> :
                      activity.type === 'scene' ? <IconUsers size={12} /> :
                      activity.type === 'token' ? <IconUser size={12} /> :
                      <IconMusic size={12} />
                    }
                    title={`${activity.action} ${activity.item}`}
                  >
                    <Text c="dimmed" size="sm">
                      by {activity.user}
                    </Text>
                    <Text size="xs" mt={4}>
                      {activity.time}
                    </Text>
                  </Timeline.Item>
                ))}
              </Timeline>
            </Card>
          </Grid.Col>
        </Grid>

        {/* Campaigns Section */}
        <Card withBorder>
          <Group justify="space-between" mb="md">
            <Title order={3}>Campaigns</Title>
            <Button
              leftSection={<IconPlus size={16} />}
              onClick={() => setCampaignModalOpened(true)}
            >
              New Campaign
            </Button>
          </Group>

          <ScrollArea.Autosize mah={300}>
            <Stack gap="sm">
              {campaigns.length === 0 ? (
                <Alert icon={<IconAlertCircle size={16} />} color="blue">
                  No campaigns yet. Create a campaign from an existing map!
                </Alert>
              ) : (
                campaigns.map((campaign) => {
                  const map = maps.find(m => m.id === campaign.mapId);
                  return (
                    <Card key={campaign.id} withBorder p="sm">
                      <Group justify="space-between">
                        <Box>
                          <Text fw={500}>{campaign.name}</Text>
                          <Text size="sm" c="dimmed">
                            Based on: {map?.name || 'Unknown Map'}
                          </Text>
                          <Text size="xs" c="dimmed">
                            {campaign.tokens.length} tokens • Session {campaign.sessionNumber || 1} • Created {formatDate(campaign.createdAt)}
                          </Text>
                        </Box>
                        
                        <Group>
                          {currentCampaign?.id === campaign.id && (
                            <Badge color="green" size="sm">Active</Badge>
                          )}
                          
                          <Menu shadow="md" width={200}>
                            <Menu.Target>
                              <ActionIcon variant="outline">
                                <IconDots size={16} />
                              </ActionIcon>
                            </Menu.Target>
                            
                            <Menu.Dropdown>
                              <Menu.Item
                                leftSection={<IconPlayerPlay size={14} />}
                                onClick={() => setCurrentCampaign(campaign)}
                              >
                                Load Campaign
                              </Menu.Item>
                              {currentCampaign?.id === campaign.id && (
                                <Menu.Item
                                  leftSection={<IconMap size={14} />}
                                  onClick={() => setChangeMapModalOpened(true)}
                                >
                                  Change Map
                                </Menu.Item>
                              )}
                              <Menu.Item
                                leftSection={<IconEdit size={14} />}
                                onClick={() => {
                                  setNewCampaign(campaign);
                                  setCampaignModalOpened(true);
                                }}
                              >
                                Edit
                              </Menu.Item>
                              <Menu.Item
                                leftSection={<IconDownload size={14} />}
                                onClick={() => {
                                  // Export campaign logic
                                }}
                              >
                                Export
                              </Menu.Item>
                              <Menu.Divider />
                              <Menu.Item
                                leftSection={<IconTrash size={14} />}
                                color="red"
                                onClick={() => deleteCampaign(campaign.id)}
                              >
                                Delete
                              </Menu.Item>
                            </Menu.Dropdown>
                          </Menu>
                        </Group>
                      </Group>
                    </Card>
                  );
                })
              )}
            </Stack>
          </ScrollArea.Autosize>
        </Card>
      </Stack>

      {/* Create Map Modal */}
      <Modal
        opened={mapModalOpened}
        onClose={() => {
          setMapModalOpened(false);
          setNewMap({});
          setSelectedMap(null);
          setImageNaturalSize(null);
          setPreviewGridSize(50);
          setPreviewGridType('square');
        }}
        title={selectedMap ? "Edit Map" : "Create New Map"}
        size="lg"
      >
        <Stack gap="md">
          <TextInput
            label="Map Name"
            placeholder="Enter map name"
            value={newMap.name || ''}
            onChange={(e) => setNewMap(prev => ({ ...prev, name: e.target.value }))}
            required
          />
          
          <FileInput
            label="Map Image"
            placeholder="Upload map image"
            accept="image/*"
            onChange={handleMapUpload}
          />
          
          {/* Preview Section */}
          {newMap.thumbnail && imageNaturalSize && (
            <>
              <Box>
                <Group justify="space-between" mb="xs">
                  <Text size="sm" fw={500}>Preview with Grid</Text>
                  <Badge color="blue" size="sm">
                    {imageNaturalSize.width} × {imageNaturalSize.height} px
                  </Badge>
                </Group>
                <MapPreview
                  imageUrl={newMap.thumbnail}
                  gridSize={previewGridSize}
                  gridType={previewGridType}
                  width={imageNaturalSize.width}
                  height={imageNaturalSize.height}
                />
              </Box>
              
              <Grid>
                <Grid.Col span={8}>
                  <NumberInput
                    label="Grid Size (px)"
                    description="Adjust the grid cell size"
                    value={previewGridSize}
                    onChange={(value) => setPreviewGridSize(typeof value === 'number' ? value : 50)}
                    min={10}
                    max={200}
                    step={5}
                  />
                </Grid.Col>
                <Grid.Col span={4}>
                  <Select
                    label="Grid Type"
                    value={previewGridType}
                    onChange={(value) => setPreviewGridType(value as 'square' | 'hex')}
                    data={[
                      { value: 'square', label: 'Square' },
                      { value: 'hex', label: 'Hex' }
                    ]}
                  />
                </Grid.Col>
              </Grid>
            </>
          )}
          
          <Grid>
            <Grid.Col span={6}>
              <NumberInput
                label="Width (px)"
                placeholder="2048"
                value={newMap.widthPx || 2048}
                onChange={(value) => setNewMap(prev => ({ ...prev, widthPx: typeof value === 'number' ? value : 2048 }))}
                min={100}
                max={10000}
                disabled={!!imageNaturalSize}
              />
            </Grid.Col>
            <Grid.Col span={6}>
              <NumberInput
                label="Height (px)"
                placeholder="1536"
                value={newMap.heightPx || 1536}
                onChange={(value) => setNewMap(prev => ({ ...prev, heightPx: typeof value === 'number' ? value : 1536 }))}
                min={100}
                max={10000}
                disabled={!!imageNaturalSize}
              />
            </Grid.Col>
          </Grid>
          
          {imageNaturalSize && (
            <Text size="xs" c="dimmed">
              💡 Tip: Adjust the grid size until it aligns with features on your map. 
              The grid settings will be saved with your map.
            </Text>
          )}
          
          <Group justify="flex-end" mt="md">
            <Button variant="outline" onClick={() => {
              setMapModalOpened(false);
              setNewMap({});
              setSelectedMap(null);
              setImageNaturalSize(null);
              setPreviewGridSize(50);
              setPreviewGridType('square');
            }}>
              Cancel
            </Button>
            <Button onClick={handleCreateMap}>
              {selectedMap ? 'Update Map' : 'Create Map'}
            </Button>
          </Group>
        </Stack>
      </Modal>

      {/* Create Campaign Modal */}
      <Modal
        opened={campaignModalOpened}
        onClose={() => {
          setCampaignModalOpened(false);
          setNewCampaign({});
          setSelectedMap(null);
        }}
        title="Create New Campaign"
        size="md"
      >
        <Stack gap="md">
          <Select
            label="Starting Map"
            placeholder="Select a map"
            data={maps.map(map => ({ value: map.id, label: map.name }))}
            value={selectedMap?.id || ''}
            onChange={(value) => {
              const map = maps.find(m => m.id === value);
              setSelectedMap(map || null);
            }}
            required
          />
          
          <TextInput
            label="Campaign Name"
            placeholder="Enter campaign name"
            value={newCampaign.name || ''}
            onChange={(e) => setNewCampaign(prev => ({ ...prev, name: e.target.value }))}
            required
          />
          
          <Textarea
            label="Description"
            placeholder="Optional campaign description"
            value={newCampaign.description || ''}
            onChange={(e) => setNewCampaign(prev => ({ ...prev, description: e.target.value }))}
            minRows={3}
          />
          
          <Group justify="flex-end" mt="md">
            <Button variant="outline" onClick={() => setCampaignModalOpened(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreateCampaign} disabled={!selectedMap}>
              Create Campaign
            </Button>
          </Group>
        </Stack>
      </Modal>

      {/* Change Map Modal */}
      <Modal
        opened={changeMapModalOpened}
        onClose={() => {
          setChangeMapModalOpened(false);
          setSelectedMap(null);
        }}
        title="Change Campaign Map"
        size="md"
      >
        <Stack gap="md">
          <Alert icon={<IconAlertCircle size={16} />} color="blue">
            Changing the map will save the current tokens for the current map. 
            When you return to this map later, the tokens will be restored.
          </Alert>

          {currentCampaign && currentMap && (
            <Box>
              <Text size="sm" c="dimmed">Current Map:</Text>
              <Card withBorder p="sm" mt="xs">
                <Group>
                  {currentMap.thumbnail && (
                    <Image
                      src={currentMap.thumbnail}
                      width={60}
                      height={45}
                      radius="sm"
                      alt={currentMap.name}
                    />
                  )}
                  <Box>
                    <Text fw={500}>{currentMap.name}</Text>
                    <Text size="sm" c="dimmed">
                      {currentMap.widthPx} × {currentMap.heightPx}px
                    </Text>
                  </Box>
                </Group>
              </Card>
            </Box>
          )}

          <Select
            label="New Map"
            placeholder="Select a new map"
            data={maps
              .filter(m => m.id !== currentMap?.id)
              .map(map => ({ value: map.id, label: map.name }))}
            value={selectedMap?.id || ''}
            onChange={(value) => {
              const map = maps.find(m => m.id === value);
              setSelectedMap(map || null);
            }}
            required
          />

          {selectedMap && (
            <Card withBorder p="sm">
              <Group>
                {selectedMap.thumbnail && (
                  <Image
                    src={selectedMap.thumbnail}
                    width={60}
                    height={45}
                    radius="sm"
                    alt={selectedMap.name}
                  />
                )}
                <Box>
                  <Text fw={500}>{selectedMap.name}</Text>
                  <Text size="sm" c="dimmed">
                    {selectedMap.widthPx} × {selectedMap.heightPx}px
                  </Text>
                  {currentCampaign?.mapTokenHistory?.[selectedMap.id] && (
                    <Badge size="sm" color="green" mt="xs">
                      {currentCampaign.mapTokenHistory[selectedMap.id].length} saved tokens
                    </Badge>
                  )}
                </Box>
              </Group>
            </Card>
          )}
          
          <Group justify="flex-end" mt="md">
            <Button variant="outline" onClick={() => {
              setChangeMapModalOpened(false);
              setSelectedMap(null);
            }}>
              Cancel
            </Button>
            <Button 
              onClick={() => {
                if (selectedMap) {
                  changeCampaignMap(selectedMap.id);
                  setChangeMapModalOpened(false);
                  setSelectedMap(null);
                }
              }} 
              disabled={!selectedMap}
            >
              Change Map
            </Button>
          </Group>
        </Stack>
      </Modal>

      {/* Character Creator Modal */}
      <CharacterCreator
        opened={characterCreatorOpened}
        onClose={() => setCharacterCreatorOpened(false)}
      />
      </Container>
    </ScrollArea>
  );
};
