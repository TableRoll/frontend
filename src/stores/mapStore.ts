import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
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
  Character
} from '../types/models';
import { cleanupStorage, getStorageStats } from '../utils/storageUtils';

interface MapStore extends AppState {
  // Maps
  maps: Map[];
  campaigns: Campaign[];
  // Deprecated: Use campaigns instead
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
  
  // Actions - Maps
  setCurrentMap: (map: Map | null) => void;
  addMap: (map: Map) => void;
  updateMap: (mapId: string, updates: Partial<Map>) => void;
  deleteMap: (mapId: string) => void;
  deactivateMap: () => void;
  
  // Actions - Campaigns
  setCurrentCampaign: (campaign: Campaign | null) => void;
  addCampaign: (campaign: Campaign) => void;
  updateCampaign: (campaignId: string, updates: Partial<Campaign>) => void;
  deleteCampaign: (campaignId: string) => void;
  changeCampaignMap: (mapId: string) => void;
  
  // Deprecated: Use campaign methods instead
  setCurrentScene: (scene: Scene | null) => void;
  addScene: (scene: Scene) => void;
  updateScene: (sceneId: string, updates: Partial<Scene>) => void;
  deleteScene: (sceneId: string) => void;
  changeSceneMap: (mapId: string) => void;
  
  // Actions - Tokens
  addToken: (token: Token) => void;
  updateToken: (tokenId: string, updates: Partial<Token>) => void;
  deleteToken: (tokenId: string) => void;
  moveToken: (event: TokenMoveEvent) => void;
  
  // Actions - Selection
  selectTokens: (event: TokenSelectEvent) => void;
  clearSelection: () => void;
  
  // Actions - Viewport
  updateViewport: (event: ViewportChangeEvent) => void;
  resetViewport: () => void;
  
  // Actions - Grid
  toggleGrid: () => void;
  toggleSnapToGrid: () => void;
  setGridSize: (size: number) => void;
  setGridType: (type: GridType) => void;
  
  // Actions - Layers
  toggleLayerVisibility: (event: LayerVisibilityEvent) => void;
  setActiveLayer: (layerId: string) => void;
  
  // Actions - Characters
  addCharacter: (character: Character) => void;
  updateCharacter: (characterId: string, updates: Partial<Character>) => void;
  deleteCharacter: (characterId: string) => void;
  
  // Actions - Assets
  addAsset: (asset: Asset) => void;
  updateAsset: (assetId: string, updates: Partial<Asset>) => void;
  deleteAsset: (assetId: string) => void;
  
  // Actions - Audio
  setCurrentPlaylist: (playlist: Playlist | null) => void;
  addPlaylist: (playlist: Playlist) => void;
  updatePlaylist: (playlistId: string, updates: Partial<Playlist>) => void;
  deletePlaylist: (playlistId: string) => void;
  
  // Actions - Players
  setCurrentPlayer: (player: Player | null) => void;
  addPlayer: (player: Player) => void;
  updatePlayer: (playerId: string, updates: Partial<Player>) => void;
  deletePlayer: (playerId: string) => void;
  
  // Actions - GM Mode
  toggleGM: () => void;
  
  // Actions - Export/Import
  exportScene: () => ExportData | null;
  importScene: (data: ExportData) => void;
  
  // Actions - Reset
  resetStore: () => void;
  
  // Actions - Storage Management
  getStorageStats: () => any;
  cleanupStorage: () => void;
}

const defaultViewport: Viewport = {
  x: 0,
  y: 0,
  zoom: 1,
  rotation: 0
};

const defaultSelection: Selection = {
  tokenIds: []
};

// Sample data for demonstration
const sampleMaps: Map[] = [
  {
    id: 'sample_map_1',
    name: 'Ruined Keep',
    widthPx: 2048,
    heightPx: 1536,
    thumbnail: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=2048&h=1536&fit=crop',
    tileSource: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=2048&h=1536&fit=crop',
    layers: [
      { id: 'bg', type: 'background', name: 'Background', visible: true, opacity: 1, locked: false, order: 0 },
      { id: 'grid', type: 'grid', name: 'Grid', visible: true, opacity: 0.5, locked: false, order: 1, gridType: 'square', gridSize: 50 },
      { id: 'tokens', type: 'tokens', name: 'Tokens', visible: true, opacity: 1, locked: false, order: 2 }
    ],
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
    updatedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000)  // 1 day ago
  },
  {
    id: 'sample_map_2',
    name: 'Forest Clearing',
    widthPx: 1536,
    heightPx: 1024,
    thumbnail: 'https://images.unsplash.com/photo-1511497584788-876760111969?w=1536&h=1024&fit=crop',
    tileSource: 'https://images.unsplash.com/photo-1511497584788-876760111969?w=1536&h=1024&fit=crop',
    layers: [
      { id: 'bg', type: 'background', name: 'Background', visible: true, opacity: 1, locked: false, order: 0 },
      { id: 'grid', type: 'grid', name: 'Grid', visible: true, opacity: 0.5, locked: false, order: 1, gridType: 'square', gridSize: 50 },
      { id: 'tokens', type: 'tokens', name: 'Tokens', visible: true, opacity: 1, locked: false, order: 2 }
    ],
    createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), // 5 days ago
    updatedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000)  // 3 days ago
  }
];

const sampleCampaigns: Campaign[] = [
  {
    id: 'sample_campaign_1',
    name: 'Lost Mines of Phandelver',
    mapId: 'sample_map_1',
    tokens: [],
    active: false,
    description: 'A classic adventure for beginning characters',
    createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // 1 day ago
    updatedAt: new Date(Date.now() - 12 * 60 * 60 * 1000),     // 12 hours ago
    lastPlayedAt: new Date(Date.now() - 12 * 60 * 60 * 1000),
    sessionNumber: 3,
    mapTokenHistory: {}
  },
  {
    id: 'sample_campaign_2',
    name: 'Curse of Strahd',
    mapId: 'sample_map_2',
    tokens: [],
    active: false,
    description: 'Gothic horror adventure in Barovia',
    createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // 3 days ago
    updatedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
    lastPlayedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
    sessionNumber: 1,
    mapTokenHistory: {}
  }
];

// Backwards compatibility
const sampleScenes = sampleCampaigns;

const sampleAssets: Asset[] = [
  {
    id: 'sample_asset_1',
    name: 'Goblin Token',
    type: 'image',
    url: 'https://images.unsplash.com/photo-1578632767115-351597cf2477?w=200&h=200&fit=crop',
    thumbnail: 'https://images.unsplash.com/photo-1578632767115-351597cf2477?w=200&h=200&fit=crop',
    size: 1024,
    uploadedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000) // 3 days ago
  }
];

const samplePlaylists: Playlist[] = [
  {
    id: 'sample_playlist_1',
    name: 'Battle Music',
    tracks: [],
    currentTrackIndex: 0,
    isPlaying: false,
    volume: 0.7
  }
];

const defaultState: AppState = {
  currentMap: null,
  currentCampaign: null,
  selectedTokens: defaultSelection,
  viewport: defaultViewport,
  isGridVisible: true,
  isSnapToGrid: true,
  gridSize: 50,
  gridType: 'square',
  activeLayer: 'tokens',
  isGM: true,
  currentPlayer: {
    id: 'gm_1',
    name: 'Game Master',
    role: 'gm',
    color: '#339af0',
    isOnline: true
  }
};

// Helper function to check and cleanup storage if needed
const checkAndCleanupStorage = () => {
  const stats = getStorageStats();
  if (stats.needsCleanup) {
    cleanupStorage();
  }
};

export const useMapStore = create<MapStore>()(
  devtools(
    persist(
      (set, get) => ({
        ...defaultState,
        maps: sampleMaps,
        campaigns: sampleCampaigns,
        scenes: sampleScenes, // Backwards compatibility
        characters: [], // No sample characters, users create their own
        assets: sampleAssets,
        playlists: samplePlaylists,
        currentPlaylist: null,
        players: [defaultState.currentPlayer!],

        // Maps
        setCurrentMap: (map) => set((state) => {
          if (!map) {
            return { currentMap: null, currentCampaign: null };
          }
          
          // Only set map if there's an active campaign
          if (!state.currentCampaign) {
            return state;
          }
          
          // Update the current campaign to use this map
          const updatedCampaign = {
            ...state.currentCampaign,
            mapId: map.id,
            updatedAt: new Date()
          };
          
          return { 
            currentMap: map, 
            currentCampaign: updatedCampaign,
            campaigns: state.campaigns.map(campaign => 
              campaign.id === state.currentCampaign!.id ? updatedCampaign : campaign
            ),
            scenes: state.scenes.map(scene => 
              scene.id === state.currentCampaign!.id ? updatedCampaign : scene
            )
          };
        }),
        addMap: (map) => set((state) => ({ maps: [...state.maps, map] })),
        updateMap: (mapId, updates) => set((state) => ({
          maps: state.maps.map(map => 
            map.id === mapId ? { ...map, ...updates } : map
          ),
          currentMap: state.currentMap?.id === mapId 
            ? { ...state.currentMap, ...updates } 
            : state.currentMap
        })),
        deleteMap: (mapId) => set((state) => ({
          maps: state.maps.filter(map => map.id !== mapId),
          currentMap: state.currentMap?.id === mapId ? null : state.currentMap
        })),
        deactivateMap: () => set((state) => ({
          currentMap: null,
          currentCampaign: null,
          selectedTokens: { tokenIds: [] },
          viewport: { x: 0, y: 0, zoom: 1, rotation: 0 }
        })),

        // Campaigns
        setCurrentCampaign: (campaign) => set((state) => {
          if (!campaign) {
            return { currentCampaign: null, currentMap: null };
          }
          
          // Save current campaign's tokens before switching
          if (state.currentCampaign) {
            const updatedCampaigns = state.campaigns.map(c => 
              c.id === state.currentCampaign!.id 
                ? { ...c, tokens: state.currentCampaign!.tokens, updatedAt: new Date(), lastPlayedAt: new Date() }
                : c
            );
            
            // Find the map associated with the new campaign
            const associatedMap = state.maps.find(map => map.id === campaign.mapId);
            
            return { 
              campaigns: updatedCampaigns,
              scenes: updatedCampaigns, // Keep in sync
              currentCampaign: { ...campaign, lastPlayedAt: new Date() },
              currentMap: associatedMap || null,
              selectedTokens: defaultSelection,
              viewport: defaultViewport
            };
          }
          
          // First campaign activation
          const associatedMap = state.maps.find(map => map.id === campaign.mapId);
          
          return { 
            currentCampaign: { ...campaign, lastPlayedAt: new Date() },
            currentMap: associatedMap || null,
            selectedTokens: defaultSelection,
            viewport: defaultViewport
          };
        }),
        addCampaign: (campaign) => set((state) => ({
          campaigns: [...state.campaigns, campaign],
          scenes: [...state.scenes, campaign]
        })),
        updateCampaign: (campaignId, updates) => set((state) => ({
          campaigns: state.campaigns.map(campaign => 
            campaign.id === campaignId ? { ...campaign, ...updates } : campaign
          ),
          scenes: state.scenes.map(scene => 
            scene.id === campaignId ? { ...scene, ...updates } : scene
          ),
          currentCampaign: state.currentCampaign?.id === campaignId 
            ? { ...state.currentCampaign, ...updates } 
            : state.currentCampaign
        })),
        deleteCampaign: (campaignId) => set((state) => ({
          campaigns: state.campaigns.filter(campaign => campaign.id !== campaignId),
          scenes: state.scenes.filter(scene => scene.id !== campaignId),
          currentCampaign: state.currentCampaign?.id === campaignId ? null : state.currentCampaign
        })),
        changeCampaignMap: (mapId) => set((state) => {
          if (!state.currentCampaign) {
            console.warn('No active campaign to change map for');
            return state;
          }
          
          // Find the new map
          const newMap = state.maps.find(map => map.id === mapId);
          if (!newMap) {
            console.warn(`Map with id ${mapId} not found`);
            return state;
          }
          
          // If trying to switch to the same map, do nothing
          if (state.currentCampaign.mapId === mapId) {
            return state;
          }
          
          // Initialize mapTokenHistory if it doesn't exist
          const mapTokenHistory = state.currentCampaign.mapTokenHistory || {};
          
          // Save current map's tokens to history
          const updatedHistory = {
            ...mapTokenHistory,
            [state.currentCampaign.mapId]: [...state.currentCampaign.tokens]
          };
          
          // Retrieve tokens for the new map from history, or use empty array if new
          const tokensForNewMap = updatedHistory[mapId] || [];
          
          const updatedCampaign = {
            ...state.currentCampaign,
            mapId: mapId,
            tokens: tokensForNewMap,
            mapTokenHistory: updatedHistory,
            updatedAt: new Date()
          };
          
          return {
            currentMap: newMap,
            currentCampaign: updatedCampaign,
            campaigns: state.campaigns.map(campaign => 
              campaign.id === state.currentCampaign!.id ? updatedCampaign : campaign
            ),
            scenes: state.scenes.map(scene => 
              scene.id === state.currentCampaign!.id ? updatedCampaign : scene
            ),
            selectedTokens: defaultSelection,
            viewport: defaultViewport
          };
        }),

        // Deprecated Scene methods - for backwards compatibility
        setCurrentScene: (scene) => {
          const store = get();
          store.setCurrentCampaign(scene);
        },
        addScene: (scene) => {
          const store = get();
          store.addCampaign(scene);
        },
        updateScene: (sceneId, updates) => {
          const store = get();
          store.updateCampaign(sceneId, updates);
        },
        deleteScene: (sceneId) => {
          const store = get();
          store.deleteCampaign(sceneId);
        },
        changeSceneMap: (mapId) => {
          const store = get();
          store.changeCampaignMap(mapId);
        },


        // Tokens (works with campaigns)
        addToken: (token) => set((state) => ({
          campaigns: state.campaigns.map(campaign => 
            campaign.id === state.currentCampaign?.id 
              ? { ...campaign, tokens: [...campaign.tokens, token] }
              : campaign
          ),
          scenes: state.scenes.map(scene => 
            scene.id === state.currentCampaign?.id 
              ? { ...scene, tokens: [...scene.tokens, token] }
              : scene
          ),
          currentCampaign: state.currentCampaign 
            ? { ...state.currentCampaign, tokens: [...state.currentCampaign.tokens, token] }
            : null
        })),
        updateToken: (tokenId, updates) => set((state) => ({
          campaigns: state.campaigns.map(campaign => ({
            ...campaign,
            tokens: campaign.tokens.map(token => 
              token.id === tokenId ? { ...token, ...updates } : token
            )
          })),
          scenes: state.scenes.map(scene => ({
            ...scene,
            tokens: scene.tokens.map(token => 
              token.id === tokenId ? { ...token, ...updates } : token
            )
          })),
          currentCampaign: state.currentCampaign 
            ? {
                ...state.currentCampaign,
                tokens: state.currentCampaign.tokens.map(token => 
                  token.id === tokenId ? { ...token, ...updates } : token
                )
              }
            : null
        })),
        deleteToken: (tokenId) => set((state) => ({
          campaigns: state.campaigns.map(campaign => ({
            ...campaign,
            tokens: campaign.tokens.filter(token => token.id !== tokenId)
          })),
          scenes: state.scenes.map(scene => ({
            ...scene,
            tokens: scene.tokens.filter(token => token.id !== tokenId)
          })),
          currentCampaign: state.currentCampaign 
            ? {
                ...state.currentCampaign,
                tokens: state.currentCampaign.tokens.filter(token => token.id !== tokenId)
              }
            : null,
          selectedTokens: {
            ...state.selectedTokens,
            tokenIds: state.selectedTokens.tokenIds.filter(id => id !== tokenId)
          }
        })),
        moveToken: (event) => set((state) => ({
          campaigns: state.campaigns.map(campaign => ({
            ...campaign,
            tokens: campaign.tokens.map(token => 
              token.id === event.tokenId 
                ? { ...token, x: event.newX, y: event.newY }
                : token
            )
          })),
          scenes: state.scenes.map(scene => ({
            ...scene,
            tokens: scene.tokens.map(token => 
              token.id === event.tokenId 
                ? { ...token, x: event.newX, y: event.newY }
                : token
            )
          })),
          currentCampaign: state.currentCampaign 
            ? {
                ...state.currentCampaign,
                tokens: state.currentCampaign.tokens.map(token => 
                  token.id === event.tokenId 
                    ? { ...token, x: event.newX, y: event.newY }
                    : token
                )
              }
            : null
        })),

        // Selection
        selectTokens: (event) => set((state) => ({
          selectedTokens: {
            tokenIds: event.tokenIds,
            boxSelection: event.multiSelect ? state.selectedTokens.boxSelection : undefined
          }
        })),
        clearSelection: () => set({ selectedTokens: defaultSelection }),

        // Viewport
        updateViewport: (event) => {
          checkAndCleanupStorage();
          set({ viewport: event.viewport });
        },
        resetViewport: () => set({ viewport: defaultViewport }),

        // Grid
        toggleGrid: () => set((state) => ({ isGridVisible: !state.isGridVisible })),
        toggleSnapToGrid: () => set((state) => ({ isSnapToGrid: !state.isSnapToGrid })),
        setGridSize: (size) => set({ gridSize: size }),
        setGridType: (type) => set({ gridType: type }),

        // Layers
        toggleLayerVisibility: (event) => set((state) => ({
          currentMap: state.currentMap 
            ? {
                ...state.currentMap,
                layers: state.currentMap.layers.map(layer => 
                  layer.id === event.layerId 
                    ? { ...layer, visible: event.visible }
                    : layer
                )
              }
            : null
        })),
        setActiveLayer: (layerId) => set({ activeLayer: layerId }),

        // Characters
        addCharacter: (character) => set((state) => ({ 
          characters: [...state.characters, character] 
        })),
        updateCharacter: (characterId, updates) => set((state) => ({
          characters: state.characters.map(character => 
            character.id === characterId ? { ...character, ...updates, updatedAt: new Date() } : character
          )
        })),
        deleteCharacter: (characterId) => set((state) => ({
          characters: state.characters.filter(character => character.id !== characterId)
        })),

        // Assets
        addAsset: (asset) => {
          checkAndCleanupStorage();
          set((state) => ({ assets: [...state.assets, asset] }));
        },
        updateAsset: (assetId, updates) => set((state) => ({
          assets: state.assets.map(asset => 
            asset.id === assetId ? { ...asset, ...updates } : asset
          )
        })),
        deleteAsset: (assetId) => set((state) => ({
          assets: state.assets.filter(asset => asset.id !== assetId)
        })),

        // Audio
        setCurrentPlaylist: (playlist) => set({ currentPlaylist: playlist }),
        addPlaylist: (playlist) => set((state) => ({ playlists: [...state.playlists, playlist] })),
        updatePlaylist: (playlistId, updates) => set((state) => ({
          playlists: state.playlists.map(playlist => 
            playlist.id === playlistId ? { ...playlist, ...updates } : playlist
          ),
          currentPlaylist: state.currentPlaylist?.id === playlistId 
            ? { ...state.currentPlaylist, ...updates } 
            : state.currentPlaylist
        })),
        deletePlaylist: (playlistId) => set((state) => ({
          playlists: state.playlists.filter(playlist => playlist.id !== playlistId),
          currentPlaylist: state.currentPlaylist?.id === playlistId ? null : state.currentPlaylist
        })),

        // Players
        setCurrentPlayer: (player) => set({ currentPlayer: player }),
        addPlayer: (player) => set((state) => ({ players: [...state.players, player] })),
        updatePlayer: (playerId, updates) => set((state) => ({
          players: state.players.map(player => 
            player.id === playerId ? { ...player, ...updates } : player
          ),
          currentPlayer: state.currentPlayer?.id === playerId 
            ? { ...state.currentPlayer, ...updates } 
            : state.currentPlayer
        })),
        deletePlayer: (playerId) => set((state) => ({
          players: state.players.filter(player => player.id !== playerId),
          currentPlayer: state.currentPlayer?.id === playerId ? null : state.currentPlayer
        })),

        // GM Mode
        toggleGM: () => set((state) => ({ isGM: !state.isGM })),

        // Export/Import
        exportScene: () => {
          const state = get();
          if (!state.currentMap || !state.currentCampaign) return null;
          
          return {
            version: '1.0.0',
            map: state.currentMap,
            tokens: state.currentCampaign.tokens,
            layers: state.currentMap.layers,
            viewport: state.viewport,
            exportedAt: new Date()
          };
        },
        importScene: (data) => {
          set((state) => ({
            currentMap: data.map,
            currentCampaign: {
              id: `imported_${Date.now()}`,
              name: `${data.map.name} - Imported Campaign`,
              mapId: data.map.id,
              tokens: data.tokens,
              active: true,
              createdAt: new Date(),
              updatedAt: new Date(),
              lastPlayedAt: new Date(),
              mapTokenHistory: {}
            },
            campaigns: [...state.campaigns, {
              id: `imported_${Date.now()}`,
              name: `${data.map.name} - Imported Campaign`,
              mapId: data.map.id,
              tokens: data.tokens,
              active: true,
              createdAt: new Date(),
              updatedAt: new Date(),
              lastPlayedAt: new Date(),
              mapTokenHistory: {}
            }],
            scenes: [...state.scenes, {
              id: `imported_${Date.now()}`,
              name: `${data.map.name} - Imported Campaign`,
              mapId: data.map.id,
              tokens: data.tokens,
              active: true,
              createdAt: new Date(),
              updatedAt: new Date(),
              lastPlayedAt: new Date(),
              mapTokenHistory: {}
            }],
            viewport: data.viewport,
            maps: [...state.maps.filter(m => m.id !== data.map.id), data.map]
          }));
        },

        // Reset
        resetStore: () => set(defaultState),
        
        // Storage Management
        getStorageStats: () => getStorageStats(),
        cleanupStorage: () => cleanupStorage()
      }),
      {
        name: 'dnd-map-store',
        partialize: (state) => ({
          // Only persist essential data, exclude large objects
          maps: state.maps.map(map => ({
            ...map,
            // Remove large image data from persistence
            thumbnail: undefined,
            tileSource: undefined
          })),
          campaigns: state.campaigns.map(campaign => ({
            ...campaign,
            // Keep tokens but limit their data
            tokens: campaign.tokens.map(token => ({
              ...token,
              // Remove large sprite data
              sprite: undefined
            }))
          })),
          scenes: state.scenes.map(scene => ({
            ...scene,
            // Keep tokens but limit their data
            tokens: scene.tokens.map(token => ({
              ...token,
              // Remove large sprite data
              sprite: undefined
            }))
          })),
          characters: state.characters.map(character => ({
            ...character,
            // Remove avatar image data
            avatar: undefined
          })),
          assets: state.assets.map(asset => ({
            ...asset,
            // Remove large image data
            url: undefined,
            thumbnail: undefined
          })),
          playlists: state.playlists,
          players: state.players,
          currentPlayer: state.currentPlayer,
          isGM: state.isGM,
          // Don't persist current map/campaign to avoid large data
          currentMap: null,
          currentCampaign: null,
          // Don't persist viewport as it changes frequently
          viewport: defaultViewport,
          selectedTokens: defaultSelection
        })
      }
    ),
    {
      name: 'dnd-map-store'
    }
  )
);
