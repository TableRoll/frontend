// Utility functions for handling map tiles and high-resolution images

export interface TileInfo {
  x: number;
  y: number;
  z: number;
  url: string;
}

export interface TileBounds {
  minX: number;
  minY: number;
  maxX: number;
  maxY: number;
}

/**
 * Calculate tile coordinates for a given zoom level and pixel coordinates
 */
export function pixelToTile(x: number, y: number, zoom: number, tileSize: number = 256): { x: number; y: number } {
  const scale = Math.pow(2, zoom);
  const tileX = Math.floor(x / (tileSize * scale));
  const tileY = Math.floor(y / (tileSize * scale));
  return { x: tileX, y: tileY };
}

/**
 * Calculate pixel coordinates from tile coordinates
 */
export function tileToPixel(tileX: number, tileY: number, zoom: number, tileSize: number = 256): { x: number; y: number } {
  const scale = Math.pow(2, zoom);
  const x = tileX * tileSize * scale;
  const y = tileY * tileSize * scale;
  return { x, y };
}

/**
 * Get all tiles needed for a given viewport
 */
export function getTilesForViewport(
  viewport: { x: number; y: number; width: number; height: number },
  zoom: number,
  tileSize: number = 256
): TileInfo[] {
  const tiles: TileInfo[] = [];
  const scale = Math.pow(2, zoom);
  
  const minTile = pixelToTile(viewport.x, viewport.y, zoom, tileSize);
  const maxTile = pixelToTile(viewport.x + viewport.width, viewport.y + viewport.height, zoom, tileSize);
  
  for (let x = minTile.x; x <= maxTile.x; x++) {
    for (let y = minTile.y; y <= maxTile.y; y++) {
      tiles.push({
        x,
        y,
        z: zoom,
        url: `tiles/${zoom}/${x}/${y}.png` // This would be replaced with actual tile URL
      });
    }
  }
  
  return tiles;
}

/**
 * Calculate optimal zoom level for a given map size and container size
 */
export function calculateOptimalZoom(
  mapWidth: number,
  mapHeight: number,
  containerWidth: number,
  containerHeight: number,
  tileSize: number = 256
): number {
  const scaleX = containerWidth / mapWidth;
  const scaleY = containerHeight / mapHeight;
  const scale = Math.min(scaleX, scaleY);
  
  return Math.log2(scale * tileSize / 256);
}

/**
 * Generate Deep Zoom Image (DZI) tile URL
 */
export function generateDZITileUrl(
  baseUrl: string,
  level: number,
  x: number,
  y: number,
  format: string = 'jpg'
): string {
  return `${baseUrl}_files/${level}/${x}_${y}.${format}`;
}

/**
 * Calculate tile bounds for a given zoom level
 */
export function getTileBounds(zoom: number): TileBounds {
  const maxTiles = Math.pow(2, zoom);
  return {
    minX: 0,
    minY: 0,
    maxX: maxTiles - 1,
    maxY: maxTiles - 1
  };
}

/**
 * Check if a tile coordinate is valid for a given zoom level
 */
export function isValidTile(x: number, y: number, zoom: number): boolean {
  const bounds = getTileBounds(zoom);
  return x >= bounds.minX && x <= bounds.maxX && y >= bounds.minY && y <= bounds.maxY;
}

/**
 * Convert between different tile coordinate systems
 */
export function convertTileCoordinates(
  x: number,
  y: number,
  fromZoom: number,
  toZoom: number
): { x: number; y: number } {
  const scale = Math.pow(2, toZoom - fromZoom);
  return {
    x: Math.floor(x * scale),
    y: Math.floor(y * scale)
  };
}

/**
 * Calculate the center point of a tile
 */
export function getTileCenter(x: number, y: number, zoom: number, tileSize: number = 256): { x: number; y: number } {
  const pixel = tileToPixel(x, y, zoom, tileSize);
  return {
    x: pixel.x + tileSize / 2,
    y: pixel.y + tileSize / 2
  };
}

/**
 * Preload tiles for smooth panning
 */
export function preloadTiles(tiles: TileInfo[]): Promise<void[]> {
  const promises = tiles.map(tile => {
    return new Promise<void>((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve();
      img.onerror = () => reject(new Error(`Failed to load tile: ${tile.url}`));
      img.src = tile.url;
    });
  });
  
  return Promise.all(promises);
}

/**
 * Calculate memory usage for loaded tiles
 */
export function calculateTileMemoryUsage(tileCount: number, tileSize: number = 256): number {
  // Assuming 4 bytes per pixel (RGBA)
  const bytesPerTile = tileSize * tileSize * 4;
  return tileCount * bytesPerTile;
}

/**
 * Generate tile cache key
 */
export function generateTileCacheKey(x: number, y: number, z: number): string {
  return `${z}_${x}_${y}`;
}

/**
 * Parse tile cache key
 */
export function parseTileCacheKey(key: string): { x: number; y: number; z: number } | null {
  const parts = key.split('_');
  if (parts.length !== 3) return null;
  
  const z = parseInt(parts[0], 10);
  const x = parseInt(parts[1], 10);
  const y = parseInt(parts[2], 10);
  
  if (isNaN(x) || isNaN(y) || isNaN(z)) return null;
  
  return { x, y, z };
}
