import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { 
  AppState, 
  Map, 
  Token, 
  Campaign,
  Scene, 
  Asset, 
  Playlist, 
  Player, 
  Viewport, 
  Selection,
  TokenMoveEvent,
  TokenSelectEvent,
  ViewportChangeEvent,
  LayerVisibilityEvent,
  ExportData,
  GridType,
  Character,
  CombatState,
  CombatParticipant
} from '../types/models';
import { 
  campaignsAPI, 
  charactersAPI, 
  assetsAPI, 
  combatAPI,
  mapsAPI,
  setAuthToken,
  removeAuthToken,
  isAuthenticated
} from '../services/api';

// Helper function to transform API map response to frontend Map interface
const transformMapFromAPI = (m: any): Map => {
  // Build image URL from asset ID if available
  const imageUrl = m.assetId ? assetsAPI.getFileUrl(m.assetId) : (m.imageUrl || '');
  
  console.log('🔄 Transforming map from API:', {
    id: m.id,
    name: m.name,
    assetId: m.assetId,
    hasImageUrl: !!imageUrl,
    imageUrl: imageUrl ? imageUrl.substring(0, 100) + '...' : 'NO URL'
  });
  
  return {
    id: m.id,
    name: m.name,
    description: m.description,
    assetId: m.assetId,
    widthPx: m.widthPx,
    heightPx: m.heightPx,
    thumbnail: imageUrl,
    tileSource: imageUrl,
    layers: [
      { id: 'bg', type: 'background' as const, name: 'Background', visible: true, opacity: 1, locked: false, order: 0 },
      { id: 'grid', type: 'grid' as const, name: 'Grid', visible: true, opacity: 0.5, locked: false, order: 1, gridType: m.gridType || 'square', gridSize: m.gridSize || 50 },
      { id: 'tokens', type: 'tokens' as const, name: 'Tokens', visible: true, opacity: 1, locked: false, order: 2 }
    ],
    createdAt: new Date(m.createdAt),
    updatedAt: new Date(m.updatedAt)
  };
};

// Helper function to transform API asset response to frontend Asset interface
const transformAssetFromAPI = (a: any): Asset => {
  // Build URLs from asset ID - use getFileUrl for proper file serving
  const url = a.id ? assetsAPI.getFileUrl(a.id) : (a.filePath || '');
  
  // Handle thumbnail URL - ensure it's a full URL
  let thumbnail = url; // Default to main URL
  if (a.thumbnailPath || a.thumbnailId) {
    // If thumbnailId exists, use getFileUrl to construct the URL
    if (a.thumbnailId) {
      thumbnail = assetsAPI.getFileUrl(a.thumbnailId);
    }
    // If thumbnailPath is a full URL, use it as-is
    else if (a.thumbnailPath && (a.thumbnailPath.startsWith('http://') || a.thumbnailPath.startsWith('https://'))) {
      thumbnail = a.thumbnailPath;
    }
    // If thumbnailPath is a relative path, convert it to full URL
    else if (a.thumbnailPath && a.thumbnailPath.startsWith('/')) {
      const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';
      thumbnail = `${API_BASE_URL}${a.thumbnailPath}`;
    }
    // If thumbnailPath looks like an ID (UUID format), use getFileUrl
    else if (a.thumbnailPath && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(a.thumbnailPath)) {
      thumbnail = assetsAPI.getFileUrl(a.thumbnailPath);
    }
    // Otherwise, try to use thumbnailPath as-is (might be a data URL or full path)
    else if (a.thumbnailPath) {
      thumbnail = a.thumbnailPath;
    }
  }
  
  console.log('🔄 Transforming asset from API:', {
    id: a.id,
    name: a.name,
    assetType: a.assetType,
    hasUrl: !!url,
    hasThumbnail: !!thumbnail,
    url: url ? url.substring(0, 100) + '...' : 'NO URL',
    thumbnail: thumbnail ? thumbnail.substring(0, 100) + '...' : 'NO THUMBNAIL'
  });
  
  return {
    id: a.id,
    name: a.name,
    type: a.assetType || a.type || 'image', // API uses assetType, fallback to type
    url: url,
    thumbnail: thumbnail,
    size: a.fileSize || a.size || 0,
    uploadedAt: a.createdAt ? new Date(a.createdAt) : (a.uploadedAt ? new Date(a.uploadedAt) : new Date()),
    tokenData: a.tokenData // Preserve token data if present
  };
};

interface MapStore extends AppState {
  // Maps
  maps: Map[];
  campaigns: Campaign[];
  currentCampaign: Campaign | null;
  scenes: Scene[];
  
  // Characters
  characters: Character[];
  
  // Assets
  assets: Asset[];
  
  // Audio
  playlists: Playlist[];
  currentPlaylist: Playlist | null;
  
  // Players
  players: Player[];
  
  // Combat
  combat: CombatState;
  
  // Selection
  selection: Selection;
  
  // Layer visibility
  layerVisibility: Record<string, boolean>;
  
  // Loading states
  isLoading: boolean;
  error: string | null;
  
  // Actions - Maps
  setCurrentMap: (map: Map | null) => void;
  addMap: (map: Map) => Promise<Map>;
  updateMap: (id: string, updates: Partial<Map>) => Promise<void>;
  deleteMap: (id: string) => Promise<void>;
  deactivateMap: () => void;
  
  // Actions - Campaigns
  setCurrentCampaign: (campaign: Campaign | null) => Promise<void>;
  addCampaign: (campaign: Omit<Campaign, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  updateCampaign: (id: string, updates: Partial<Campaign>) => Promise<void>;
  deleteCampaign: (id: string) => Promise<void>;
  changeCampaignMap: (mapId: string) => Promise<void>;
  
  // Actions - Characters
  addCharacter: (character: Omit<Character, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  updateCharacter: (id: string, updates: Partial<Character>) => Promise<void>;
  deleteCharacter: (id: string) => Promise<void>;
  
  // Actions - Assets
  addAsset: (asset: Omit<Asset, 'id' | 'uploadedAt'>) => Promise<void>;
  updateAsset: (id: string, updates: Partial<Asset>) => Promise<void>;
  deleteAsset: (id: string) => Promise<void>;
  uploadAsset: (file: File, data: { name: string; assetType: string; campaignId?: string; isPublic?: boolean }) => Promise<void>;
  
  // Actions - Combat
  startCombat: (participants: CombatParticipant[]) => void;
  endCombat: () => void;
  nextTurn: () => void;
  consumeAction: (tokenId: string) => void;
  consumeBonusAction: (tokenId: string) => void;
  
  // Actions - Tokens (persisted on current campaign)
  addToken: (token: Omit<Token, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateToken: (id: string, updates: Partial<Token>) => void;
  deleteToken: (id: string) => void;
  moveToken: (event: TokenMoveEvent) => void;
  selectTokens: (event: TokenSelectEvent) => void;
  
  // Actions - Viewport
  setViewport: (viewport: Viewport) => void;
  updateViewport: (viewport: Partial<Viewport>) => void;
  resetViewport: () => void;
  
  // Actions - Selection
  setSelection: (selection: Selection) => void;
  clearSelection: () => void;
  
  // Actions - Grid
  setGridVisible: (visible: boolean) => void;
  setSnapToGrid: (snap: boolean) => void;
  setGridSize: (size: number) => void;
  setGridType: (type: GridType) => void;
  
  // Actions - Layers
  toggleLayerVisibility: (layerId: string) => void;
  setLayerVisibility: (layerId: string, visible: boolean) => void;
  
  // Actions - GM
  setGM: (isGM: boolean) => void;
  toggleGM: () => void;
  
  // Actions - Loading
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  
  // Actions - Data loading
  loadCampaigns: () => Promise<void>;
  loadCharacters: (campaignId?: string) => Promise<void>;
  loadAssets: (campaignId?: string) => Promise<void>;
  loadMaps: (campaignId?: string) => Promise<void>;
  
  // Actions - Export/Import
  exportData: () => ExportData;
  exportScene: () => ExportData | null; // Alias for exportData for backwards compatibility
  importData: (data: ExportData) => void;
}

export const useMapStore = create<MapStore>()(
  devtools(
    (set, get) => ({
      // Initial state
      maps: [],
      campaigns: [],
      currentCampaign: null,
      scenes: [],
      characters: [],
      assets: [],
      playlists: [],
      currentPlaylist: null,
      players: [],
      combat: {
        isActive: false,
        round: 1,
        currentTurnIndex: 0,
        participants: []
      },
      isLoading: false,
      error: null,
      
      // Current state
      currentMap: null,
      currentScene: null,
      viewport: {
        x: 0,
        y: 0,
        zoom: 1,
        rotation: 0
      },
      selectedTokens: {
        tokenIds: []
      },
      selection: {
        tokenIds: []
      },
      layerVisibility: {
        background: true,
        tokens: true,
        grid: true,
        fog: false
      },
      isGridVisible: true,
      isSnapToGrid: true,
      gridSize: 50,
      gridType: 'square',
      activeLayer: 'tokens',
      isGM: true,
      currentPlayer: null,
      
      // Actions - Maps
      setCurrentMap: (map) => set({ currentMap: map }),
      
      addMap: async (map) => {
        try {
          set({ isLoading: true, error: null });
          
          // Always create map in API - maps are independent of campaigns
          const mapData: any = {
            name: map.name,
            description: map.description || '',
            widthPx: map.widthPx,
            heightPx: map.heightPx,
            gridSize: 50,
            gridType: 'square'
          };
          
          // Include assetId if available (for map images)
          if (map.assetId) {
            mapData.assetId = map.assetId;
          }
          
          // Don't include campaignId - maps are independent
          // Campaigns reference maps via currentMapId
          
          const response = await mapsAPI.create(mapData);
          const transformedMap = transformMapFromAPI(response.map);
          
          set((state) => ({
            maps: [...state.maps, transformedMap]
          }));
          
          return transformedMap;
        } catch (error) {
          set({ error: error instanceof Error ? error.message : 'Failed to add map' });
          throw error;
        } finally {
          set({ isLoading: false });
        }
      },
      
      updateMap: async (id, updates) => {
        try {
          set({ isLoading: true, error: null });
          set((state) => ({
            maps: state.maps.map(map => 
              map.id === id ? { ...map, ...updates, updatedAt: new Date() } : map
            )
          }));
        } catch (error) {
          set({ error: error instanceof Error ? error.message : 'Failed to update map' });
        } finally {
          set({ isLoading: false });
        }
      },
      
      deleteMap: async (id) => {
        try {
          set({ isLoading: true, error: null });
          set((state) => ({
            maps: state.maps.filter(map => map.id !== id),
            currentMap: state.currentMap?.id === id ? null : state.currentMap
          }));
        } catch (error) {
          set({ error: error instanceof Error ? error.message : 'Failed to delete map' });
        } finally {
          set({ isLoading: false });
        }
      },
      
      deactivateMap: () => set({
        currentMap: null,
        currentCampaign: null,
        selectedTokens: { tokenIds: [] },
        viewport: { x: 0, y: 0, zoom: 1, rotation: 0 }
      }),
      
      // Actions - Campaigns
      setCurrentCampaign: async (campaign) => {
        try {
          set({ isLoading: true, error: null });
          set({ currentCampaign: campaign });
          if (campaign) {
            // Load characters, assets, and maps for the campaign
            // Maps are independent - load all maps (not filtered by campaign)
            // Load maps FIRST so they're available when we try to find the campaign's map
            await get().loadMaps();
            await Promise.all([
              get().loadCharacters(campaign.id),
              get().loadAssets(campaign.id)
            ]);
            
            // Automatically load the campaign's current map if it has one
            if (campaign.currentMapId || campaign.mapId) {
              const mapId = campaign.currentMapId || campaign.mapId;
              if (mapId) {
                const state = get();
                console.log('🔍 Looking for map:', mapId, 'Available maps:', state.maps.map(m => m.id));
                const map = state.maps.find(m => m.id === mapId);
                if (map) {
                  console.log('✅ Found map in cache:', map.name, 'URL:', map.tileSource || map.thumbnail);
                  set({ currentMap: map });
                  // Verify the map was set
                  const updatedState = get();
                  console.log('🔍 After setting map, currentMap:', {
                    hasMap: !!updatedState.currentMap,
                    mapId: updatedState.currentMap?.id,
                    mapName: updatedState.currentMap?.name,
                    hasImageUrl: !!(updatedState.currentMap?.tileSource || updatedState.currentMap?.thumbnail)
                  });
                } else {
                  // If map not in cache, fetch it
                  try {
                    console.log('⚠️ Map not in cache, fetching from API:', mapId);
                    const mapData = await mapsAPI.getById(mapId);
                    if (mapData.map) {
                      const transformedMap = transformMapFromAPI(mapData.map);
                      console.log('✅ Fetched map from API:', transformedMap.name, 'URL:', transformedMap.tileSource || transformedMap.thumbnail);
                      set({ currentMap: transformedMap });
                    }
                  } catch (err) {
                    console.error('❌ Failed to load campaign map:', err);
                  }
                }
              }
            }
          } else {
            set({ currentMap: null });
          }
        } catch (error) {
          set({ error: error instanceof Error ? error.message : 'Failed to set current campaign' });
        } finally {
          set({ isLoading: false });
        }
      },
      
      addCampaign: async (campaignData) => {
        try {
          set({ isLoading: true, error: null });
          const response = await campaignsAPI.create(campaignData);
          const newCampaign = response.campaign;
          set((state) => ({
            campaigns: [...state.campaigns, newCampaign]
          }));
        } catch (error) {
          set({ error: error instanceof Error ? error.message : 'Failed to create campaign' });
        } finally {
          set({ isLoading: false });
        }
      },
      
      updateCampaign: async (id, updates) => {
        try {
          set({ isLoading: true, error: null });
          const response = await campaignsAPI.update(id, updates);
          const updatedCampaign = response.campaign;
          set((state) => ({
            campaigns: state.campaigns.map(campaign => 
              campaign.id === id ? updatedCampaign : campaign
            ),
            currentCampaign: state.currentCampaign?.id === id ? updatedCampaign : state.currentCampaign
          }));
        } catch (error) {
          set({ error: error instanceof Error ? error.message : 'Failed to update campaign' });
        } finally {
          set({ isLoading: false });
        }
      },
      
      deleteCampaign: async (id) => {
        try {
          set({ isLoading: true, error: null });
          console.log('🗑️ Deleting campaign:', id);
          await campaignsAPI.delete(id);
          console.log('✅ Campaign deleted from API');
          set((state) => {
            const updatedCampaigns = state.campaigns.filter(campaign => campaign.id !== id);
            console.log('✅ Campaign removed from store. Remaining campaigns:', updatedCampaigns.length);
            return {
              campaigns: updatedCampaigns,
              currentCampaign: state.currentCampaign?.id === id ? null : state.currentCampaign,
              currentMap: state.currentCampaign?.id === id ? null : state.currentMap
            };
          });
        } catch (error) {
          console.error('❌ Failed to delete campaign:', error);
          const errorMessage = error instanceof Error ? error.message : 'Failed to delete campaign';
          set({ error: errorMessage });
          throw error; // Re-throw so the caller can handle it
        } finally {
          set({ isLoading: false });
        }
      },
      
      changeCampaignMap: async (mapId) => {
        try {
          set({ isLoading: true, error: null });
          const state = get();
          
          if (!state.currentCampaign) {
            throw new Error('No active campaign to change map for');
          }
          
          const campaignId = state.currentCampaign.id;
          await campaignsAPI.update(campaignId, { current_map_id: mapId });
          
          // Update campaigns list and current campaign
          set((state) => {
            const updatedCampaign = state.currentCampaign?.id === campaignId 
              ? { ...state.currentCampaign, currentMapId: mapId, mapId: mapId } 
              : state.currentCampaign;
            
            return {
              campaigns: state.campaigns.map(campaign => 
                campaign.id === campaignId ? { ...campaign, currentMapId: mapId, mapId: mapId } : campaign
              ),
              currentCampaign: updatedCampaign
            };
          });
          
          // If this is the current campaign, also load the new map
          const updatedState = get();
          if (updatedState.currentCampaign?.id === campaignId) {
            const map = updatedState.maps.find(m => m.id === mapId);
            if (map) {
              console.log('✅ Found new map in cache:', map.name);
              set({ currentMap: map });
            } else {
              // If map not in cache, fetch it
              try {
                console.log('⚠️ Map not in cache, fetching from API:', mapId);
                const mapData = await mapsAPI.getById(mapId);
                if (mapData.map) {
                  const transformedMap = transformMapFromAPI(mapData.map);
                  console.log('✅ Fetched new map from API:', transformedMap.name);
                  set({ currentMap: transformedMap });
                }
              } catch (err) {
                console.error('❌ Failed to load new campaign map:', err);
              }
            }
          }
        } catch (error) {
          set({ error: error instanceof Error ? error.message : 'Failed to change campaign map' });
        } finally {
          set({ isLoading: false });
        }
      },
      
      // Actions - Characters
      addCharacter: async (characterData) => {
        try {
          set({ isLoading: true, error: null });
          const response = await charactersAPI.create(characterData);
          const newCharacter = response.character;
          set((state) => ({
            characters: [...state.characters, newCharacter]
          }));
        } catch (error) {
          set({ error: error instanceof Error ? error.message : 'Failed to create character' });
        } finally {
          set({ isLoading: false });
        }
      },
      
      updateCharacter: async (id, updates) => {
        try {
          set({ isLoading: true, error: null });
          const response = await charactersAPI.update(id, updates);
          const updatedCharacter = response.character;
          set((state) => ({
            characters: state.characters.map(character => 
              character.id === id ? updatedCharacter : character
            )
          }));
        } catch (error) {
          set({ error: error instanceof Error ? error.message : 'Failed to update character' });
        } finally {
          set({ isLoading: false });
        }
      },
      
      deleteCharacter: async (id) => {
        try {
          set({ isLoading: true, error: null });
          await charactersAPI.delete(id);
          set((state) => ({
            characters: state.characters.filter(character => character.id !== id)
          }));
        } catch (error) {
          set({ error: error instanceof Error ? error.message : 'Failed to delete character' });
        } finally {
          set({ isLoading: false });
        }
      },
      
      // Actions - Assets
      addAsset: async (assetData) => {
        try {
          set({ isLoading: true, error: null });
          // For now, add to local state since we need file upload
          set((state) => ({
            assets: [...state.assets, { ...assetData, id: `asset_${Date.now()}`, uploadedAt: new Date() }]
          }));
        } catch (error) {
          set({ error: error instanceof Error ? error.message : 'Failed to add asset' });
        } finally {
          set({ isLoading: false });
        }
      },
      
      updateAsset: async (id, updates) => {
        try {
          set({ isLoading: true, error: null });
          const response = await assetsAPI.update(id, updates);
          const updatedAsset = response.asset;
          set((state) => ({
            assets: state.assets.map(asset => 
              asset.id === id ? updatedAsset : asset
            )
          }));
        } catch (error) {
          set({ error: error instanceof Error ? error.message : 'Failed to update asset' });
        } finally {
          set({ isLoading: false });
        }
      },
      
      deleteAsset: async (id) => {
        try {
          set({ isLoading: true, error: null });
          await assetsAPI.delete(id);
          set((state) => ({
            assets: state.assets.filter(asset => asset.id !== id)
          }));
        } catch (error) {
          set({ error: error instanceof Error ? error.message : 'Failed to delete asset' });
        } finally {
          set({ isLoading: false });
        }
      },
      
      uploadAsset: async (file, data) => {
        try {
          set({ isLoading: true, error: null });
          const response = await assetsAPI.upload(file, data);
          const newAsset = transformAssetFromAPI(response.asset);
          console.log('✅ Uploaded and transformed asset:', {
            id: newAsset.id,
            name: newAsset.name,
            type: newAsset.type,
            hasUrl: !!newAsset.url
          });
          set((state) => ({
            assets: [...state.assets, newAsset]
          }));
        } catch (error) {
          set({ error: error instanceof Error ? error.message : 'Failed to upload asset' });
        } finally {
          set({ isLoading: false });
        }
      },
      
      // Actions - Combat
      startCombat: (participants) => set((state) => ({
        combat: {
          isActive: true,
          round: 1,
          currentTurnIndex: 0,
          participants
        }
      })),
      
      endCombat: () => set((state) => ({
        combat: {
          isActive: false,
          round: 1,
          currentTurnIndex: 0,
          participants: []
        }
      })),
      
      nextTurn: () => set((state) => {
        if (!state.combat.isActive || state.combat.participants.length === 0) {
          return state;
        }
        
        const nextIndex = (state.combat.currentTurnIndex + 1) % state.combat.participants.length;
        const isNewRound = nextIndex === 0;
        
        return {
          combat: {
            ...state.combat,
            currentTurnIndex: nextIndex,
            round: isNewRound ? state.combat.round + 1 : state.combat.round,
            participants: state.combat.participants.map(p => ({
              ...p,
              hasAction: true,
              hasBonusAction: true
            }))
          }
        };
      }),
      
      consumeAction: (tokenId) => set((state) => ({
        combat: {
          ...state.combat,
          participants: state.combat.participants.map(p =>
            p.tokenId === tokenId ? { ...p, hasAction: false } : p
          )
        }
      })),
      
      consumeBonusAction: (tokenId) => set((state) => ({
        combat: {
          ...state.combat,
          participants: state.combat.participants.map(p =>
            p.tokenId === tokenId ? { ...p, hasBonusAction: false } : p
          )
        }
      })),
      
      // Actions - Tokens (persisted on current campaign)
      addToken: (token) => set((state) => {
        if (!state.currentCampaign) return state;
        const newToken: Token = {
          id: `token_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          name: token.name || 'Token',
          x: token.x ?? 0,
          y: token.y ?? 0,
          size: token.size ?? 1,
          rotation: token.rotation ?? 0,
          sprite: token.sprite || '',
          hp: token.hp || { current: 10, max: 10, temporary: 0 },
          states: token.states || [],
          ownerId: token.ownerId || 'gm',
          layerId: token.layerId || 'tokens',
          locked: !!token.locked,
          visible: token.visible !== false,
          imageScale: token.imageScale ?? 1,
          imageOffsetX: token.imageOffsetX ?? 0,
          imageOffsetY: token.imageOffsetY ?? 0,
          createdAt: new Date(),
          updatedAt: new Date()
        } as Token;

        const updatedCampaign: Campaign = {
          ...state.currentCampaign,
          tokens: [...(state.currentCampaign.tokens || []), newToken],
          updatedAt: new Date()
        } as Campaign;

        return {
          campaigns: state.campaigns.map(c => c.id === updatedCampaign.id ? updatedCampaign : c),
          currentCampaign: updatedCampaign
        };
      }),

      updateToken: (id, updates) => set((state) => {
        if (!state.currentCampaign) return state;
        const tokens = state.currentCampaign.tokens || [];
        const updatedTokens = tokens.map(t => t.id === id ? { ...t, ...updates, updatedAt: new Date() } as Token : t);
        const updatedCampaign: Campaign = { ...state.currentCampaign, tokens: updatedTokens, updatedAt: new Date() } as Campaign;
        return {
          campaigns: state.campaigns.map(c => c.id === updatedCampaign.id ? updatedCampaign : c),
          currentCampaign: updatedCampaign
        };
      }),

      deleteToken: (id) => set((state) => {
        if (!state.currentCampaign) return state;
        const tokens = state.currentCampaign.tokens || [];
        const updatedTokens = tokens.filter(t => t.id !== id);
        const updatedCampaign: Campaign = { ...state.currentCampaign, tokens: updatedTokens, updatedAt: new Date() } as Campaign;
        return {
          campaigns: state.campaigns.map(c => c.id === updatedCampaign.id ? updatedCampaign : c),
          currentCampaign: updatedCampaign
        };
      }),

      moveToken: (event) => set((state) => {
        if (!state.currentCampaign) return state;
        const tokens = state.currentCampaign.tokens || [];
        const updatedTokens = tokens.map(t => t.id === event.tokenId ? { ...t, x: event.newX, y: event.newY, updatedAt: new Date() } as Token : t);
        const updatedCampaign: Campaign = { ...state.currentCampaign, tokens: updatedTokens, updatedAt: new Date() } as Campaign;
        return {
          campaigns: state.campaigns.map(c => c.id === updatedCampaign.id ? updatedCampaign : c),
          currentCampaign: updatedCampaign,
          selectedTokens: { tokenIds: [event.tokenId] }
        };
      }),
      
      selectTokens: (event) => set(() => ({
        selectedTokens: {
          tokenIds: event.tokenIds || []
        }
      })),
      
      // Actions - Viewport
      setViewport: (viewport) => set({ viewport }),
      updateViewport: (viewport) => set((state) => ({ viewport: { ...state.viewport, ...viewport } })),
      resetViewport: () => set({ viewport: { x: 0, y: 0, zoom: 1, rotation: 0 } }),
      
      // Actions - Selection
      setSelection: (selection) => set({ selection }),
      clearSelection: () => set({ selection: { tokenIds: [] } }),
      
      // Actions - Grid
      setGridVisible: (visible) => set({ isGridVisible: visible }),
      setSnapToGrid: (snap) => set({ isSnapToGrid: snap }),
      setGridSize: (size) => set({ gridSize: size }),
      setGridType: (type) => set({ gridType: type }),
      
      // Actions - Layers
      toggleLayerVisibility: (layerId) => set((state) => ({
        layerVisibility: {
          ...state.layerVisibility,
          [layerId]: !state.layerVisibility[layerId]
        }
      })),
      setLayerVisibility: (layerId, visible) => set((state) => ({
        layerVisibility: {
          ...state.layerVisibility,
          [layerId]: visible
        }
      })),
      
      // Actions - GM
      setGM: (isGM) => set({ isGM }),
      toggleGM: () => set((state) => ({ isGM: !state.isGM })),
      
      // Actions - Loading
      setLoading: (loading) => set({ isLoading: loading }),
      setError: (error) => set({ error }),
      
      // Actions - Data loading
      loadCampaigns: async () => {
        try {
          set({ isLoading: true, error: null });
          const response = await campaignsAPI.getAll();
          set({ campaigns: response.campaigns });
        } catch (error) {
          set({ error: error instanceof Error ? error.message : 'Failed to load campaigns' });
        } finally {
          set({ isLoading: false });
        }
      },
      
      loadCharacters: async (campaignId) => {
        try {
          set({ isLoading: true, error: null });
          const response = await charactersAPI.getAll(campaignId);
          set({ characters: response.characters });
        } catch (error) {
          set({ error: error instanceof Error ? error.message : 'Failed to load characters' });
        } finally {
          set({ isLoading: false });
        }
      },
      
      loadAssets: async (campaignId) => {
        try {
          set({ isLoading: true, error: null });
          const response = await assetsAPI.getAll(campaignId);
          console.log('📥 Loaded assets from API:', {
            count: response.assets?.length || 0,
            assets: response.assets?.map((a: any) => ({
              id: a.id,
              name: a.name,
              assetType: a.assetType,
              filePath: a.filePath,
              hasThumbnail: !!a.thumbnailPath
            }))
          });
          // Transform API response to match frontend Asset interface
          const transformedAssets = (response.assets || []).map(transformAssetFromAPI);
          console.log('✅ Transformed assets:', transformedAssets.map((a: Asset) => ({
            id: a.id,
            name: a.name,
            type: a.type,
            hasUrl: !!a.url,
            hasThumbnail: !!a.thumbnail
          })));
          set({ assets: transformedAssets });
        } catch (error) {
          console.error('❌ Failed to load assets:', error);
          set({ error: error instanceof Error ? error.message : 'Failed to load assets' });
        } finally {
          set({ isLoading: false });
        }
      },
      
      loadMaps: async (campaignId) => {
        try {
          set({ isLoading: true, error: null });
          // Maps are independent - don't filter by campaignId
          // If campaignId is provided, ignore it (for backwards compatibility)
          const response = await mapsAPI.getAll();
          console.log('📥 Loaded maps from API:', {
            count: response.maps?.length || 0,
            maps: response.maps?.map((m: any) => ({
              id: m.id,
              name: m.name,
              assetId: m.assetId,
              hasAssetId: !!m.assetId
            }))
          });
          // Transform API response to match frontend Map interface
          const transformedMaps = response.maps.map(transformMapFromAPI);
          console.log('✅ Transformed maps:', transformedMaps.map((m: Map) => ({
            id: m.id,
            name: m.name,
            hasImageUrl: !!(m.tileSource || m.thumbnail)
          })));
          set({ maps: transformedMaps });
        } catch (error) {
          console.error('❌ Failed to load maps:', error);
          set({ error: error instanceof Error ? error.message : 'Failed to load maps' });
        } finally {
          set({ isLoading: false });
        }
      },
      
      // Actions - Export/Import
      exportData: () => {
        const state = get();
        return {
          version: '1.0.0',
          map: state.currentMap || state.maps[0] || {} as Map,
          tokens: state.currentCampaign?.tokens || [], // Get tokens from current campaign
          layers: state.currentMap?.layers || [],
          viewport: state.viewport,
          exportedAt: new Date()
        };
      },
      exportScene: () => {
        const state = get();
        if (!state.currentMap || !state.currentCampaign) return null;
        return {
          version: '1.0.0',
          map: state.currentMap,
          tokens: state.currentCampaign.tokens || [],
          layers: state.currentMap.layers,
          viewport: state.viewport,
          exportedAt: new Date()
        };
      },
      
      importData: (data) => set({
        currentMap: data.map,
        viewport: data.viewport,
        // Other data would need to be handled based on your import strategy
      })
    }),
    {
      name: 'map-store-with-api'
    }
  )
);
