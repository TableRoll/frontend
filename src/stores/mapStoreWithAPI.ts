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
  setAuthToken,
  removeAuthToken,
  isAuthenticated
} from '../services/api';

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
  addMap: (map: Map) => Promise<void>;
  updateMap: (id: string, updates: Partial<Map>) => Promise<void>;
  deleteMap: (id: string) => Promise<void>;
  
  // Actions - Campaigns
  setCurrentCampaign: (campaign: Campaign | null) => Promise<void>;
  addCampaign: (campaign: Omit<Campaign, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  updateCampaign: (id: string, updates: Partial<Campaign>) => Promise<void>;
  deleteCampaign: (id: string) => Promise<void>;
  changeCampaignMap: (campaignId: string, mapId: string) => Promise<void>;
  
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
  
  // Actions - Tokens
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
  
  // Actions - Loading
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  
  // Actions - Data loading
  loadCampaigns: () => Promise<void>;
  loadCharacters: (campaignId?: string) => Promise<void>;
  loadAssets: (campaignId?: string) => Promise<void>;
  
  // Actions - Export/Import
  exportData: () => ExportData;
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
          // For now, we'll add to local state since maps aren't in the API yet
          set((state) => ({
            maps: [...state.maps, { ...map, id: `map_${Date.now()}`, createdAt: new Date(), updatedAt: new Date() }]
          }));
        } catch (error) {
          set({ error: error instanceof Error ? error.message : 'Failed to add map' });
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
      
      // Actions - Campaigns
      setCurrentCampaign: async (campaign) => {
        try {
          set({ isLoading: true, error: null });
          set({ currentCampaign: campaign });
          if (campaign) {
            // Load characters and assets for the campaign
            await get().loadCharacters(campaign.id);
            await get().loadAssets(campaign.id);
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
          await campaignsAPI.delete(id);
          set((state) => ({
            campaigns: state.campaigns.filter(campaign => campaign.id !== id),
            currentCampaign: state.currentCampaign?.id === id ? null : state.currentCampaign
          }));
        } catch (error) {
          set({ error: error instanceof Error ? error.message : 'Failed to delete campaign' });
        } finally {
          set({ isLoading: false });
        }
      },
      
      changeCampaignMap: async (campaignId, mapId) => {
        try {
          set({ isLoading: true, error: null });
          await campaignsAPI.update(campaignId, { current_map_id: mapId });
          set((state) => ({
            campaigns: state.campaigns.map(campaign => 
              campaign.id === campaignId ? { ...campaign, currentMapId: mapId } : campaign
            )
          }));
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
          const newAsset = response.asset;
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
      
      // Actions - Tokens
      addToken: (token) => set((state) => ({
        // This would need to be implemented based on your token storage strategy
        // For now, we'll just add to local state
      })),
      
      updateToken: (id, updates) => set((state) => ({
        // This would need to be implemented based on your token storage strategy
      })),
      
      deleteToken: (id) => set((state) => ({
        // This would need to be implemented based on your token storage strategy
      })),
      
      moveToken: (event) => set((state) => ({
        // This would need to be implemented based on your token storage strategy
        // For now, we'll just update the selected tokens
        selectedTokens: {
          ...state.selectedTokens,
          tokenIds: [event.tokenId]
        }
      })),
      
      selectTokens: (event) => set((state) => ({
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
          set({ assets: response.assets });
        } catch (error) {
          set({ error: error instanceof Error ? error.message : 'Failed to load assets' });
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
          tokens: [], // This would need to be implemented based on your token storage
          layers: state.currentMap?.layers || [],
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
