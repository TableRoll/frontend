/**
 * Debug utilities for troubleshooting the D&D Map App
 */

import { useMapStore } from '../stores/mapStore';

/**
 * Logs the current state of the store for debugging
 */
export const debugStoreState = () => {
  const state = useMapStore.getState();
  
  console.group('🔍 Store Debug Info');
  console.log('📊 Assets:', state.assets);
  console.log('🗺️ Maps:', state.maps);
  console.log('🎬 Campaigns:', state.campaigns);
  console.log('🎵 Playlists:', state.playlists);
  console.log('👥 Players:', state.players);
  console.log('🎮 Current Map:', state.currentMap);
  console.log('🎭 Current Campaign:', state.currentCampaign);
  console.log('👤 Current Player:', state.currentPlayer);
  console.log('🎯 Is GM:', state.isGM);
  console.groupEnd();
};

/**
 * Adds a test asset to help debug asset display issues
 */
export const addTestAsset = () => {
  const { addAsset } = useMapStore.getState();
  
  const testAsset = {
    id: `test_asset_${Date.now()}`,
    name: 'Test Image',
    type: 'image' as const,
    url: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgZmlsbD0iIzQyODVmNCIvPjx0ZXh0IHg9IjUwIiB5PSI1NSIgZm9udC1mYW1pbHk9IkFyaWFsIiBmb250LXNpemU9IjE0IiBmaWxsPSJ3aGl0ZSIgdGV4dC1hbmNob3I9Im1pZGRsZSI+VGVzdDwvdGV4dD48L3N2Zz4=',
    thumbnail: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgZmlsbD0iIzQyODVmNCIvPjx0ZXh0IHg9IjUwIiB5PSI1NSIgZm9udC1mYW1pbHk9IkFyaWFsIiBmb250LXNpemU9IjE0IiBmaWxsPSJ3aGl0ZSIgdGV4dC1hbmNob3I9Im1pZGRsZSI+VGVzdDwvdGV4dD48L3N2Zz4=',
    size: 1024,
    uploadedAt: new Date()
  };
  
  addAsset(testAsset);
  console.log('✅ Test asset added:', testAsset);
};

/**
 * Clears all assets (useful for testing)
 */
export const clearAllAssets = () => {
  const { assets, deleteAsset } = useMapStore.getState();
  
  assets.forEach(asset => {
    deleteAsset(asset.id);
  });
  
  console.log('🗑️ All assets cleared');
};

/**
 * Logs asset-related information
 */
export const debugAssets = () => {
  const { assets } = useMapStore.getState();
  
  console.group('📁 Assets Debug');
  console.log('Total assets:', assets.length);
  console.log('Assets:', assets);
  
  if (assets.length === 0) {
    console.warn('⚠️ No assets found in store');
  } else {
    assets.forEach((asset, index) => {
      console.log(`Asset ${index + 1}:`, {
        id: asset.id,
        name: asset.name,
        type: asset.type,
        hasUrl: !!asset.url,
        hasThumbnail: !!asset.thumbnail,
        size: asset.size,
        uploadedAt: asset.uploadedAt
      });
    });
  }
  console.groupEnd();
};

