import React, { useEffect, useRef, useState, useCallback } from 'react';
import * as PIXI from 'pixi.js';
import { Box, Group, ActionIcon, Tooltip, Text, Stack, Divider } from '@mantine/core';
import {
  IconZoomIn,
  IconZoomOut,
  IconMaximize,
  IconRefresh,
  IconPlus
} from '@tabler/icons-react';
import { useMapStore } from '../stores/mapStore';
import { MapCanvasProps } from '../types/models';
import { TokenLayer } from './TokenLayer';
import { TokenCreator } from './TokenCreator';
import { AssetHotbar } from './AssetHotbar';
import { Chat } from './Chat';
import { Asset } from '../types/models';

export const MapCanvas: React.FC<MapCanvasProps> = ({
  map,
  tokens,
  selectedTokens,
  viewport,
  onTokenMove,
  onTokenSelect,
  onViewportChange,
  isGridVisible,
  isSnapToGrid,
  gridSize,
  gridType
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const pixiAppRef = useRef<PIXI.Application | null>(null);
  const backgroundSpriteRef = useRef<PIXI.Sprite | null>(null);
  const gridGraphicsRef = useRef<PIXI.Graphics | null>(null);
  const mapContainerRef = useRef<PIXI.Container | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [tokenCreatorOpened, setTokenCreatorOpened] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [lastViewport, setLastViewport] = useState(viewport);
  const animationFrameRef = useRef<number | null>(null);
  const pendingViewportRef = useRef<typeof viewport | null>(null);
  const lastMouseMoveTime = useRef<number>(0);

  const { resetViewport, updateViewport, isGM, assets, currentCampaign } = useMapStore();

  // Initialize PixiJS application
  useEffect(() => {
    if (!containerRef.current) return;

    const app = new PIXI.Application({
      width: containerRef.current.clientWidth || 800,
      height: containerRef.current.clientHeight || 600,
      backgroundColor: 0x2c2c2c,
      antialias: true,
      resolution: window.devicePixelRatio || 1,
      autoDensity: true
    });

    containerRef.current.appendChild(app.view as HTMLCanvasElement);
    pixiAppRef.current = app;

    // Set up interaction
    app.stage.interactive = true;
    app.stage.hitArea = new PIXI.Rectangle(0, 0, app.screen.width, app.screen.height);

    // Create main map container that will hold all map content
    const mapContainer = new PIXI.Container();
    app.stage.addChild(mapContainer as any);
    mapContainerRef.current = mapContainer;

    // Create background container
    const backgroundContainer = new PIXI.Container();
    mapContainer.addChild(backgroundContainer as any);

    // Create grid container
    const gridContainer = new PIXI.Container();
    mapContainer.addChild(gridContainer as any);

    // Create token container
    const tokenContainer = new PIXI.Container();
    mapContainer.addChild(tokenContainer as any);

    // Handle resize
    const handleResize = () => {
      if (containerRef.current && app) {
        const newWidth = containerRef.current.clientWidth || 800;
        const newHeight = containerRef.current.clientHeight || 600;
        app.renderer.resize(newWidth, newHeight);
        app.stage.hitArea = new PIXI.Rectangle(0, 0, newWidth, newHeight);
      }
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      app.destroy(true);
    };
  }, []);

  // Load map background
  useEffect(() => {
    if (!pixiAppRef.current || !map) {
      return;
    }

    setIsLoading(true);
    setError(null);

    const loadMap = async () => {
      try {
        // If map has a tile source, use it; otherwise use thumbnail
        const imageUrl = map.tileSource || map.thumbnail;
        
        
        if (!imageUrl) {
          throw new Error('No map image available');
        }

        // Create background sprite
        const texture = await PIXI.Assets.load(imageUrl);
        const sprite = new PIXI.Sprite(texture);
        
        // Remove old background
        if (backgroundSpriteRef.current && mapContainerRef.current) {
          mapContainerRef.current.removeChild(backgroundSpriteRef.current as any);
        }
        
        // Add new background to the map container
        if (mapContainerRef.current) {
          mapContainerRef.current.addChildAt(sprite as any, 0);
          backgroundSpriteRef.current = sprite;
        }
        
        // Set sprite properties for visibility
        sprite.alpha = 1.0;
        sprite.visible = true;
        sprite.x = 0;
        sprite.y = 0;
        
        // Test rectangle removed - map positioning fixed
        
        // Update viewport to fit the map properly
        if (map.widthPx && map.heightPx && pixiAppRef.current) {
          const canvasWidth = pixiAppRef.current.screen.width;
          const canvasHeight = pixiAppRef.current.screen.height;
          
          // Calculate scale to fit the map in the canvas
          const scaleX = canvasWidth / map.widthPx;
          const scaleY = canvasHeight / map.heightPx;
          const scale = Math.max(Math.min(scaleX, scaleY), 0.1); // Ensure minimum 10% scale
          
          // Center the map
          const scaledWidth = map.widthPx * scale;
          const scaledHeight = map.heightPx * scale;
          const offsetX = (canvasWidth - scaledWidth) / 2;
          const offsetY = (canvasHeight - scaledHeight) / 2;
          
          const newViewport = {
            x: offsetX,
            y: offsetY,
            zoom: scale,
            rotation: 0
          };
          
          updateViewport({ viewport: newViewport });
        }
        
        setIsLoading(false);
      } catch (err) {
        setError('Failed to load map image');
        setIsLoading(false);
        console.error('Error loading map:', err);
      }
    };

    loadMap();
  }, [map, updateViewport]);

  // Draw grid
  useEffect(() => {
    if (!pixiAppRef.current || !mapContainerRef.current || !isGridVisible || !map) return;

    const graphics = new PIXI.Graphics();
    
    // Remove old grid
    if (gridGraphicsRef.current && mapContainerRef.current) {
      mapContainerRef.current.removeChild(gridGraphicsRef.current as any);
    }

    // Draw grid
    graphics.lineStyle(1, 0x666666, 0.5);
    
    if (gridType === 'square') {
      // Draw square grid
      for (let x = 0; x <= map.widthPx; x += gridSize) {
        graphics.moveTo(x, 0);
        graphics.lineTo(x, map.heightPx);
      }
      
      for (let y = 0; y <= map.heightPx; y += gridSize) {
        graphics.moveTo(0, y);
        graphics.lineTo(map.widthPx, y);
      }
    } else if (gridType === 'hex') {
      // Draw hex grid (simplified)
      const hexWidth = gridSize * 2;
      const hexHeight = gridSize * Math.sqrt(3);
      
      for (let y = 0; y < map.heightPx; y += hexHeight * 0.75) {
        for (let x = 0; x < map.widthPx; x += hexWidth) {
          const offsetX = (y / (hexHeight * 0.75)) % 2 === 0 ? 0 : hexWidth / 2;
          drawHex(graphics, x + offsetX, y, gridSize);
        }
      }
    }
    
    if (mapContainerRef.current) {
      mapContainerRef.current.addChild(graphics as any);
      gridGraphicsRef.current = graphics;
    }
  }, [isGridVisible, gridType, gridSize, map]);

  // Helper function to draw a hex
  const drawHex = (graphics: PIXI.Graphics, x: number, y: number, size: number) => {
    const points = [];
    for (let i = 0; i < 6; i++) {
      const angle = (i * Math.PI) / 3;
      points.push(
        x + size * Math.cos(angle),
        y + size * Math.sin(angle)
      );
    }
    graphics.drawPolygon(points);
  };

  // Update viewport transform
  useEffect(() => {
    if (!pixiAppRef.current || !mapContainerRef.current) return;

    const mapContainer = mapContainerRef.current;
    const { x, y, zoom, rotation } = viewport;

    // Apply transform to the map container
    mapContainer.x = x;
    mapContainer.y = y;
    mapContainer.scale.set(zoom);
    mapContainer.rotation = rotation;
  }, [viewport]);

  // Handle zoom controls
  const handleZoomIn = useCallback(() => {
    const newZoom = Math.min(viewport.zoom * 1.2, 5);
    updateViewport({ viewport: { ...viewport, zoom: newZoom } });
  }, [viewport, updateViewport]);

  const handleZoomOut = useCallback(() => {
    const newZoom = Math.max(viewport.zoom / 1.2, 0.1);
    updateViewport({ viewport: { ...viewport, zoom: newZoom } });
  }, [viewport, updateViewport]);

  const handleResetView = useCallback(() => {
    resetViewport();
  }, [resetViewport]);

  const handleFitToScreen = useCallback(() => {
    if (map && pixiAppRef.current) {
      const canvasWidth = pixiAppRef.current.screen.width;
      const canvasHeight = pixiAppRef.current.screen.height;
      
      // Calculate scale to fit the map in the canvas
      const scaleX = canvasWidth / map.widthPx;
      const scaleY = canvasHeight / map.heightPx;
      const scale = Math.max(Math.min(scaleX, scaleY), 0.1); // Ensure minimum 10% scale
      
      // Center the map
      const scaledWidth = map.widthPx * scale;
      const scaledHeight = map.heightPx * scale;
      const offsetX = (canvasWidth - scaledWidth) / 2;
      const offsetY = (canvasHeight - scaledHeight) / 2;
      
      const newViewport = {
        x: offsetX,
        y: offsetY,
        zoom: scale,
        rotation: 0
      };
      
      updateViewport({ viewport: newViewport });
    }
  }, [map, updateViewport]);

  // Optimized viewport update function using requestAnimationFrame
  const optimizedUpdateViewport = useCallback((newViewport: typeof viewport) => {
    pendingViewportRef.current = newViewport;
    
    if (animationFrameRef.current === null) {
      animationFrameRef.current = requestAnimationFrame(() => {
        if (pendingViewportRef.current) {
          updateViewport({ viewport: pendingViewportRef.current });
          pendingViewportRef.current = null;
        }
        animationFrameRef.current = null;
      });
    }
  }, [updateViewport]);

  // Handle asset drop from hotbar
  const handleAssetDrop = useCallback((asset: Asset, position: { x: number; y: number }) => {
    // The actual token creation is handled in the AssetHotbar component
  }, []);

  // Handle mouse down for dragging
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    // Only start dragging if it's a left click and not on a UI element
    if (e.button === 0 && (!e.target || (e.target as HTMLElement).tagName === 'CANVAS')) {
      setIsDragging(true);
      setDragStart({ x: e.clientX, y: e.clientY });
      setLastViewport(viewport);
      e.preventDefault();
    }
  }, [viewport]);

  // Handle mouse move for dragging
  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!isDragging) return;
    
    // Throttle mouse move events to 60fps
    const now = performance.now();
    if (now - lastMouseMoveTime.current < 16) return; // ~60fps
    lastMouseMoveTime.current = now;
    
    const deltaX = e.clientX - dragStart.x;
    const deltaY = e.clientY - dragStart.y;
    
    const newViewport = {
      ...lastViewport,
      x: lastViewport.x + deltaX,
      y: lastViewport.y + deltaY
    };
    
    optimizedUpdateViewport(newViewport);
  }, [isDragging, dragStart, lastViewport, optimizedUpdateViewport]);

  // Handle mouse up to stop dragging
  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  // Handle wheel for zooming
  const handleWheel = useCallback((e: React.WheelEvent) => {
    e.preventDefault();
    
    const zoomFactor = e.deltaY > 0 ? 0.9 : 1.1;
    const newZoom = Math.max(0.1, Math.min(5, viewport.zoom * zoomFactor));
    
    // Calculate zoom point relative to the canvas
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;
    
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;
    
    // Calculate the world position at the mouse cursor
    const worldX = (mouseX - viewport.x) / viewport.zoom;
    const worldY = (mouseY - viewport.y) / viewport.zoom;
    
    // Adjust viewport to zoom towards the mouse cursor
    const newViewport = {
      x: mouseX - worldX * newZoom,
      y: mouseY - worldY * newZoom,
      zoom: newZoom,
      rotation: viewport.rotation
    };
    
    optimizedUpdateViewport(newViewport);
  }, [viewport, optimizedUpdateViewport]);

  // Add global mouse event listeners for dragging
  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = 'grabbing';
      document.body.style.userSelect = 'none';
    } else {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
      
      // Clean up animation frame
      if (animationFrameRef.current !== null) {
        cancelAnimationFrame(animationFrameRef.current);
        animationFrameRef.current = null;
      }
    };
  }, [isDragging, handleMouseMove, handleMouseUp]);

  // Handle keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.target instanceof HTMLInputElement || event.target instanceof HTMLTextAreaElement) {
        return; // Don't handle shortcuts when typing
      }

      switch (event.key.toLowerCase()) {
        case 'g':
          // Toggle grid - handled by store
          break;
        case 's':
          // Toggle snap to grid - handled by store
          break;
        case 'r':
          handleResetView();
          break;
        case 'f':
          handleFitToScreen();
          break;
        case '+':
        case '=':
          handleZoomIn();
          break;
        case '-':
          handleZoomOut();
          break;
        case 't':
          setTokenCreatorOpened(true);
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleZoomIn, handleZoomOut, handleResetView, handleFitToScreen]);

  if (!currentCampaign) {
    return (
      <Box
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#2c2c2c',
          color: 'white'
        }}
      >
        <Stack align="center" gap="md">
          <Text c="white" size="xl" fw={600}>No Campaign Active</Text>
          <Text c="white" size="lg" ta="center">
            Please select a campaign from the dashboard first.
          </Text>
          <Text c="dimmed" size="sm" ta="center">
            Campaigns contain maps, tokens, and track your adventure progress.
          </Text>
        </Stack>
      </Box>
    );
  }

  if (!map) {
    return (
      <Box
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#2c2c2c',
          color: 'white'
        }}
      >
        <Stack align="center" gap="md">
          <Text c="white" size="xl" fw={600}>Campaign: {currentCampaign.name}</Text>
          <Text c="white" size="lg" ta="center">
            No map associated with this campaign.
          </Text>
          <Text c="dimmed" size="sm" ta="center">
            Please assign a map to this campaign in the dashboard.
          </Text>
        </Stack>
      </Box>
    );
  }

  if (!map.thumbnail && !map.tileSource) {
    return (
      <Box
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#2c2c2c',
          color: 'white'
        }}
      >
        <Text>Map "{map.name}" has no image. Please upload an image for this map.</Text>
      </Box>
    );
  }

  return (
    <Box style={{ 
      position: 'relative', 
      width: '100%', 
      height: '100%',
      minHeight: '100vh',
      margin: 0,
      padding: 0
    }}>
      {/* Canvas Container - Account for chat box on right */}
      <Box
        ref={containerRef}
        onMouseDown={handleMouseDown}
        onWheel={handleWheel}
        onDrop={(e) => {
          e.preventDefault();
          // Handle drop events from the hotbar
          try {
            const assetData = e.dataTransfer.getData('application/json');
            if (assetData) {
              const asset = JSON.parse(assetData) as Asset;
              const canvasRect = containerRef.current?.getBoundingClientRect();
              if (canvasRect) {
                // Get screen coordinates
                const screenX = e.clientX - canvasRect.left;
                const screenY = e.clientY - canvasRect.top;
                
                // Convert screen coordinates to world coordinates
                const worldX = (screenX - viewport.x) / viewport.zoom;
                const worldY = (screenY - viewport.y) / viewport.zoom;
                
                // Apply snap-to-grid if enabled
                let finalX = worldX;
                let finalY = worldY;
                
                if (isSnapToGrid) {
                  const halfGrid = gridSize / 2;
                  finalX = Math.floor(worldX / gridSize) * gridSize + halfGrid;
                  finalY = Math.floor(worldY / gridSize) * gridSize + halfGrid;
                }
                
                // Clamp to map boundaries if map dimensions are available
                if (map) {
                  finalX = Math.max(0, Math.min(finalX, map.widthPx));
                  finalY = Math.max(0, Math.min(finalY, map.heightPx));
                }
                
                // Create token directly from asset data
                const { addToken } = useMapStore.getState();
                const tokenId = `token_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
                
                // Use token data if this is a token asset, otherwise use defaults
                const tokenAssetData = asset.tokenData;
                const newToken = {
                  id: tokenId,
                  name: asset.name,
                  x: finalX,
                  y: finalY,
                  rotation: tokenAssetData?.rotation || 0,
                  size: tokenAssetData?.size || 1,
                  sprite: asset.url,
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
                handleAssetDrop(asset, { x: finalX, y: finalY });
              }
            }
          } catch (error) {
            console.error('Error handling drop:', error);
          }
        }}
        onDragOver={(e) => e.preventDefault()}
        style={{
          width: '100%',
          height: '100%',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          overflow: 'hidden',
          cursor: isDragging ? 'grabbing' : 'grab'
        }}
      />

      {/* Loading Overlay */}
      {isLoading && (
        <Box
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000
          }}
        >
          <Text color="white">Loading map...</Text>
        </Box>
      )}

      {/* Error Overlay */}
      {error && (
        <Box
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.8)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000
          }}
        >
          <Text color="red">{error}</Text>
        </Box>
      )}

      {/* Zoom Controls */}
      <Group
        style={{
          position: 'absolute',
          top: 16,
          right: 16,
          zIndex: 100
        }}
        gap="xs"
      >
        <Tooltip label="Zoom In (+)">
          <ActionIcon
            variant="filled"
            color="dark"
            onClick={handleZoomIn}
          >
            <IconZoomIn size={16} />
          </ActionIcon>
        </Tooltip>

        <Tooltip label="Zoom Out (-)">
          <ActionIcon
            variant="filled"
            color="dark"
            onClick={handleZoomOut}
          >
            <IconZoomOut size={16} />
          </ActionIcon>
        </Tooltip>

        <Tooltip label="Reset View (R)">
          <ActionIcon
            variant="filled"
            color="dark"
            onClick={handleResetView}
          >
            <IconRefresh size={16} />
          </ActionIcon>
        </Tooltip>

        <Tooltip label="Fit to Screen (F)">
          <ActionIcon
            variant="filled"
            color="dark"
            onClick={handleFitToScreen}
          >
            <IconMaximize size={16} />
          </ActionIcon>
        </Tooltip>

        <Tooltip label="Add Token (T)">
          <ActionIcon
            variant="filled"
            color="blue"
            onClick={() => setTokenCreatorOpened(true)}
          >
            <IconPlus size={16} />
          </ActionIcon>
        </Tooltip>
      </Group>

      {/* Navigation Hints - Positioned to avoid chat box */}
      <Box
        style={{
          position: 'absolute',
          bottom: 16,
          left: 16,
          backgroundColor: 'rgba(255, 255, 255, 0.95)',
          padding: '12px 16px',
          borderRadius: '8px',
          color: '#333',
          fontSize: '12px',
          zIndex: 100,
          maxWidth: '280px',
          border: '1px solid rgba(0, 0, 0, 0.1)',
          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.15)'
        }}
      >
        <Stack gap="xs">
          <Text size="sm" fw={600} color="#333">
            🗺️ Map Navigation
          </Text>
          <Text size="xs" color="#333">
            <strong>Drag:</strong> Move around the map
          </Text>
          <Text size="xs" color="#333">
            <strong>Scroll:</strong> Zoom in/out
          </Text>
          <Text size="xs" color="#333">
            <strong>+/-:</strong> Zoom controls
          </Text>
          <Text size="xs" color="#333">
            <strong>F:</strong> Fit to screen
          </Text>
          <Text size="xs" color="#333">
            <strong>R:</strong> Reset view
          </Text>
          <Divider color="rgba(0,0,0,0.2)" />
          <Text size="xs" color="#333">
            Zoom: {(viewport.zoom * 100).toFixed(0)}% | 
            Position: ({Math.round(viewport.x)}, {Math.round(viewport.y)})
          </Text>
        </Stack>
      </Box>

      {/* Token Layer Overlay */}
      <TokenLayer
        tokens={tokens}
        selectedTokens={selectedTokens}
        onTokenMove={onTokenMove}
        onTokenSelect={onTokenSelect}
        isSnapToGrid={isSnapToGrid}
        gridSize={gridSize}
        gridType={gridType}
        viewport={viewport}
        mapWidth={map?.widthPx}
        mapHeight={map?.heightPx}
      />

      {/* Asset Hotbar - Only show when GM mode is enabled */}
      {isGM && (
        <AssetHotbar
          assets={assets}
          onAssetDrop={handleAssetDrop}
        />
      )}

      {/* Token Creator Modal */}
      <TokenCreator
        opened={tokenCreatorOpened}
        onClose={() => setTokenCreatorOpened(false)}
        initialPosition={{ x: 100, y: 100 }}
      />

      {/* Chat Box - Fixed to right side */}
      <Chat isGM={isGM} />
    </Box>
  );
};
