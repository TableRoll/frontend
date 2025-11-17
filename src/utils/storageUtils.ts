// Storage utilities for managing localStorage quota

export const STORAGE_KEYS = {
  MAP_STORE: 'dnd-map-store',
  AUTH_STORE: 'auth-store'
} as const;

export const STORAGE_LIMITS = {
  MAX_SIZE: 2 * 1024 * 1024, // 2MB
  WARNING_SIZE: 1.5 * 1024 * 1024 // 1.5MB
} as const;

/**
 * Check if localStorage is approaching its limit
 */
export const checkStorageSize = (): { size: number; percentage: number; needsCleanup: boolean } => {
  try {
    let totalSize = 0;
    
    // Calculate total localStorage size
    for (let key in localStorage) {
      if (localStorage.hasOwnProperty(key)) {
        totalSize += localStorage[key].length;
      }
    }
    
    const percentage = (totalSize / STORAGE_LIMITS.MAX_SIZE) * 100;
    const needsCleanup = totalSize > STORAGE_LIMITS.WARNING_SIZE;
    
    return { size: totalSize, percentage, needsCleanup };
  } catch (error) {
    console.warn('Failed to check storage size:', error);
    return { size: 0, percentage: 0, needsCleanup: false };
  }
};

/**
 * Clear old or large data from localStorage
 */
export const cleanupStorage = (): void => {
  try {
    const { needsCleanup } = checkStorageSize();
    
    if (needsCleanup) {
      console.warn('LocalStorage approaching limit, cleaning up...');
      
      // Clear old data (keep only essential stores)
      const keysToKeep = Object.values(STORAGE_KEYS);
      const keysToRemove: string[] = [];
      
      for (let key in localStorage) {
        if (localStorage.hasOwnProperty(key) && !keysToKeep.includes(key as any)) {
          keysToRemove.push(key);
        }
      }
      
      // Remove non-essential keys
      keysToRemove.forEach(key => {
        localStorage.removeItem(key);
      });
      
      console.log(`Cleaned up ${keysToRemove.length} localStorage keys`);
    }
  } catch (error) {
    console.warn('Failed to cleanup storage:', error);
  }
};

/**
 * Safely set localStorage item with size checking
 */
export const safeSetItem = (key: string, value: string): boolean => {
  try {
    // Check if adding this item would exceed limits
    const currentSize = localStorage.getItem(key)?.length || 0;
    const newSize = value.length;
    const sizeIncrease = newSize - currentSize;
    
    const { size: totalSize } = checkStorageSize();
    
    if (totalSize + sizeIncrease > STORAGE_LIMITS.MAX_SIZE) {
      console.warn(`Storage limit would be exceeded. Current: ${totalSize}, Adding: ${sizeIncrease}`);
      cleanupStorage();
      
      // Try again after cleanup
      if (totalSize + sizeIncrease > STORAGE_LIMITS.MAX_SIZE) {
        console.error('Storage limit still exceeded after cleanup');
        return false;
      }
    }
    
    localStorage.setItem(key, value);
    return true;
  } catch (error) {
    console.error('Failed to set localStorage item:', error);
    return false;
  }
};

/**
 * Get storage usage statistics
 */
export const getStorageStats = () => {
  const { size, percentage, needsCleanup } = checkStorageSize();
  
  return {
    used: size,
    limit: STORAGE_LIMITS.MAX_SIZE,
    percentage: Math.round(percentage),
    needsCleanup,
    warning: percentage > 80,
    critical: percentage > 95
  };
};




