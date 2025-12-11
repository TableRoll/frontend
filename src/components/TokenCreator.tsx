import React, { useState, useRef, useEffect } from 'react';
import {
  Modal,
  Stack,
  TextInput,
  NumberInput,
  Select,
  Button,
  Group,
  Text,
  Switch,
  FileInput,
  Box,
  Divider,
  Alert,
  Slider,
  Grid,
  Paper,
  Center
} from '@mantine/core';
import { IconPlus, IconAlertCircle, IconZoomIn, IconZoomOut } from '@tabler/icons-react';
import { useMapStore } from '../stores/mapStoreWithAPI';
import { createNewToken } from '../utils/tokenUtils';
import { Token, Asset } from '../types/models';

interface TokenPreviewProps {
  imageUrl: string;
  size: number;
  rotation: number;
  imageScale: number;
  imageOffsetX: number;
  imageOffsetY: number;
  hp: { current: number; max: number };
}

const TokenPreview: React.FC<TokenPreviewProps> = ({ 
  imageUrl, 
  size, 
  rotation, 
  imageScale, 
  imageOffsetX, 
  imageOffsetY,
  hp 
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !imageUrl) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    const tokenSize = 120 * size; // Preview size
    canvas.width = tokenSize + 20; // Add padding for border
    canvas.height = tokenSize + 30; // Add padding for HP bar
    
    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Load and draw image
    const img = document.createElement('img');
    img.onload = () => {
      ctx.save();
      
      // Center point for the token
      const centerX = canvas.width / 2;
      const centerY = (canvas.height - 15) / 2; // Account for HP bar
      
      // Apply rotation
      ctx.translate(centerX, centerY);
      ctx.rotate((rotation * Math.PI) / 180);
      ctx.translate(-centerX, -centerY);
      
      // Create circular clip
      ctx.beginPath();
      ctx.arc(centerX, centerY, tokenSize / 2, 0, Math.PI * 2);
      ctx.clip();
      
      // Draw image with adjustments
      const imgWidth = img.width * imageScale;
      const imgHeight = img.height * imageScale;
      const imgX = centerX - imgWidth / 2 + imageOffsetX;
      const imgY = centerY - imgHeight / 2 + imageOffsetY;
      
      ctx.drawImage(img, imgX, imgY, imgWidth, imgHeight);
      
      ctx.restore();
      
      // Draw border
      ctx.beginPath();
      ctx.arc(centerX, centerY, tokenSize / 2, 0, Math.PI * 2);
      ctx.strokeStyle = '#495057';
      ctx.lineWidth = 3;
      ctx.stroke();
      
      // Draw HP bar
      const hpBarWidth = tokenSize;
      const hpBarHeight = 6;
      const hpBarX = (canvas.width - hpBarWidth) / 2;
      const hpBarY = canvas.height - hpBarHeight - 5;
      
      // HP bar background
      ctx.fillStyle = '#495057';
      ctx.fillRect(hpBarX, hpBarY, hpBarWidth, hpBarHeight);
      
      // HP bar fill
      const hpPercent = hp.current / hp.max;
      const hpColor = hpPercent > 0.5 ? '#51cf66' : hpPercent > 0.25 ? '#ffd43b' : '#fa5252';
      ctx.fillStyle = hpColor;
      ctx.fillRect(hpBarX, hpBarY, hpBarWidth * hpPercent, hpBarHeight);
      
      // HP bar border
      ctx.strokeStyle = '#212529';
      ctx.lineWidth = 1;
      ctx.strokeRect(hpBarX, hpBarY, hpBarWidth, hpBarHeight);
    };
    img.src = imageUrl;
  }, [imageUrl, size, rotation, imageScale, imageOffsetX, imageOffsetY, hp]);
  
  return (
    <Center>
      <canvas 
        ref={canvasRef}
        style={{
          backgroundColor: '#f8f9fa',
          borderRadius: '8px',
          padding: '10px'
        }}
      />
    </Center>
  );
};

interface TokenCreatorProps {
  opened: boolean;
  onClose: () => void;
  initialPosition?: { x: number; y: number };
  fromAsset?: Asset;
}

export const TokenCreator: React.FC<TokenCreatorProps> = ({
  opened,
  onClose,
  initialPosition = { x: 0, y: 0 },
  fromAsset
}) => {
  const { addToken, currentPlayer, players, uploadAsset, currentCampaign } = useMapStore();
  
  const [tokenData, setTokenData] = useState<Partial<Token>>({
    name: fromAsset?.name || 'New Token',
    x: initialPosition.x,
    y: initialPosition.y,
    size: 1,
    rotation: 0,
    hp: {
      current: 10,
      max: 10,
      temporary: 0
    },
    ownerId: currentPlayer?.id || 'gm',
    layerId: 'tokens',
    locked: false,
    visible: true,
    states: []
  });

  const [spriteFile, setSpriteFile] = useState<File | null>(null);
  const [spritePreview, setSpritePreview] = useState<string>(fromAsset?.url || '');
  
  // Image adjustment controls
  const [imageScale, setImageScale] = useState(1);
  const [imageOffsetX, setImageOffsetX] = useState(0);
  const [imageOffsetY, setImageOffsetY] = useState(0);

  // Handle file upload for token sprite
  const handleSpriteUpload = async (file: File | null) => {
    if (file) {
      try {
        setSpriteFile(file);
        // Upload file to assets via store to persist and get URL
        await uploadAsset(file, {
          name: file.name,
          assetType: 'token',
          campaignId: currentCampaign?.id,
          isPublic: false
        });
        // After upload, the store will have the new asset at the end
        const latestAsset = useMapStore.getState().assets.slice(-1)[0];
        if (latestAsset?.url) {
          setSpritePreview(latestAsset.url);
        }
      } catch (e) {
        console.error('Failed to upload token image asset', e);
      }
    }
  };

  // Handle form submission
  const handleCreateToken = () => {
    if (!tokenData.name) {
      return;
    }

    const newToken = createNewToken({
      ...tokenData,
      sprite: spritePreview || fromAsset?.url || '',
      hp: tokenData.hp || { current: 10, max: 10, temporary: 0 },
      imageScale,
      imageOffsetX,
      imageOffsetY
    });

    addToken(newToken);
    onClose();
    
    // Reset form
    setTokenData({
      name: 'New Token',
      x: 0,
      y: 0,
      size: 1,
      rotation: 0,
      hp: { current: 10, max: 10, temporary: 0 },
      ownerId: currentPlayer?.id || 'gm',
      layerId: 'tokens',
      locked: false,
      visible: true,
      states: []
    });
    setSpriteFile(null);
    setSpritePreview('');
    setImageScale(1);
    setImageOffsetX(0);
    setImageOffsetY(0);
  };

  // Player options for owner selection
  const playerOptions = [
    { value: 'gm', label: 'Game Master' },
    ...players.map(player => ({
      value: player.id,
      label: player.name
    }))
  ];

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title="Create New Token"
      size="lg"
    >
      <Stack gap="md">
        <Grid>
          {/* Left Column - Token Settings */}
          <Grid.Col span={6}>
            <Stack gap="md">
              {/* Basic Information */}
              <Text size="sm" fw={500}>Basic Information</Text>
              
              <TextInput
                label="Token Name"
                placeholder="Enter token name"
                value={tokenData.name || ''}
                onChange={(e) => setTokenData(prev => ({ ...prev, name: e.target.value }))}
                required
              />

              <Group grow>
                <NumberInput
                  label="Size"
                  value={tokenData.size || 1}
                  onChange={(value) => setTokenData(prev => ({ ...prev, size: typeof value === 'number' ? value : 1 }))}
                  min={0.1}
                  max={5}
                  step={0.1}
                />
                <NumberInput
                  label="Rotation (°)"
                  value={tokenData.rotation || 0}
                  onChange={(value) => setTokenData(prev => ({ ...prev, rotation: typeof value === 'number' ? value : 0 }))}
                  min={0}
                  max={360}
                />
              </Group>

              <Select
                label="Owner"
                data={playerOptions}
                value={tokenData.ownerId || 'gm'}
                onChange={(value) => setTokenData(prev => ({ ...prev, ownerId: value || 'gm' }))}
              />

              <Divider />

              {/* Health Points */}
              <Text size="sm" fw={500}>Health Points</Text>
              
              <Group grow>
                <NumberInput
                  label="Current HP"
                  value={tokenData.hp?.current || 10}
                  onChange={(value) => setTokenData(prev => ({
                    ...prev,
                    hp: { ...prev.hp!, current: typeof value === 'number' ? value : 10 }
                  }))}
                  min={0}
                />
                <NumberInput
                  label="Max HP"
                  value={tokenData.hp?.max || 10}
                  onChange={(value) => setTokenData(prev => ({
                    ...prev,
                    hp: { ...prev.hp!, max: typeof value === 'number' ? value : 10 }
                  }))}
                  min={1}
                />
              </Group>

              {/* Token Properties */}
              <Group>
                <Switch
                  label="Locked"
                  checked={tokenData.locked || false}
                  onChange={(e) => setTokenData(prev => ({ ...prev, locked: e.currentTarget.checked }))}
                />
                <Switch
                  label="Visible"
                  checked={tokenData.visible !== false}
                  onChange={(e) => setTokenData(prev => ({ ...prev, visible: e.currentTarget.checked }))}
                />
              </Group>
            </Stack>
          </Grid.Col>

          {/* Right Column - Image Upload */}
          <Grid.Col span={6}>
            <Stack gap="md">
              <Text size="sm" fw={500}>Token Image</Text>
              {fromAsset && (
                <Alert icon={<IconAlertCircle size={16} />} color="blue">
                  <Text size="xs">Creating from: {fromAsset.name}</Text>
                </Alert>
              )}
              <FileInput
                label="Upload Image"
                placeholder="Choose an image"
                accept="image/*"
                value={spriteFile}
                onChange={handleSpriteUpload}
                size="sm"
              />
            </Stack>
          </Grid.Col>
        </Grid>

        {/* Action Buttons */}
        <Group justify="flex-end" mt="md">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button 
            onClick={handleCreateToken}
            disabled={!tokenData.name || !spritePreview}
            leftSection={<IconPlus size={16} />}
          >
            Create Token
          </Button>
        </Group>

        {/* Image Preview & Adjustments moved to end */}
        {spritePreview && (
          <Stack gap="md" mt="md">
            <Paper withBorder p="md" style={{ backgroundColor: '#2c2c2c' }}>
              <Text size="sm" fw={500} c="white" mb="md" ta="center">
                Token Preview
              </Text>
              <TokenPreview
                imageUrl={spritePreview}
                size={tokenData.size || 1}
                rotation={tokenData.rotation || 0}
                imageScale={imageScale}
                imageOffsetX={imageOffsetX}
                imageOffsetY={imageOffsetY}
                hp={tokenData.hp || { current: 10, max: 10 }}
              />
            </Paper>

            <Divider label="Image Adjustments" />

            <Box>
              <Group justify="space-between" mb="xs">
                <Text size="sm">Image Zoom</Text>
                <Group gap="xs">
                  <IconZoomOut size={14} />
                  <Text size="xs" c="dimmed">{(imageScale * 100).toFixed(0)}%</Text>
                  <IconZoomIn size={14} />
                </Group>
              </Group>
              <Slider
                value={imageScale}
                onChange={setImageScale}
                min={0.5}
                max={3}
                step={0.1}
                marks={[
                  { value: 0.5, label: '50%' },
                  { value: 1, label: '100%' },
                  { value: 2, label: '200%' },
                  { value: 3, label: '300%' }
                ]}
              />
            </Box>

            <Box>
              <Text size="sm" mb="xs">Horizontal Position</Text>
              <Slider
                value={imageOffsetX}
                onChange={setImageOffsetX}
                min={-100}
                max={100}
                step={1}
                marks={[
                  { value: -100, label: '←' },
                  { value: 0, label: 'Center' },
                  { value: 100, label: '→' }
                ]}
              />
            </Box>

            <Box>
              <Text size="sm" mb="xs">Vertical Position</Text>
              <Slider
                value={imageOffsetY}
                onChange={setImageOffsetY}
                min={-100}
                max={100}
                step={1}
                marks={[
                  { value: -100, label: '↑' },
                  { value: 0, label: 'Center' },
                  { value: 100, label: '↓' }
                ]}
              />
            </Box>

            <Button
              size="xs"
              variant="light"
              fullWidth
              onClick={() => {
                setImageScale(1);
                setImageOffsetX(0);
                setImageOffsetY(0);
              }}
            >
              Reset Image Position
            </Button>
          </Stack>
        )}
      </Stack>
    </Modal>
  );
};
