// Core data models for the D&D Map Application

export interface Map {
  id: string;
  name: string;
  widthPx: number;
  heightPx: number;
  tileSource?: string;
  thumbnail: string;
  layers: Layer[];
  createdAt: Date;
  updatedAt: Date;
}

export interface Layer {
  id: string;
  type: LayerType;
  name: string;
  visible: boolean;
  opacity: number;
  locked: boolean;
  gridType?: GridType;
  gridSize?: number;
  order: number;
}

export type LayerType = 'background' | 'grid' | 'tokens' | 'effects' | 'fogOfWar' | 'lights';

export type GridType = 'square' | 'hex';

export interface Token {
  id: string;
  name: string;
  x: number;
  y: number;
  rotation: number;
  size: number;
  sprite: string;
  hp: HealthPoints;
  states: string[];
  ownerId: string;
  layerId: string;
  locked: boolean;
  visible: boolean;
  createdAt: Date;
  updatedAt: Date;
  // Image adjustment properties
  imageScale?: number;
  imageOffsetX?: number;
  imageOffsetY?: number;
}

export interface HealthPoints {
  current: number;
  max: number;
  temporary?: number;
}

export interface Player {
  id: string;
  name: string;
  role: PlayerRole;
  color: string;
  isOnline: boolean;
}

export type PlayerRole = 'gm' | 'player';

export interface Campaign {
  id: string;
  name: string;
  mapId: string;
  tokens: Token[];
  active: boolean;
  description?: string;
  createdAt: Date;
  updatedAt: Date;
  // Store tokens for each map that has been used in this campaign
  mapTokenHistory?: Record<string, Token[]>;
  // Campaign-specific metadata
  sessionNumber?: number;
  lastPlayedAt?: Date;
}

// Keep Scene as alias for backwards compatibility
export type Scene = Campaign;

export interface Asset {
  id: string;
  name: string;
  type: AssetType;
  url: string;
  thumbnail: string;
  size: number;
  uploadedAt: Date;
  // Token-specific fields (only populated when type is 'token')
  tokenData?: TokenAssetData;
}

export interface TokenAssetData {
  // Basic token properties
  hp: HealthPoints;
  states: string[];
  ownerId: string;
  locked: boolean;
  visible: boolean;
  size: number;
  rotation: number;
  // Additional token metadata
  description?: string;
  ac?: number; // Armor Class
  speed?: number; // Movement speed
  stats?: {
    str: number;
    dex: number;
    con: number;
    int: number;
    wis: number;
    cha: number;
  };
  notes?: string;
}

export type AssetType = 'image' | 'token' | 'audio' | 'map';

export interface AudioTrack {
  id: string;
  name: string;
  url: string;
  volume: number;
  loop: boolean;
  fadeIn: number;
  fadeOut: number;
  duration: number;
}

export interface Playlist {
  id: string;
  name: string;
  tracks: AudioTrack[];
  currentTrackIndex: number;
  isPlaying: boolean;
  volume: number;
}

export interface FogOfWar {
  id: string;
  mapId: string;
  maskData: string; // Base64 encoded image data
  revealed: boolean;
}

export interface Light {
  id: string;
  x: number;
  y: number;
  radius: number;
  intensity: number;
  color: string;
  type: LightType;
}

export type LightType = 'point' | 'cone' | 'line';

export interface AOE {
  id: string;
  type: AOEType;
  x: number;
  y: number;
  radius: number;
  angle?: number;
  color: string;
  opacity: number;
  duration?: number;
}

export type AOEType = 'circle' | 'cone' | 'line' | 'square';

export interface Viewport {
  x: number;
  y: number;
  zoom: number;
  rotation: number;
}

export interface Selection {
  tokenIds: string[];
  boxSelection?: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
}

export interface AppState {
  currentMap: Map | null;
  currentCampaign: Campaign | null;
  selectedTokens: Selection;
  viewport: Viewport;
  isGridVisible: boolean;
  isSnapToGrid: boolean;
  gridSize: number;
  gridType: GridType;
  activeLayer: string;
  isGM: boolean;
  currentPlayer: Player | null;
}

// Deprecated: Use currentCampaign instead
export interface LegacyAppState extends Omit<AppState, 'currentCampaign'> {
  currentScene: Scene | null;
}

export interface ExportData {
  version: string;
  map: Map;
  tokens: Token[];
  layers: Layer[];
  viewport: Viewport;
  exportedAt: Date;
}

// Event types for the application
export interface TokenMoveEvent {
  tokenId: string;
  newX: number;
  newY: number;
  oldX: number;
  oldY: number;
}

export interface TokenSelectEvent {
  tokenIds: string[];
  multiSelect: boolean;
}

export interface LayerVisibilityEvent {
  layerId: string;
  visible: boolean;
}

export interface ViewportChangeEvent {
  viewport: Viewport;
}

// Utility types
export type Point2D = {
  x: number;
  y: number;
};

export type Size2D = {
  width: number;
  height: number;
};

export type Bounds = {
  x: number;
  y: number;
  width: number;
  height: number;
};

// Component prop types
export interface MapCanvasProps {
  map: Map | null;
  tokens: Token[];
  selectedTokens: Selection;
  viewport: Viewport;
  onTokenMove: (event: TokenMoveEvent) => void;
  onTokenSelect: (event: TokenSelectEvent) => void;
  onViewportChange: (event: ViewportChangeEvent) => void;
  isGridVisible: boolean;
  isSnapToGrid: boolean;
  gridSize: number;
  gridType: GridType;
}

export interface TokenLayerProps {
  tokens: Token[];
  selectedTokens: Selection;
  onTokenMove: (event: TokenMoveEvent) => void;
  onTokenSelect: (event: TokenSelectEvent) => void;
  isSnapToGrid: boolean;
  gridSize: number;
  gridType: GridType;
  viewport: Viewport;
  mapWidth?: number;
  mapHeight?: number;
}

export interface AssetPanelProps {
  assets: Asset[];
  onAssetSelect: (asset: Asset) => void;
  onAssetUpload: (files: File[]) => void;
  onAssetDelete: (assetId: string) => void;
}

export interface AudioPlayerProps {
  playlist: Playlist;
  onTrackChange: (trackIndex: number) => void;
  onVolumeChange: (volume: number) => void;
  onPlayPause: (isPlaying: boolean) => void;
}

// Authentication types
export interface User {
  id: string;
  email: string;
  username: string;
  displayName: string;
  avatar?: string;
  role: UserRole;
  isEmailVerified: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export type UserRole = 'user' | 'premium' | 'admin';

// D&D Character types
export type CharacterRace = 'human' | 'elf' | 'dwarf' | 'gnome' | 'tiefling';
export type CharacterClass = 'warrior' | 'mage' | 'ranger' | 'rogue' | 'bard';
export type CharacterBackground = 'noble' | 'soldier' | 'sage' | 'criminal' | 'folk_hero' | 'acolyte' | 'entertainer' | 'guild_artisan';
export type ArmorType = 'none' | 'light' | 'medium' | 'heavy' | 'shield';
export type WeaponType = 'sword' | 'axe' | 'mace' | 'dagger' | 'bow' | 'crossbow' | 'staff' | 'wand';
export type BackpackType = 'small' | 'medium' | 'large' | 'magical';

export interface AbilityScores {
  strength: number;
  dexterity: number;
  constitution: number;
  intelligence: number;
  wisdom: number;
  charisma: number;
}

export interface Equipment {
  armor?: {
    type: ArmorType;
    name: string;
    armorClass: number;
  };
  mainWeapon?: {
    type: WeaponType;
    name: string;
    damage: string;
  };
  rangedWeapon?: {
    type: WeaponType;
    name: string;
    damage: string;
    range: string;
  };
  backpack?: {
    type: BackpackType;
    name: string;
    items: string[];
  };
}

export interface Character {
  id: string;
  name: string;
  race: CharacterRace;
  class: CharacterClass;
  level: number;
  abilityScores: AbilityScores;
  equipment: Equipment;
  background: CharacterBackground;
  description: string;
  avatar?: string;
  maxHp: number;
  currentHp: number;
  armorClass: number;
  speed: number;
  initiative: number;
  proficiencyBonus: number;
  startingGold: number;
  createdAt: Date;
  updatedAt: Date;
  // Link to token if placed on map
  tokenId?: string;
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterCredentials {
  email: string;
  username: string;
  displayName: string;
  password: string;
  confirmPassword: string;
}

export interface AuthResponse {
  user: User;
  token: string;
  refreshToken: string;
}

export interface AuthError {
  message: string;
  code?: string;
  field?: string;
}