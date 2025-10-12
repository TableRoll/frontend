import React, { useState } from 'react';
import {
  AppShell as MantineAppShell,
  AppShellNavbar,
  AppShellHeader,
  Text,
  Group,
  Button,
  Burger,
  useMantineTheme,
  Container,
  Stack,
  Divider,
  ActionIcon,
  Tooltip,
  Badge,
  Menu,
  Switch,
  TextInput,
  Modal,
  Tabs,
  ScrollArea,
  Box
} from '@mantine/core';
import {
  IconMap,
  IconMusic,
  IconSettings,
  IconUpload,
  IconDownload,
  IconLayout,
  IconLock,
  IconPlayerPlay,
  IconPlayerPause,
  IconVolume,
  IconDots,
  IconUser,
  IconHelp,
  IconInfoCircle,
  IconX
} from '@tabler/icons-react';
import { useMapStore } from '../stores/mapStore';
import { useAudio } from '../hooks/useAudio';
import { Dashboard } from './Dashboard';
import { MapCanvas } from './MapCanvas';
import { AssetPanel } from './AssetPanel';
import { AudioPlayer } from './AudioPlayer';
import { CharactersView } from './CharactersView';
import { MapDebugger } from './MapDebugger';
import { UserProfile } from './UserProfile';
import { StorageStatus } from './StorageStatus';

interface AppShellProps {
  children?: React.ReactNode;
}

export const AppShell: React.FC<AppShellProps> = ({ children }) => {
  const theme = useMantineTheme();
  const [opened, setOpened] = useState(false);
  const [activeTab, setActiveTab] = useState<string | null>('map');
  const [settingsOpened, setSettingsOpened] = useState(false);
  const [helpOpened, setHelpOpened] = useState(false);

  const {
    currentMap,
    currentCampaign,
    assets,
    isGM,
    currentPlayer,
    isGridVisible,
    isSnapToGrid,
    gridSize,
    gridType,
    viewport,
    selectedTokens,
    toggleGrid,
    toggleSnapToGrid,
    setGridSize,
    toggleGM,
    setCurrentPlayer,
    exportScene,
    deactivateMap,
    moveToken,
    selectTokens,
    updateViewport,
    deleteAsset
  } = useMapStore();

  const {
    isPlaying,
    currentTrack,
    togglePlayPause,
    playNext,
    playPrevious,
    volume,
    setVolume
  } = useAudio();

  const handleExport = () => {
    const data = exportScene();
    if (data) {
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${currentMap?.name || 'scene'}_export.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }
  };

  const handleImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const data = JSON.parse(e.target?.result as string);
          // Import logic would go here
          console.log('Import data:', data);
        } catch (error) {
          console.error('Failed to parse import file:', error);
        }
      };
      reader.readAsText(file);
    }
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <Dashboard />;
      case 'map':
        console.log('AppShell rendering MapCanvas with:', {
          currentMap,
          currentCampaign,
          viewport,
          isGridVisible,
          isSnapToGrid,
          gridSize,
          gridType
        });
        return <MapCanvas 
          map={currentMap}
          tokens={currentCampaign?.tokens || []}
          selectedTokens={selectedTokens}
          viewport={viewport}
          onTokenMove={moveToken}
          onTokenSelect={selectTokens}
          onViewportChange={updateViewport}
          isGridVisible={isGridVisible}
          isSnapToGrid={isSnapToGrid}
          gridSize={gridSize}
          gridType={gridType}
        />;
      case 'characters':
        return <CharactersView />;
      case 'assets':
        return <AssetPanel 
          assets={assets}
          onAssetSelect={() => {}}
          onAssetUpload={() => {}}
          onAssetDelete={deleteAsset}
        />;
      case 'audio':
        return <AudioPlayer 
          playlist={{
            id: 'default',
            name: 'Default Playlist',
            tracks: [],
            currentTrackIndex: 0,
            isPlaying: false,
            volume: 1
          }}
          onTrackChange={() => {}}
          onVolumeChange={() => {}}
          onPlayPause={() => {}}
        />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <MantineAppShell
      styles={{
        main: {
          background: theme.colors.gray[0],
          position: 'fixed',
          left: opened ? '180px' : '8px',
          top: '60px',
          right: '0px',
          bottom: '0px',
          overflow: 'hidden', // Changed from 'auto' to 'hidden' for canvas
        },
        header: {
          backgroundColor: theme.colors.gray[0],
          borderBottom: `1px solid ${theme.colors.gray[3]}`,
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          height: '60px',
          zIndex: 1000,
        },
        navbar: {
          backgroundColor: theme.colors.gray[1],
          borderRight: `1px solid ${theme.colors.gray[3]}`,
          position: 'fixed',
          top: '60px',
          left: 0,
          height: 'calc(100vh - 60px)',
          zIndex: 999,
        },
      }}
      navbar={{
        width: { sm: 200, lg: 300 },
        breakpoint: 'sm',
        collapsed: { mobile: !opened },
      }}
    >
      <AppShellNavbar p="md">
        <ScrollArea>
          <Stack gap="xs">
              <Text size="sm" fw={500} c="dimmed">
                Navigation
              </Text>
              
              <Button
                variant={activeTab === 'dashboard' ? 'filled' : 'subtle'}
                leftSection={<IconMap size={16} />}
                onClick={() => setActiveTab('dashboard')}
                fullWidth
                justify="flex-start"
              >
                Dashboard
              </Button>
              
              <Button
                variant={activeTab === 'map' ? 'filled' : 'subtle'}
                leftSection={<IconMap size={16} />}
                onClick={() => setActiveTab('map')}
                fullWidth
                justify="flex-start"
                disabled={!currentMap}
              >
                Map View
              </Button>
              
              <Button
                variant={activeTab === 'characters' ? 'filled' : 'subtle'}
                leftSection={<IconUser size={16} />}
                onClick={() => setActiveTab('characters')}
                fullWidth
                justify="flex-start"
              >
                Characters
              </Button>
              
              <Button
                variant={activeTab === 'assets' ? 'filled' : 'subtle'}
                leftSection={<IconUpload size={16} />}
                onClick={() => setActiveTab('assets')}
                fullWidth
                justify="flex-start"
              >
                Assets
              </Button>
              
              <Button
                variant={activeTab === 'audio' ? 'filled' : 'subtle'}
                leftSection={<IconMusic size={16} />}
                onClick={() => setActiveTab('audio')}
                fullWidth
                justify="flex-start"
              >
                Audio
              </Button>
              
              <Divider />
              
              <Text size="sm" fw={500} c="dimmed">
                Tools
              </Text>
              
              <Group gap="xs">
                <Tooltip label="Toggle Grid">
                  <ActionIcon
                    variant={isGridVisible ? 'filled' : 'outline'}
                    onClick={toggleGrid}
                  >
                    <IconLayout size={16} />
                  </ActionIcon>
                </Tooltip>
                
                <Tooltip label="Snap to Grid">
                  <ActionIcon
                    variant={isSnapToGrid ? 'filled' : 'outline'}
                    onClick={toggleSnapToGrid}
                  >
                    <IconLock size={16} />
                  </ActionIcon>
                </Tooltip>
              </Group>
              
              <Divider />
              
              <Text size="sm" fw={500} c="dimmed">
                Campaign Info
              </Text>
              
              {currentCampaign && (
                <Box>
                  <Text size="xs" c="dimmed">Current Campaign:</Text>
                  <Text size="sm" fw={500}>{currentCampaign.name}</Text>
                  <Badge size="xs" color="green">
                    {currentCampaign.tokens.length} tokens
                  </Badge>
                </Box>
              )}
              
              {currentMap && (
                <Box>
                  <Text size="xs" c="dimmed">Map:</Text>
                  <Text size="sm" fw={500}>{currentMap.name}</Text>
                </Box>
              )}
            </Stack>
          </ScrollArea>
          
          <Stack gap="xs">
              <Divider />
              <Button
                variant="outline"
                leftSection={<IconDownload size={16} />}
                onClick={handleExport}
                fullWidth
                size="xs"
                disabled={!currentMap}
              >
                Export Scene
              </Button>
              
              <Button
                variant="outline"
                color="red"
                leftSection={<IconX size={16} />}
                onClick={deactivateMap}
                fullWidth
                size="xs"
                disabled={!currentMap}
              >
                Deactivate Map
              </Button>
              
              <Button
                variant="outline"
                leftSection={<IconUpload size={16} />}
                component="label"
                fullWidth
                size="xs"
              >
                Import Scene
                <input
                  type="file"
                  accept=".json"
                  onChange={handleImport}
                  style={{ display: 'none' }}
                />
              </Button>
            </Stack>
      </AppShellNavbar>
      
      <AppShellHeader p="sm" style={{ display: 'flex', alignItems: 'center' }}>
          <Group justify="space-between" wrap="nowrap" style={{ width: '100%', alignItems: 'center' }}>
            {/* Left Section */}
            <Group gap="sm" wrap="nowrap" style={{ minWidth: 0, flex: '0 0 auto', alignItems: 'center' }}>
              <Burger
                opened={opened}
                onClick={() => setOpened((o) => !o)}
                size="sm"
                color={theme.colors.gray[6]}
                hiddenFrom="sm"
              />
              
              <Text size="lg" fw={700} style={{ whiteSpace: 'nowrap' }}>
                D&D Map App
              </Text>
              
              {currentCampaign && (
                <Group gap="xs" wrap="nowrap" visibleFrom="sm" style={{ alignItems: 'center' }}>
                  <Badge color="green" variant="light" size="sm">
                    {currentCampaign.name}
                  </Badge>
                  {currentMap && (
                    <Badge color="blue" variant="light" size="sm">
                      {currentMap.name}
                    </Badge>
                  )}
                  <ActionIcon
                    variant="outline"
                    color="red"
                    size="sm"
                    onClick={deactivateMap}
                    title="Deactivate Campaign"
                  >
                    <IconX size={14} />
                  </ActionIcon>
                </Group>
              )}
            </Group>
            
            {/* Center Section - Audio Controls (hidden on small screens) */}
            <Group gap="xs" wrap="nowrap" visibleFrom="lg" style={{ flex: '0 0 auto', alignItems: 'center' }}>
              {currentTrack && (
                <Group gap="xs" wrap="nowrap" style={{ alignItems: 'center' }}>
                  <ActionIcon
                    variant="outline"
                    onClick={playPrevious}
                    size="sm"
                  >
                    <IconPlayerPlay size={14} style={{ transform: 'scaleX(-1)' }} />
                  </ActionIcon>
                  
                  <ActionIcon
                    variant="filled"
                    onClick={togglePlayPause}
                    size="sm"
                  >
                    {isPlaying ? <IconPlayerPause size={14} /> : <IconPlayerPlay size={14} />}
                  </ActionIcon>
                  
                  <ActionIcon
                    variant="outline"
                    onClick={playNext}
                    size="sm"
                  >
                    <IconPlayerPlay size={14} />
                  </ActionIcon>
                  
                  <Text size="xs" color="dimmed" style={{ 
                    maxWidth: '80px', 
                    overflow: 'hidden', 
                    textOverflow: 'ellipsis', 
                    whiteSpace: 'nowrap' 
                  }}>
                    {currentTrack.name}
                  </Text>
                </Group>
              )}
            </Group>
            
            {/* Right Section */}
            <Group gap="xs" wrap="nowrap" style={{ flex: '0 0 auto', alignItems: 'center' }}>
              {/* Volume Control - Only on larger screens */}
              <Group gap="xs" wrap="nowrap" visibleFrom="xl" style={{ alignItems: 'center' }}>
                <IconVolume size={14} />
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.1"
                  value={volume}
                  onChange={(e) => setVolume(parseFloat(e.target.value))}
                  style={{ width: '40px' }}
                />
              </Group>
              
              {/* GM Toggle - Compact version */}
              <Switch
                label="GM"
                checked={isGM}
                onChange={toggleGM}
                size="xs"
                style={{ minWidth: 'auto' }}
                visibleFrom="md"
              />
              
              {/* Storage Status */}
              <StorageStatus />
              
              {/* User Profile */}
              <UserProfile />
              
              {/* Settings Menu */}
              <Menu shadow="md" width={200}>
                <Menu.Target>
                  <ActionIcon variant="outline" size="sm">
                    <IconDots size={16} />
                  </ActionIcon>
                </Menu.Target>
                
                <Menu.Dropdown>
                  <Menu.Label>Application</Menu.Label>
                  <Menu.Item
                    leftSection={<IconSettings size={14} />}
                    onClick={() => setSettingsOpened(true)}
                  >
                    Settings
                  </Menu.Item>
                  <Menu.Item
                    leftSection={<IconHelp size={14} />}
                    onClick={() => setHelpOpened(true)}
                  >
                    Help
                  </Menu.Item>
                  <Menu.Item
                    leftSection={<IconInfoCircle size={14} />}
                    onClick={() => setSettingsOpened(true)}
                  >
                    About
                  </Menu.Item>
                  
                  <Menu.Divider />
                  
                  <Menu.Label>Account</Menu.Label>
                  <Menu.Item
                    leftSection={<IconUser size={14} />}
                    onClick={() => setCurrentPlayer(null)}
                  >
                    Switch Player
                  </Menu.Item>
                </Menu.Dropdown>
              </Menu>
            </Group>
          </Group>
        </AppShellHeader>
      
      <MantineAppShell.Main>
        {activeTab === 'map' ? (
          // For map view, render canvas directly without container padding
          <Box style={{ width: '100%', height: '100%' }}>
            {children || renderContent()}
          </Box>
        ) : activeTab === 'dashboard' ? (
          // For dashboard, render without extra container since it has its own
          <Box style={{ width: '100%', height: '100%' }}>
            {children || renderContent()}
          </Box>
        ) : (
          // For other views, use container with padding
          <Container fluid p="md" style={{ paddingTop: '20px' }}>
            {children || renderContent()}
          </Container>
        )}
        
        {/* Debug Panel - only show in development */}
        {process.env.NODE_ENV === 'development' && <MapDebugger />}
      </MantineAppShell.Main>
      
      {/* Settings Modal */}
      <Modal
        opened={settingsOpened}
        onClose={() => setSettingsOpened(false)}
        title="Settings"
        size="md"
      >
        <Tabs defaultValue="general">
          <Tabs.List>
            <Tabs.Tab value="general">General</Tabs.Tab>
            <Tabs.Tab value="grid">Grid</Tabs.Tab>
            <Tabs.Tab value="audio">Audio</Tabs.Tab>
          </Tabs.List>
          
          <Tabs.Panel value="general" pt="md">
            <Stack gap="md">
              <Switch
                label="GM Mode"
                description="Enable Game Master features"
                checked={isGM}
                onChange={toggleGM}
              />
              
              <TextInput
                label="Player Name"
                placeholder="Enter your name"
                value={currentPlayer?.name || ''}
                onChange={(e) => {
                  if (currentPlayer) {
                    setCurrentPlayer({ ...currentPlayer, name: e.target.value });
                  }
                }}
              />
            </Stack>
          </Tabs.Panel>
          
          <Tabs.Panel value="grid" pt="md">
            <Stack gap="md">
              <Switch
                label="Show Grid"
                checked={isGridVisible}
                onChange={toggleGrid}
              />
              
              <Switch
                label="Snap to Grid"
                checked={isSnapToGrid}
                onChange={toggleSnapToGrid}
              />
              
              <TextInput
                label="Grid Size"
                type="number"
                value={gridSize}
                onChange={(e) => setGridSize(parseInt(e.target.value) || 50)}
              />
            </Stack>
          </Tabs.Panel>
          
          <Tabs.Panel value="audio" pt="md">
            <Stack gap="md">
              <Text size="sm" c="dimmed">
                Audio settings will be available here
              </Text>
            </Stack>
          </Tabs.Panel>
        </Tabs>
      </Modal>
      
      {/* Help Modal */}
      <Modal
        opened={helpOpened}
        onClose={() => setHelpOpened(false)}
        title="Help & Shortcuts"
        size="lg"
      >
        <Stack gap="md">
          <Text size="sm" c="dimmed">
            Keyboard shortcuts and usage tips for the D&D Map App.
          </Text>
          
          <Tabs defaultValue="shortcuts">
            <Tabs.List>
              <Tabs.Tab value="shortcuts">Shortcuts</Tabs.Tab>
              <Tabs.Tab value="features">Features</Tabs.Tab>
            </Tabs.List>
            
            <Tabs.Panel value="shortcuts" pt="md">
              <Stack gap="sm">
                <Text size="sm" fw={500}>Map Navigation:</Text>
                <Text size="xs">• Mouse wheel: Zoom in/out</Text>
                <Text size="xs">• Drag: Pan around the map</Text>
                <Text size="xs">• Double-click: Reset zoom</Text>
                <Text size="xs">• G: Toggle grid visibility</Text>
                <Text size="xs">• S: Toggle snap to grid</Text>
              </Stack>
            </Tabs.Panel>
            
            <Tabs.Panel value="features" pt="md">
              <Stack gap="sm">
                <Text size="sm" fw={500}>Key Features:</Text>
                <Text size="xs">• Upload high-resolution maps</Text>
                <Text size="xs">• Place and move tokens</Text>
                <Text size="xs">• Manage audio playlists</Text>
                <Text size="xs">• Export/import scenes</Text>
                <Text size="xs">• Grid and snap-to-grid support</Text>
              </Stack>
            </Tabs.Panel>
          </Tabs>
        </Stack>
      </Modal>
    </MantineAppShell>
  );
};
