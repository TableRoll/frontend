import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';

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

// Mock authentication service
const mockAuthService = {
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Mock validation
    if (credentials.email === 'demo@example.com' && credentials.password === 'password') {
      return {
        user: {
          id: 'user_1',
          email: credentials.email,
          username: 'demo_user',
          displayName: 'Demo User',
          role: 'user',
          isEmailVerified: true,
          createdAt: new Date('2024-01-01'),
          updatedAt: new Date()
        },
        token: 'mock-jwt-token',
        refreshToken: 'mock-refresh-token'
      };
    }
    
    throw new Error('Invalid email or password');
  },

  async register(credentials: RegisterCredentials): Promise<AuthResponse> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Mock validation
    if (credentials.password !== credentials.confirmPassword) {
      throw new Error('Passwords do not match');
    }
    
    if (credentials.email === 'existing@example.com') {
      throw new Error('Email already exists');
    }
    
    return {
      user: {
        id: `user_${Date.now()}`,
        email: credentials.email,
        username: credentials.username,
        displayName: credentials.displayName,
        role: 'user',
        isEmailVerified: false,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      token: 'mock-jwt-token',
      refreshToken: 'mock-refresh-token'
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
            const response = await mockAuthService.login(credentials);
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
            const response = await mockAuthService.register(credentials);
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