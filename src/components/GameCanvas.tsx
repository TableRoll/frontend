import React, { useEffect, useRef, useState } from 'react';
import { Box, Text, Stack } from '@mantine/core';
import { useMapStore } from '../stores/mapStoreWithAPI';

export const GameCanvas: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { currentMap } = useMapStore();

  useEffect(() => {
    if (!canvasRef.current || !currentMap) {
      return;
    }

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) {
      setError('Failed to get canvas context');
      return;
    }

    setIsLoading(true);
    setError(null);

    const imageUrl = currentMap.tileSource || currentMap.thumbnail;
    if (!imageUrl) {
      setError('No map image available');
      setIsLoading(false);
      return;
    }

    console.log('🎮 GameCanvas: Loading map image:', {
      mapName: currentMap.name,
      imageUrl: imageUrl.substring(0, 100) + '...',
      canvasWidth: canvas.width,
      canvasHeight: canvas.height
    });

    const img = new Image();
    img.crossOrigin = 'anonymous';

    img.onload = () => {
      console.log('✅ GameCanvas: Image loaded successfully', {
        naturalWidth: img.naturalWidth,
        naturalHeight: img.naturalHeight,
        canvasWidth: canvas.width,
        canvasHeight: canvas.height
      });

      // Set canvas size to match image
      canvas.width = img.naturalWidth;
      canvas.height = img.naturalHeight;

      // Draw the image
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0);

      console.log('✅ GameCanvas: Image drawn to canvas');
      setIsLoading(false);
    };

    img.onerror = (error) => {
      console.error('❌ GameCanvas: Failed to load image:', {
        error,
        url: imageUrl,
        urlLength: imageUrl.length,
        hasToken: imageUrl.includes('token=')
      });
      setError(`Failed to load map image: ${imageUrl.substring(0, 50)}...`);
      setIsLoading(false);
    };

    img.src = imageUrl;
  }, [currentMap]);

  if (!currentMap) {
    return (
      <Box p="xl" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
        <Text c="dimmed">No map selected. Please select a map from the dashboard.</Text>
      </Box>
    );
  }

  return (
    <Box style={{ width: '100%', height: '100%', position: 'relative', overflow: 'auto' }}>
      {isLoading && (
        <Box
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            zIndex: 10
          }}
        >
          <Text c="white">Loading map...</Text>
        </Box>
      )}
      {error && (
        <Box p="xl">
          <Text c="red">{error}</Text>
        </Box>
      )}
      <Stack gap="xs" p="md">
        <Text fw={600}>Map: {currentMap.name}</Text>
        <canvas
          ref={canvasRef}
          style={{
            border: '1px solid #ccc',
            backgroundColor: '#2c2c2c',
            display: 'block',
            maxWidth: '100%',
            height: 'auto'
          }}
        />
      </Stack>
    </Box>
  );
};


