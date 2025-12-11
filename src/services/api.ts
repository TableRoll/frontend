// API service for communicating with the database backend
const API_BASE_URL = process.env.REACT_APP_API_URL;

// Helper function to get auth token
const getAuthToken = (): string | null => {
  return localStorage.getItem('authToken');
};

// Mock authentication for development
const getMockToken = (): string => {
  // For development, we'll use a mock token
  // In production, this should come from a real login
  return 'mock-token-for-development';
};

// Helper function to make API requests
const apiRequest = async (endpoint: string, options: RequestInit = {}) => {
  const token = getAuthToken() || getMockToken();
  
  const config: RequestInit = {
    headers: {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
      ...options.headers,
    },
    ...options,
  };

  const response = await fetch(`${API_BASE_URL}${endpoint}`, config);
  
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
  }

  return response.json();
};

// Authentication API
export const authAPI = {
  register: async (credentials: {
    email: string;
    username: string;
    displayName: string;
    password: string;
    confirmPassword: string;
  }) => {
    return apiRequest('/auth/register', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
  },

  login: async (credentials: { email: string; password: string }) => {
    return apiRequest('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
  },

  getProfile: async () => {
    return apiRequest('/auth/profile');
  },

  updateProfile: async (data: { displayName?: string; username?: string }) => {
    return apiRequest('/auth/profile', {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },
};

// Characters API
export const charactersAPI = {
  getAll: async (campaignId?: string) => {
    const params = campaignId ? `?campaignId=${campaignId}` : '';
    return apiRequest(`/characters${params}`);
  },

  getById: async (id: string) => {
    return apiRequest(`/characters/${id}`);
  },

  create: async (character: any) => {
    return apiRequest('/characters', {
      method: 'POST',
      body: JSON.stringify(character),
    });
  },

  update: async (id: string, character: any) => {
    return apiRequest(`/characters/${id}`, {
      method: 'PUT',
      body: JSON.stringify(character),
    });
  },

  delete: async (id: string) => {
    return apiRequest(`/characters/${id}`, {
      method: 'DELETE',
    });
  },

  getRaces: async () => {
    return apiRequest('/characters/reference/races');
  },

  getClasses: async () => {
    return apiRequest('/characters/reference/classes');
  },

  getBackgrounds: async () => {
    return apiRequest('/characters/reference/backgrounds');
  },
};

// Campaigns API
export const campaignsAPI = {
  getAll: async () => {
    return apiRequest('/campaigns');
  },

  getById: async (id: string) => {
    return apiRequest(`/campaigns/${id}`);
  },

  create: async (campaign: { name: string; description?: string }) => {
    return apiRequest('/campaigns', {
      method: 'POST',
      body: JSON.stringify(campaign),
    });
  },

  update: async (id: string, campaign: any) => {
    return apiRequest(`/campaigns/${id}`, {
      method: 'PUT',
      body: JSON.stringify(campaign),
    });
  },

  delete: async (id: string) => {
    return apiRequest(`/campaigns/${id}`, {
      method: 'DELETE',
    });
  },

  createSession: async (campaignId: string, session: { name: string; description?: string; maxPlayers?: number }) => {
    return apiRequest(`/campaigns/${campaignId}/sessions`, {
      method: 'POST',
      body: JSON.stringify(session),
    });
  },
};

// Assets API
export const assetsAPI = {
  getAll: async (campaignId?: string, assetType?: string) => {
    const params = new URLSearchParams();
    if (campaignId) params.append('campaignId', campaignId);
    if (assetType) params.append('assetType', assetType);
    const queryString = params.toString();
    return apiRequest(`/assets${queryString ? `?${queryString}` : ''}`);
  },

  getById: async (id: string) => {
    return apiRequest(`/assets/${id}`);
  },

  upload: async (file: File, data: { name: string; assetType: string; campaignId?: string; isPublic?: boolean }) => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('name', data.name);
    formData.append('assetType', data.assetType);
    if (data.campaignId) formData.append('campaignId', data.campaignId);
    if (data.isPublic !== undefined) formData.append('isPublic', data.isPublic.toString());

    const token = getAuthToken();
    const response = await fetch(`${API_BASE_URL}/assets/upload`, {
      method: 'POST',
      headers: {
        ...(token && { Authorization: `Bearer ${token}` }),
      },
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
    }

    return response.json();
  },

  update: async (id: string, data: { name?: string; isPublic?: boolean }) => {
    return apiRequest(`/assets/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  delete: async (id: string) => {
    return apiRequest(`/assets/${id}`, {
      method: 'DELETE',
    });
  },

  getFileUrl: (id: string) => {
    const token = getAuthToken();
    return `${API_BASE_URL}/assets/file/${id}${token ? `?token=${token}` : ''}`;
  },
};

// Combat API
export const combatAPI = {
  getSession: async (sessionId: string) => {
    return apiRequest(`/combat/session/${sessionId}`);
  },

  startCombat: async (sessionId: string, data: { participants: any[]; mapId?: string }) => {
    return apiRequest(`/combat/session/${sessionId}/start`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  endCombat: async (sessionId: string) => {
    return apiRequest(`/combat/session/${sessionId}/end`, {
      method: 'POST',
    });
  },

  nextTurn: async (sessionId: string) => {
    return apiRequest(`/combat/session/${sessionId}/next-turn`, {
      method: 'POST',
    });
  },

  useAction: async (sessionId: string, tokenId: string) => {
    return apiRequest(`/combat/session/${sessionId}/use-action`, {
      method: 'POST',
      body: JSON.stringify({ tokenId }),
    });
  },

  useBonusAction: async (sessionId: string, tokenId: string) => {
    return apiRequest(`/combat/session/${sessionId}/use-bonus-action`, {
      method: 'POST',
      body: JSON.stringify({ tokenId }),
    });
  },
};

// Maps API
export const mapsAPI = {
  getAll: async (campaignId?: string) => {
    const params = campaignId ? `?campaignId=${campaignId}` : '';
    return apiRequest(`/maps${params}`);
  },

  getById: async (id: string) => {
    return apiRequest(`/maps/${id}`);
  },

  create: async (map: {
    name: string;
    description?: string;
    campaignId?: string;
    assetId?: string;
    widthPx: number;
    heightPx: number;
    gridSize?: number;
    gridType?: 'square' | 'hex';
  }) => {
    return apiRequest('/maps', {
      method: 'POST',
      body: JSON.stringify(map),
    });
  },

  update: async (id: string, map: any) => {
    return apiRequest(`/maps/${id}`, {
      method: 'PUT',
      body: JSON.stringify(map),
    });
  },

  delete: async (id: string) => {
    return apiRequest(`/maps/${id}`, {
      method: 'DELETE',
    });
  },
};

// Utility functions
export const setAuthToken = (token: string) => {
  localStorage.setItem('authToken', token);
};

export const removeAuthToken = () => {
  localStorage.removeItem('authToken');
};

export const isAuthenticated = (): boolean => {
  return !!getAuthToken();
};
