import React, { useCallback, useState, useRef, useEffect } from 'react';
import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  PointerSensor,
  useSensor,
  useSensors,
  closestCenter,
  rectIntersection,
  DragOverEvent,
  useDraggable
} from '@dnd-kit/core';
import {
  SortableContext,
  verticalListSortingStrategy,
  arrayMove
} from '@dnd-kit/sortable';
import {
  Box,
  Group,
  Text,
  ActionIcon,
  Menu,
  Modal,
  TextInput,
  NumberInput,
  Switch,
  ColorInput,
  Button,
  Badge,
  Tooltip,
  Card,
  Stack
} from '@mantine/core';
import {
  IconGripVertical,
  IconEdit,
  IconTrash,
  IconCopy,
  IconLock,
  IconLockOpen,
  IconEye,
  IconEyeOff,
  IconHeart,
  IconShield,
  IconSword,
  IconDots
} from '@tabler/icons-react';
import { TokenLayerProps, Token, TokenMoveEvent, TokenSelectEvent, Point2D } from '../types/models';
import { useMapStore } from '../stores/mapStore';

interface TokenComponentProps {
  token: Token;
  isSelected: boolean;
  isDragging: boolean;
  onSelect: (tokenId: string, multiSelect: boolean) => void;
  onEdit: (token: Token) => void;
  onDelete: (tokenId: string) => void;
  onToggleLock: (tokenId: string) => void;
  onToggleVisibility: (tokenId: string) => void;
  onDuplicate: (token: Token) => void;
  viewport: any;
  isSnapToGrid: boolean;
  gridSize: number;
  gridType: string;
  mapWidth?: number;
  mapHeight?: number;
}

const TokenComponent: React.FC<TokenComponentProps> = ({
  token,
  isSelected,
  isDragging,
  onSelect,
  onEdit,
  onDelete,
  onToggleLock,
  onToggleVisibility,
  onDuplicate,
  viewport,
  isSnapToGrid,
  gridSize,
  gridType,
  mapWidth,
  mapHeight
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const [contextMenuOpen, setContextMenuOpen] = useState(false);
  const [contextMenuPosition, setContextMenuPosition] = useState<Point2D>({ x: 0, y: 0 });

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    isDragging: isDndDragging
  } = useDraggable({
    id: token.id,
    disabled: token.locked
  });

  // Convert world coordinates to screen coordinates
  const worldToScreen = useCallback((worldX: number, worldY: number) => {
    return {
      x: worldX * viewport.zoom + viewport.x,
      y: worldY * viewport.zoom + viewport.y
    };
  }, [viewport]);

  // Clamp position to map boundaries
  const clampToMap = useCallback((x: number, y: number) => {
    if (!mapWidth || !mapHeight) return { x, y };
    
    // Clamp position to stay within map bounds
    const clampedX = Math.max(0, Math.min(x, mapWidth));
    const clampedY = Math.max(0, Math.min(y, mapHeight));
    
    return { x: clampedX, y: clampedY };
  }, [mapWidth, mapHeight]);

  // Snap to grid if enabled (snap to center of grid squares)
  const snapToGrid = useCallback((x: number, y: number) => {
    // First clamp to map boundaries
    const clamped = clampToMap(x, y);
    
    if (!isSnapToGrid) return clamped;
    
    // Snap to the center of the grid square
    const halfGrid = gridSize / 2;
    const snappedX = Math.floor(clamped.x / gridSize) * gridSize + halfGrid;
    const snappedY = Math.floor(clamped.y / gridSize) * gridSize + halfGrid;
    
    // Clamp again after snapping to ensure we don't snap outside bounds
    return clampToMap(snappedX, snappedY);
  }, [isSnapToGrid, gridSize, clampToMap]);

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onSelect(token.id, e.ctrlKey || e.metaKey);
  };

  const handleRightClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setContextMenuPosition({ x: e.clientX, y: e.clientY });
    setContextMenuOpen(true);
  };

  const handleDoubleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onEdit(token);
  };

  const screenPos = worldToScreen(token.x, token.y);
  const tokenSize = 40 * viewport.zoom * token.size;

  const style = {
    position: 'absolute' as const,
    left: screenPos.x - tokenSize / 2,
    top: screenPos.y - tokenSize / 2,
    width: tokenSize,
    height: tokenSize,
    cursor: token.locked ? 'not-allowed' : 'move',
    opacity: token.visible ? (isDragging || isDndDragging ? 0.3 : 1) : 0.5,
    zIndex: isSelected ? 1000 : 1,
    transform: `rotate(${token.rotation}deg)`,
    transition: 'none' // Removed transition to prevent jump-back animation
  };

  return (
    <>
      <Box
        ref={setNodeRef}
        style={style}
        {...listeners}
        {...attributes}
        onClick={handleClick}
        onDoubleClick={handleDoubleClick}
        onContextMenu={handleRightClick}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {/* Token Image/Icon */}
        <Box
          style={{
            width: '100%',
            height: '100%',
            borderRadius: '50%',
            border: isSelected ? '3px solid #4dabf7' : '2px solid #495057',
            backgroundColor: '#868e96',
            backgroundImage: token.sprite ? `url(${token.sprite})` : 'none',
            backgroundSize: token.imageScale ? `${token.imageScale * 100}%` : 'cover',
            backgroundPosition: (token.imageOffsetX !== undefined && token.imageOffsetX !== 0) || (token.imageOffsetY !== undefined && token.imageOffsetY !== 0)
              ? `calc(50% + ${token.imageOffsetX || 0}px) calc(50% + ${token.imageOffsetY || 0}px)` 
              : 'center',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            position: 'relative',
            boxShadow: isHovered || isSelected ? '0 4px 12px rgba(0, 0, 0, 0.3)' : '0 2px 4px rgba(0, 0, 0, 0.2)',
            overflow: 'hidden'
          }}
        >
          {!token.sprite && (
            <Text size="xs" color="white" fw={500}>
              {token.name.charAt(0).toUpperCase()}
            </Text>
          )}
          
          {/* Status Indicators */}
          {token.states.length > 0 && (
            <Box
              style={{
                position: 'absolute',
                top: -8,
                right: -8,
                backgroundColor: '#fa5252',
                borderRadius: '50%',
                width: 16,
                height: 16,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <Text size="xs" color="white" fw={700}>
                {token.states.length}
              </Text>
            </Box>
          )}
          
          {/* HP Bar */}
          {token.hp && (
            <Box
              style={{
                position: 'absolute',
                bottom: -6,
                left: -2,
                right: -2,
                height: 4,
                backgroundColor: '#495057',
                borderRadius: 2,
                overflow: 'hidden'
              }}
            >
              <Box
                style={{
                  width: `${(token.hp.current / token.hp.max) * 100}%`,
                  height: '100%',
                  backgroundColor: token.hp.current > token.hp.max * 0.5 ? '#51cf66' : 
                                  token.hp.current > token.hp.max * 0.25 ? '#ffd43b' : '#fa5252',
                  transition: 'width 0.3s ease'
                }}
              />
            </Box>
          )}
          
          {/* Lock Icon */}
          {token.locked && (
            <Box
              style={{
                position: 'absolute',
                top: -4,
                left: -4,
                backgroundColor: '#495057',
                borderRadius: '50%',
                width: 16,
                height: 16,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <IconLock size={8} color="white" />
            </Box>
          )}
        </Box>
        
        {/* Token Name */}
        {(isHovered || isSelected) && (
          <Box
            style={{
              position: 'absolute',
              top: tokenSize + 4,
              left: '50%',
              transform: 'translateX(-50%)',
              backgroundColor: 'rgba(0, 0, 0, 0.8)',
              color: 'white',
              padding: '2px 6px',
              borderRadius: 4,
              fontSize: '12px',
              whiteSpace: 'nowrap',
              zIndex: 1001
            }}
          >
            {token.name}
          </Box>
        )}
      </Box>

      {/* Context Menu */}
      <Menu
        opened={contextMenuOpen}
        onClose={() => setContextMenuOpen(false)}
        position="bottom-start"
        shadow="md"
        width={200}
        styles={{
          dropdown: {
            position: 'fixed',
            left: contextMenuPosition.x,
            top: contextMenuPosition.y
          }
        }}
      >
        <Menu.Dropdown>
          <Menu.Label>Token Actions</Menu.Label>
          <Menu.Item
            leftSection={<IconEdit size={14} />}
            onClick={() => {
              onEdit(token);
              setContextMenuOpen(false);
            }}
          >
            Edit Token
          </Menu.Item>
          <Menu.Item
            leftSection={<IconCopy size={14} />}
            onClick={() => {
              onDuplicate(token);
              setContextMenuOpen(false);
            }}
          >
            Duplicate
          </Menu.Item>
          <Menu.Item
            leftSection={token.locked ? <IconLockOpen size={14} /> : <IconLock size={14} />}
            onClick={() => {
              onToggleLock(token.id);
              setContextMenuOpen(false);
            }}
          >
            {token.locked ? 'Unlock' : 'Lock'}
          </Menu.Item>
          <Menu.Item
            leftSection={token.visible ? <IconEyeOff size={14} /> : <IconEye size={14} />}
            onClick={() => {
              onToggleVisibility(token.id);
              setContextMenuOpen(false);
            }}
          >
            {token.visible ? 'Hide' : 'Show'}
          </Menu.Item>
          <Menu.Divider />
          <Menu.Item
            leftSection={<IconTrash size={14} />}
            color="red"
            onClick={() => {
              onDelete(token.id);
              setContextMenuOpen(false);
            }}
          >
            Delete
          </Menu.Item>
        </Menu.Dropdown>
      </Menu>
    </>
  );
};

export const TokenLayer: React.FC<TokenLayerProps> = ({
  tokens,
  selectedTokens,
  onTokenMove,
  onTokenSelect,
  isSnapToGrid,
  gridSize,
  gridType,
  viewport,
  mapWidth,
  mapHeight
}) => {
  const { deleteToken, updateToken } = useMapStore();
  const [activeToken, setActiveToken] = useState<Token | null>(null);
  const [editingToken, setEditingToken] = useState<Token | null>(null);
  const [tokenForm, setTokenForm] = useState<Partial<Token>>({});

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 3,
      },
    })
  );

  // Clamp position to map boundaries
  const clampToMap = useCallback((x: number, y: number) => {
    if (!mapWidth || !mapHeight) return { x, y };
    
    // Clamp position to stay within map bounds
    const clampedX = Math.max(0, Math.min(x, mapWidth));
    const clampedY = Math.max(0, Math.min(y, mapHeight));
    
    return { x: clampedX, y: clampedY };
  }, [mapWidth, mapHeight]);

  // Snap to grid helper (snap to center of grid squares)
  const snapToGrid = useCallback((x: number, y: number) => {
    // First clamp to map boundaries
    const clamped = clampToMap(x, y);
    
    if (!isSnapToGrid) return clamped;
    
    // Snap to the center of the grid square
    const halfGrid = gridSize / 2;
    const snappedX = Math.floor(clamped.x / gridSize) * gridSize + halfGrid;
    const snappedY = Math.floor(clamped.y / gridSize) * gridSize + halfGrid;
    
    // Clamp again after snapping to ensure we don't snap outside bounds
    return clampToMap(snappedX, snappedY);
  }, [isSnapToGrid, gridSize, clampToMap]);

  // Handle drag start
  const handleDragStart = (event: DragStartEvent) => {
    const tokenId = event.active.id as string;
    const token = tokens.find(t => t.id === tokenId);
    if (token) {
      setActiveToken(token);
    }
  };

  // Handle drag end
  const handleDragEnd = (event: DragEndEvent) => {
    const { active } = event;
    
    if (active) {
      const tokenId = active.id as string;
      const token = tokens.find(t => t.id === tokenId);
      
      if (token) {
        // Get the new position from the drag event
        const delta = event.delta;
        // Convert screen delta to world coordinates
        const newX = token.x + delta.x / viewport.zoom;
        const newY = token.y + delta.y / viewport.zoom;
        
        // Snap to grid if enabled
        const snapped = snapToGrid(newX, newY);
        
        // Emit move event
        onTokenMove({
          tokenId,
          newX: snapped.x,
          newY: snapped.y,
          oldX: token.x,
          oldY: token.y
        });
      }
    }
    
    setActiveToken(null);
  };

  // Handle token selection
  const handleTokenSelect = (tokenId: string, multiSelect: boolean) => {
    const newSelection = multiSelect
      ? selectedTokens.tokenIds.includes(tokenId)
        ? selectedTokens.tokenIds.filter(id => id !== tokenId)
        : [...selectedTokens.tokenIds, tokenId]
      : [tokenId];
    
    onTokenSelect({
      tokenIds: newSelection,
      multiSelect
    });
  };

  // Handle token edit
  const handleTokenEdit = (token: Token) => {
    setEditingToken(token);
    setTokenForm({
      name: token.name,
      size: token.size,
      rotation: token.rotation,
      hp: token.hp
    });
  };

  // Handle token delete
  const handleTokenDelete = (tokenId: string) => {
    deleteToken(tokenId);
  };

  // Handle token lock toggle
  const handleTokenLockToggle = (tokenId: string) => {
    const token = tokens.find(t => t.id === tokenId);
    if (token) {
      updateToken(tokenId, { locked: !token.locked });
    }
  };

  // Handle token visibility toggle
  const handleTokenVisibilityToggle = (tokenId: string) => {
    const token = tokens.find(t => t.id === tokenId);
    if (token) {
      updateToken(tokenId, { visible: !token.visible });
    }
  };

  // Handle token duplicate
  const handleTokenDuplicate = (token: Token) => {
    const { addToken } = useMapStore.getState();
    const duplicatedToken: Token = {
      ...token,
      id: `token_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      name: `${token.name} (Copy)`,
      x: token.x + 50, // Offset slightly from original
      y: token.y + 50,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    addToken(duplicatedToken);
  };

  // Handle form submission
  const handleFormSubmit = () => {
    if (editingToken) {
      updateToken(editingToken.id, tokenForm);
      setEditingToken(null);
      setTokenForm({});
    }
  };

  return (
    <>
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <SortableContext items={tokens.map(t => t.id)} strategy={verticalListSortingStrategy}>
          {tokens.map((token) => (
            <TokenComponent
              key={token.id}
              token={token}
              isSelected={selectedTokens.tokenIds.includes(token.id)}
              isDragging={activeToken?.id === token.id}
              onSelect={handleTokenSelect}
              onEdit={handleTokenEdit}
              onDelete={handleTokenDelete}
              onToggleLock={handleTokenLockToggle}
              onToggleVisibility={handleTokenVisibilityToggle}
              onDuplicate={handleTokenDuplicate}
              viewport={viewport}
              isSnapToGrid={isSnapToGrid}
              gridSize={gridSize}
              gridType={gridType}
              mapWidth={mapWidth}
              mapHeight={mapHeight}
            />
          ))}
        </SortableContext>
        
        <DragOverlay
          dropAnimation={{
            duration: 200,
            easing: 'cubic-bezier(0.18, 0.67, 0.6, 1.22)',
          }}
        >
          {activeToken ? (
            <Box
              style={{
                width: 40 * viewport.zoom * activeToken.size,
                height: 40 * viewport.zoom * activeToken.size,
                borderRadius: '50%',
                border: '3px solid #4dabf7',
                backgroundColor: '#868e96',
                backgroundImage: activeToken.sprite ? `url(${activeToken.sprite})` : 'none',
                backgroundSize: activeToken.sprite && activeToken.imageScale ? `${activeToken.imageScale * 100}%` : 'cover',
                backgroundPosition: activeToken.sprite && (activeToken.imageOffsetX || activeToken.imageOffsetY) 
                  ? `calc(50% + ${activeToken.imageOffsetX || 0}px) calc(50% + ${activeToken.imageOffsetY || 0}px)` 
                  : 'center',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                position: 'relative',
                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)',
                transform: `rotate(${activeToken.rotation}deg)`,
                opacity: 0.8,
                cursor: 'grabbing',
                overflow: 'hidden'
              }}
            >
              {!activeToken.sprite && (
                <Text size="xs" color="white" fw={500}>
                  {activeToken.name.charAt(0).toUpperCase()}
                </Text>
              )}
              
              {/* HP Bar */}
              {activeToken.hp && (
                <Box
                  style={{
                    position: 'absolute',
                    bottom: -6,
                    left: -2,
                    right: -2,
                    height: 4,
                    backgroundColor: '#495057',
                    borderRadius: 2,
                    overflow: 'hidden'
                  }}
                >
                  <Box
                    style={{
                      width: `${(activeToken.hp.current / activeToken.hp.max) * 100}%`,
                      height: '100%',
                      backgroundColor: activeToken.hp.current > activeToken.hp.max * 0.5 ? '#51cf66' : 
                                      activeToken.hp.current > activeToken.hp.max * 0.25 ? '#ffd43b' : '#fa5252',
                      transition: 'width 0.3s ease'
                    }}
                  />
                </Box>
              )}
            </Box>
          ) : null}
        </DragOverlay>
      </DndContext>

      {/* Token Edit Modal */}
      <Modal
        opened={!!editingToken}
        onClose={() => {
          setEditingToken(null);
          setTokenForm({});
        }}
        title="Edit Token"
        size="md"
      >
        <Stack gap="md">
          <TextInput
            label="Token Name"
            value={tokenForm.name || ''}
            onChange={(e) => setTokenForm(prev => ({ ...prev, name: e.target.value }))}
          />
          
          <Group grow>
            <NumberInput
              label="Size"
              value={tokenForm.size || 1}
              onChange={(value) => setTokenForm(prev => ({ ...prev, size: typeof value === 'number' ? value : 1 }))}
              min={0.1}
              max={5}
              step={0.1}
            />
            
            <NumberInput
              label="Rotation"
              value={tokenForm.rotation || 0}
              onChange={(value) => setTokenForm(prev => ({ ...prev, rotation: typeof value === 'number' ? value : 0 }))}
              min={0}
              max={360}
              step={1}
            />
          </Group>
          
          {tokenForm.hp && (
            <Group grow>
              <NumberInput
                label="Current HP"
                value={tokenForm.hp.current}
                onChange={(value) => setTokenForm(prev => ({
                  ...prev,
                  hp: { ...prev.hp!, current: typeof value === 'number' ? value : 0 }
                }))}
                min={0}
              />
              
              <NumberInput
                label="Max HP"
                value={tokenForm.hp.max}
                onChange={(value) => setTokenForm(prev => ({
                  ...prev,
                  hp: { ...prev.hp!, max: typeof value === 'number' ? value : 0 }
                }))}
                min={1}
              />
            </Group>
          )}
          
          <Group justify="flex-end" mt="md">
            <Button variant="outline" onClick={() => setEditingToken(null)}>
              Cancel
            </Button>
            <Button onClick={handleFormSubmit}>
              Save Changes
            </Button>
          </Group>
        </Stack>
      </Modal>
    </>
  );
};
