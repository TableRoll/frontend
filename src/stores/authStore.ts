import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import { authAPI, setAuthToken, removeAuthToken } from '../services/api';

export interface User {
  id: string;
  email: string;
  username: string;
  displayName: string;
  avatar?: string;
  role: 'user' | 'admin';
  isEmailVerified: boolean;
  createdAt: Date;
  updatedAt: Date;
  lastLoginAt?: Date;
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

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

interface AuthStore extends AuthState {
  // Actions
  login: (credentials: LoginCredentials) => Promise<AuthResponse>;
  register: (credentials: RegisterCredentials) => Promise<AuthResponse>;
  logout: () => void;
  clearError: () => void;
  setLoading: (loading: boolean) => void;
  updateUser: (updates: Partial<User>) => void;
}

// Real authentication service using the API
const authService = {
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    const response = await authAPI.login(credentials);
    
    return {
      user: {
        id: response.user.id,
        email: response.user.email,
        username: response.user.username,
        displayName: response.user.displayName,
        avatar: response.user.avatar,
        role: response.user.role,
        isEmailVerified: response.user.isEmailVerified,
        createdAt: new Date(response.user.createdAt),
        updatedAt: new Date(response.user.updatedAt),
        lastLoginAt: response.user.lastLoginAt ? new Date(response.user.lastLoginAt) : undefined
      },
      token: response.token,
      refreshToken: response.token // Backend doesn't have separate refresh token yet
    };
  },

  async register(credentials: RegisterCredentials): Promise<AuthResponse> {
    const response = await authAPI.register(credentials);
    
    return {
      user: {
        id: response.user.id,
        email: response.user.email,
        username: response.user.username,
        displayName: response.user.displayName,
        avatar: response.user.avatar,
        role: response.user.role,
        isEmailVerified: response.user.isEmailVerified,
        createdAt: new Date(response.user.createdAt),
        updatedAt: new Date(response.user.updatedAt),
        lastLoginAt: response.user.lastLoginAt ? new Date(response.user.lastLoginAt) : undefined
      },
      token: response.token,
      refreshToken: response.token
    };
  }
};

export const useAuthStore = create<AuthStore>()(
  devtools(
    persist(
      (set, get) => ({
        // Initial state
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: null,

        // Actions
        login: async (credentials: LoginCredentials) => {
          set({ isLoading: true, error: null });
          
          try {
            const response = await authService.login(credentials);
            // Store token in localStorage
            setAuthToken(response.token);
            
            set({
              user: response.user,
              isAuthenticated: true,
              isLoading: false,
              error: null
            });
            return response;
          } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Login failed';
            set({
              user: null,
              isAuthenticated: false,
              isLoading: false,
              error: errorMessage
            });
            throw error;
          }
        },

        register: async (credentials: RegisterCredentials) => {
          set({ isLoading: true, error: null });
          
          try {
            const response = await authService.register(credentials);
            // Store token in localStorage
            setAuthToken(response.token);
            
            set({
              user: response.user,
              isAuthenticated: true,
              isLoading: false,
              error: null
            });
            return response;
          } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Registration failed';
            set({
              user: null,
              isAuthenticated: false,
              isLoading: false,
              error: errorMessage
            });
            throw error;
          }
        },

        logout: () => {
          // Remove token from localStorage
          removeAuthToken();
          
          set({
            user: null,
            isAuthenticated: false,
            isLoading: false,
            error: null
          });
        },

        clearError: () => {
          set({ error: null });
        },

        setLoading: (loading: boolean) => {
          set({ isLoading: loading });
        },

        updateUser: (updates: Partial<User>) => {
          const currentUser = get().user;
          if (currentUser) {
            set({
              user: {
                ...currentUser,
                ...updates,
                updatedAt: new Date()
              }
            });
          }
        }
      }),
      {
        name: 'auth-storage',
        partialize: (state) => ({
          user: state.user,
          isAuthenticated: state.isAuthenticated
        })
      }
    ),
    { name: 'AuthStore' }
  )
);