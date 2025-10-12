import React, { useState } from 'react';
import {
  Box,
  ScrollArea,
  Group,
  Image,
  Text,
  Tooltip,
  Badge,
  ActionIcon,
  Stack,
  Divider
} from '@mantine/core';
import { IconDragDrop, IconPlus } from '@tabler/icons-react';
import { Asset } from '../types/models';
import { useMapStore } from '../stores/mapStore';

interface AssetHotbarProps {
  assets: Asset[];
  onAssetDrop: (asset: Asset, position: { x: number; y: number }) => void;
}

export const AssetHotbar: React.FC<AssetHotbarProps> = ({
  assets,
  onAssetDrop
}) => {
  const [draggedAsset, setDraggedAsset] = useState<Asset | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const { addToken } = useMapStore();

  // Filter assets to show only image and token types
  const displayAssets = assets.filter(asset => 
    asset.type === 'image' || asset.type === 'token'
  );

  const handleDragStart = (e: React.DragEvent, asset: Asset) => {
    setDraggedAsset(asset);
    e.dataTransfer.setData('application/json', JSON.stringify(asset));
    e.dataTransfer.effectAllowed = 'copy';
    
    // Create a custom drag image
    const dragImage = document.createElement('img');
    dragImage.src = asset.thumbnail || asset.url;
    dragImage.style.width = '64px';
    dragImage.style.height = '64px';
    dragImage.style.borderRadius = '8px';
    dragImage.style.border = '2px solid #339af0';
    dragImage.style.position = 'absolute';
    dragImage.style.top = '-1000px';
    document.body.appendChild(dragImage);
    e.dataTransfer.setDragImage(dragImage, 32, 32);
    
    // Clean up the drag image after a short delay
    setTimeout(() => {
      if (document.body.contains(dragImage)) {
        document.body.removeChild(dragImage);
      }
    }, 100);
  };

  const handleDragEnd = () => {
    setDraggedAsset(null);
  };

  const handleCanvasDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    
    if (!draggedAsset) return;

    try {
      // Get the canvas position from the event
      const canvasRect = (e.target as HTMLElement).getBoundingClientRect();
      const x = e.clientX - canvasRect.left;
      const y = e.clientY - canvasRect.top;

      // Create a token from the asset
      const tokenId = `token_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      // Use token data if this is a token asset, otherwise use defaults
      const tokenAssetData = draggedAsset.tokenData;
      const newToken = {
        id: tokenId,
        name: draggedAsset.name,
        x: x,
        y: y,
        rotation: tokenAssetData?.rotation || 0,
        size: tokenAssetData?.size || 1,
        sprite: draggedAsset.url,
        hp: tokenAssetData?.hp || {
          current: 100,
          max: 100,
          temporary: 0
        },
        states: tokenAssetData?.states || [],
        ownerId: tokenAssetData?.ownerId || 'gm_1',
        layerId: 'tokens',
        locked: tokenAssetData?.locked || false,
        visible: tokenAssetData?.visible !== false,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      addToken(newToken);
      onAssetDrop(draggedAsset, { x, y });
    } catch (error) {
      console.error('Error creating token from asset:', error);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    // Only set isDragOver to false if we're leaving the canvas area
    const canvasRect = (e.target as HTMLElement).getBoundingClientRect();
    const x = e.clientX;
    const y = e.clientY;
    
    if (x < canvasRect.left || x > canvasRect.right || 
        y < canvasRect.top || y > canvasRect.bottom) {
      setIsDragOver(false);
    }
  };

  return (
    <Box
      style={{
        position: 'absolute',
        top: 0,
        right: 0,
        width: '280px',
        height: '100%',
        backgroundColor: 'rgba(0, 0, 0, 0.9)',
        borderLeft: '2px solid #339af0',
        zIndex: 200,
        display: 'flex',
        flexDirection: 'column'
      }}
    >
      {/* Header */}
      <Box
        style={{
          padding: '12px 16px',
          borderBottom: '1px solid #444',
          backgroundColor: 'rgba(51, 154, 240, 0.1)'
        }}
      >
        <Group justify="space-between" align="center">
          <Text size="sm" fw={600} c="white">
            Asset Hotbar
          </Text>
          <Badge size="xs" variant="light" color="blue">
            {displayAssets.length} assets
          </Badge>
        </Group>
        <Text size="xs" c="dimmed" mt={4}>
          Drag assets to the map to create tokens
        </Text>
      </Box>

      {/* Assets List */}
      <ScrollArea style={{ flex: 1, padding: '8px' }}>
        <Stack gap="xs">
          {displayAssets.length === 0 ? (
            <Box
              style={{
                padding: '32px 16px',
                textAlign: 'center',
                color: '#888'
              }}
            >
              <IconPlus size={24} style={{ marginBottom: '8px', opacity: 0.5 }} />
              <Text size="sm" c="dimmed">
                No assets available
              </Text>
              <Text size="xs" c="dimmed" mt={4}>
                Upload assets in the Assets panel
              </Text>
            </Box>
          ) : (
            displayAssets.map((asset) => (
              <Tooltip
                key={asset.id}
                label={`${asset.name} (${asset.type})`}
                position="left"
                withArrow
              >
                <Box
                  draggable
                  onDragStart={(e) => handleDragStart(e, asset)}
                  onDragEnd={handleDragEnd}
                  style={{
                    padding: '8px',
                    borderRadius: '8px',
                    backgroundColor: draggedAsset?.id === asset.id 
                      ? 'rgba(51, 154, 240, 0.2)' 
                      : 'rgba(255, 255, 255, 0.05)',
                    border: draggedAsset?.id === asset.id 
                      ? '2px solid #339af0' 
                      : '1px solid transparent',
                    cursor: 'grab',
                    transition: 'all 0.2s ease',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px'
                  }}
                  onMouseEnter={(e) => {
                    if (draggedAsset?.id !== asset.id) {
                      e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.1)';
                      e.currentTarget.style.borderColor = '#555';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (draggedAsset?.id !== asset.id) {
                      e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.05)';
                      e.currentTarget.style.borderColor = 'transparent';
                    }
                  }}
                >
                  <Image
                    src={asset.thumbnail || asset.url}
                    alt={asset.name}
                    width={48}
                    height={48}
                    radius="sm"
                    style={{
                      flexShrink: 0,
                      border: '1px solid #444'
                    }}
                  />
                  <Box style={{ flex: 1, minWidth: 0 }}>
                    <Text size="sm" c="white" truncate>
                      {asset.name}
                    </Text>
                    <Group gap="xs" mt={2}>
                      <Badge size="xs" variant="light" color="blue">
                        {asset.type}
                      </Badge>
                      <IconDragDrop size={12} color="#888" />
                    </Group>
                  </Box>
                </Box>
              </Tooltip>
            ))
          )}
        </Stack>
      </ScrollArea>

      {/* Drop Zone Overlay for Canvas */}
      {isDragOver && (
        <Box
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(51, 154, 240, 0.1)',
            border: '3px dashed #339af0',
            zIndex: 1000,
            pointerEvents: 'none',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          <Box
            style={{
              backgroundColor: 'rgba(0, 0, 0, 0.8)',
              padding: '16px 24px',
              borderRadius: '8px',
              border: '2px solid #339af0'
            }}
          >
            <Group gap="xs" align="center">
              <IconDragDrop size={24} color="#339af0" />
              <Text size="lg" c="white" fw={600}>
                Drop to create token
              </Text>
            </Group>
          </Box>
        </Box>
      )}
    </Box>
  );
};
