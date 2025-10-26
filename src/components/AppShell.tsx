import React, { useState } from 'react';
import {
  AppShell as MantineAppShell,
  Text,
  Group,
  Button,
  Stack,
  NavLink,
  Badge,
  Burger,
  ActionIcon,
  Menu,
  Divider
} from '@mantine/core';
import {
  IconHome,
  IconMap,
  IconUsers,
  IconPhoto,
  IconSettings,
  IconLogout,
  IconUser,
  IconSword
} from '@tabler/icons-react';
import { useAuthStore } from '../stores/authStore';
import { useMapStore } from '../stores/mapStore';
import { Dashboard } from './Dashboard';
import { MapCanvas } from './MapCanvas';
import { CharactersView } from './CharactersView';
import { AssetPanel } from './AssetPanel';
import { CombatManager } from './CombatManager';

interface AppShellProps {
  children?: React.ReactNode;
}

export const AppShell: React.FC<AppShellProps> = ({ children }) => {
  const [opened, setOpened] = useState(false);
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [combatOpened, setCombatOpened] = useState(false);

  const { user, logout } = useAuthStore();
  const {
    currentMap,
    currentCampaign,
    assets,
    isGM,
    viewport,
    selectedTokens,
    isGridVisible,
    isSnapToGrid,
    gridSize,
    gridType,
    toggleGM,
    exportScene,
    moveToken,
    selectTokens,
    updateViewport,
    deleteAsset
  } = useMapStore();

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

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <Dashboard />;
      case 'map':
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
      default:
        return <Dashboard />;
    }
  };

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: IconHome },
    { id: 'map', label: 'Map', icon: IconMap },
    { id: 'characters', label: 'Characters', icon: IconUsers },
    { id: 'assets', label: 'Assets', icon: IconPhoto },
  ];

  return (
    <MantineAppShell
      header={{ height: 60 }}
      navbar={{
        width: 250,
        breakpoint: 'sm',
        collapsed: { mobile: !opened },
      }}
      padding="md"
    >
      <MantineAppShell.Header>
        <Group h="100%" px="md" justify="space-between">
          <Group>
            <Burger
              opened={opened}
              onClick={() => setOpened((o) => !o)}
              hiddenFrom="sm"
              size="sm"
            />
            <Text size="lg" fw={700}>
              D&D Map App
            </Text>
          </Group>

          <Group>
            {/* Campaign Info */}
            {currentCampaign && (
              <Badge color="green" variant="light">
                {currentCampaign.name}
              </Badge>
            )}
            
            {/* Map Info */}
            {currentMap && (
              <Badge color="blue" variant="light">
                {currentMap.name}
              </Badge>
            )}

            {/* GM Mode Toggle */}
            <Button
              size="xs"
              variant={isGM ? 'filled' : 'outline'}
              color={isGM ? 'red' : 'gray'}
              onClick={toggleGM}
            >
              {isGM ? 'GM Mode' : 'Player Mode'}
            </Button>

            {/* Combat Button */}
            <ActionIcon
              variant="filled"
              color="red"
              onClick={() => setCombatOpened(true)}
              title="Open Combat Manager"
            >
              <IconSword size={16} />
            </ActionIcon>

            {/* User Menu */}
            <Menu>
              <Menu.Target>
                <ActionIcon variant="subtle">
                  <IconUser size={16} />
                </ActionIcon>
              </Menu.Target>
              <Menu.Dropdown>
                <Menu.Label>Account</Menu.Label>
                <Menu.Item leftSection={<IconUser size={14} />}>
                  {user?.displayName}
                </Menu.Item>
                <Menu.Item leftSection={<IconSettings size={14} />}>
                  Settings
                </Menu.Item>
                <Menu.Divider />
                <Menu.Item
                  leftSection={<IconLogout size={14} />}
                  color="red"
                  onClick={logout}
                >
                  Logout
                </Menu.Item>
              </Menu.Dropdown>
            </Menu>
          </Group>
        </Group>
      </MantineAppShell.Header>

      <MantineAppShell.Navbar p="md">
        <Stack gap="xs">
          {navItems.map((item) => (
            <NavLink
              key={item.id}
              active={activeTab === item.id}
              label={item.label}
              leftSection={<item.icon size={16} />}
              onClick={() => setActiveTab(item.id)}
            />
          ))}
          
          <Divider my="sm" />
          
          {/* Quick Actions */}
          <Text size="xs" c="dimmed" fw={500} tt="uppercase">
            Quick Actions
          </Text>
          
          <Button
            variant="light"
            size="sm"
            leftSection={<IconMap size={14} />}
            onClick={handleExport}
            disabled={!currentMap}
          >
            Export Scene
          </Button>
          
          <Button
            variant="light"
            size="sm"
            leftSection={<IconSword size={14} />}
            onClick={() => setCombatOpened(true)}
          >
            Start Combat
          </Button>
        </Stack>
      </MantineAppShell.Navbar>

      <MantineAppShell.Main>
        {renderContent()}
      </MantineAppShell.Main>

      {/* Combat Manager Modal */}
      <CombatManager
        opened={combatOpened}
        onClose={() => setCombatOpened(false)}
        tokens={currentCampaign?.tokens || []}
      />

    </MantineAppShell>
  );
};