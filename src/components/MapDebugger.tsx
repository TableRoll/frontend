import React, { useState, useRef, useCallback } from 'react';
import { Box, Text, Button, Stack, Card } from '@mantine/core';
import { useMapStore } from '../stores/mapStore';
import * as PIXI from 'pixi.js';

export const MapDebugger: React.FC = () => {
  const { currentMap, maps, setCurrentMap } = useMapStore();
  
  // Drag state
  const [isDragging, setIsDragging] = useState(false);
  const [position, setPosition] = useState({ x: 20, y: 100 });
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const cardRef = useRef<HTMLDivElement>(null);

  // Drag handlers
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (!cardRef.current) return;
    
    const rect = cardRef.current.getBoundingClientRect();
    setDragOffset({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    });
    setIsDragging(true);
  }, []);

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!isDragging) return;
    
    const newX = e.clientX - dragOffset.x;
    const newY = e.clientY - dragOffset.y;
    
    // Keep within viewport bounds
    const maxX = window.innerWidth - 300; // Card width
    const maxY = window.innerHeight - 200; // Approximate card height
    
    setPosition({
      x: Math.max(0, Math.min(newX, maxX)),
      y: Math.max(0, Math.min(newY, maxY))
    });
  }, [isDragging, dragOffset]);

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  // Add/remove global mouse event listeners
  React.useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      document.body.style.userSelect = 'none'; // Prevent text selection while dragging
    } else {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      document.body.style.userSelect = '';
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      document.body.style.userSelect = '';
    };
  }, [isDragging, handleMouseMove, handleMouseUp]);

  const testMapLoad = () => {
    if (maps.length > 0) {
      console.log('Test loading first map:', maps[0]);
      setCurrentMap(maps[0]);
    }
  };

  const testImageLoad = async () => {
    if (currentMap?.thumbnail) {
      try {
        console.log('Testing image load for:', currentMap.thumbnail);
        const img = new Image();
        img.crossOrigin = 'anonymous';
        img.onload = () => {
          console.log('Image loaded successfully:', {
            width: img.width,
            height: img.height,
            naturalWidth: img.naturalWidth,
            naturalHeight: img.naturalHeight,
            complete: img.complete
          });
        };
        img.onerror = (e) => console.error('Image failed to load:', e);
        img.src = currentMap.thumbnail;
      } catch (error) {
        console.error('Error testing image load:', error);
      }
    }
  };

  const testPixiJS = () => {
    console.log('Testing PixiJS availability:', {
      PIXI: typeof PIXI !== 'undefined',
      Application: typeof PIXI?.Application !== 'undefined',
      Assets: typeof PIXI?.Assets !== 'undefined',
      Graphics: typeof PIXI?.Graphics !== 'undefined'
    });
  };

  const fixMapScale = () => {
    if (currentMap) {
      console.log('Forcing map scale fix...');
      // Force a reasonable scale
      const { updateViewport } = useMapStore.getState();
      updateViewport({
        viewport: {
          x: 0,
          y: 0,
          zoom: 0.5, // 50% scale
          rotation: 0
        }
      });
    }
  };

  return (
    <Card 
      ref={cardRef}
      withBorder 
      p="md" 
      style={{ 
        position: 'fixed', 
        left: position.x, 
        top: position.y, 
        zIndex: 1000, 
        maxWidth: 300,
        cursor: isDragging ? 'grabbing' : 'grab',
        userSelect: 'none'
      }}
      onMouseDown={handleMouseDown}
    >
      <Stack gap="sm">
        <Text 
          size="sm" 
          fw={500}
          style={{ 
            cursor: 'grab',
            padding: '4px 8px',
            backgroundColor: isDragging ? 'rgba(51, 154, 240, 0.1)' : 'transparent',
            borderRadius: '4px',
            border: isDragging ? '1px dashed #339af0' : '1px solid transparent'
          }}
        >
          🔧 Map Debugger {isDragging && '(Dragging...)'}
        </Text>
        
        <Box>
          <Text size="xs" c="dimmed">Current Map:</Text>
          <Text size="sm">{currentMap?.name || 'None'}</Text>
        </Box>
        
        <Box>
          <Text size="xs" c="dimmed">Available Maps:</Text>
          <Text size="sm">{maps.length}</Text>
        </Box>
        
        {currentMap && (
          <Box>
            <Text size="xs" c="dimmed">Map Details:</Text>
            <Text size="xs">ID: {currentMap.id}</Text>
            <Text size="xs">Size: {currentMap.widthPx} × {currentMap.heightPx}</Text>
            <Text size="xs">Thumbnail: {currentMap.thumbnail ? 'Yes' : 'No'}</Text>
            <Text size="xs">Tile Source: {currentMap.tileSource ? 'Yes' : 'No'}</Text>
          </Box>
        )}
        
        <Button size="xs" onClick={testMapLoad}>
          Load First Map
        </Button>
        
        <Button size="xs" onClick={testImageLoad} disabled={!currentMap}>
          Test Image Load
        </Button>
        
        <Button size="xs" onClick={testPixiJS}>
          Test PixiJS
        </Button>
        
        <Button size="xs" onClick={fixMapScale} disabled={!currentMap}>
          Fix Map Scale
        </Button>
      </Stack>
    </Card>
  );
};
