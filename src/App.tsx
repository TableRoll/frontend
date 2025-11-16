import React, { useEffect } from 'react';
import { MantineProvider, createTheme } from '@mantine/core';
import { Notifications } from '@mantine/notifications';
import { ModalsProvider } from '@mantine/modals';
import { AppShell } from './components/AppShell';
import { AuthWrapper } from './components/AuthWrapper';
import { useMapStore } from './stores/mapStoreWithAPI';
import { MapCanvas } from './components/MapCanvas';
import { TokenLayer } from './components/TokenLayer';
import { AssetPanel } from './components/AssetPanel';
import { AudioPlayer } from './components/AudioPlayer';
import { Dashboard } from './components/Dashboard';
import { TokenMoveEvent, TokenSelectEvent, ViewportChangeEvent } from './types/models';

// Import Mantine styles
import '@mantine/core/styles.css';

// Create a light theme
const theme = createTheme({
  colors: {
    blue: ['#e7f5ff', '#d0ebff', '#a5d8ff', '#74c0fc', '#47a8ff', '#339af0', '#228be6', '#1c7ed6', '#1971c2', '#1864ab'],
    gray: ['#f8f9fa', '#e9ecef', '#dee2e6', '#ced4da', '#adb5bd', '#868e96', '#495057', '#343a40', '#212529', '#121416'],
  },
  primaryColor: 'blue',
  defaultRadius: 'sm',
});

function App() {
  const {
    currentMap,
    currentCampaign,
    selectedTokens,
    viewport,
    isGridVisible,
    isSnapToGrid,
    gridSize,
    gridType,
    currentPlaylist,
    assets,
    moveToken,
    selectTokens,
    updateViewport,
    loadCampaigns,
    loadCharacters,
    loadAssets,
    loadMaps
  } = useMapStore();

  // Load data on app startup
  useEffect(() => {
    const loadInitialData = async () => {
      try {
        // Load maps first (they're independent of campaigns)
        await loadMaps();
        await loadCampaigns();
        await loadCharacters();
        await loadAssets();
      } catch (error) {
        console.error('Failed to load initial data:', error);
      }
    };

    loadInitialData();
  }, [loadMaps, loadCampaigns, loadCharacters, loadAssets]);

  // Handle token movement
  const handleTokenMove = (event: TokenMoveEvent) => {
    moveToken(event);
  };

  // Handle token selection
  const handleTokenSelect = (event: TokenSelectEvent) => {
    selectTokens(event);
  };

  // Handle viewport changes
  const handleViewportChange = (event: ViewportChangeEvent) => {
    updateViewport(event.viewport);
  };

  // Handle asset selection
  const handleAssetSelect = (asset: any) => {
    console.log('Asset selected:', asset);
    // In a real app, this would add the asset to the map or create a token
  };

  // Handle asset upload
  const handleAssetUpload = (files: File[]) => {
    console.log('Files uploaded:', files);
    // In a real app, this would upload files to a server
  };

  // Handle asset deletion
  const handleAssetDelete = (assetId: string) => {
    console.log('Asset deleted:', assetId);
    // In a real app, this would delete the asset from the server
  };

  // Handle track change
  const handleTrackChange = (trackIndex: number) => {
    console.log('Track changed to:', trackIndex);
    // In a real app, this would update the current track
  };

  // Handle volume change
  const handleVolumeChange = (volume: number) => {
    console.log('Volume changed to:', volume);
    // In a real app, this would update the audio volume
  };

  // Handle play/pause
  const handlePlayPause = (isPlaying: boolean) => {
    console.log('Play/pause:', isPlaying);
    // In a real app, this would control audio playback
  };

  return (
    <MantineProvider theme={theme}>
      <Notifications position="top-right" limit={5} />
      <ModalsProvider>
        <AuthWrapper>
          <AppShell>
            {/* The AppShell component handles the main layout and navigation */}
            {/* Content is rendered based on the active tab in AppShell */}
          </AppShell>
        </AuthWrapper>
      </ModalsProvider>
    </MantineProvider>
  );
}

export default App;
