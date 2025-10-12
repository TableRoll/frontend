import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import { 
  AuthState, 
  User, 
  LoginCredentials, 
  RegisterCredentials, 
  AuthResponse, 
  AuthError 
} from '../types/models';

interface AuthStore extends AuthState {
  // Actions
  login: (credentials: LoginCredentials) => Promise<void>;
  register: (credentials: RegisterCredentials) => Promise<void>;
  logout: () => void;
  refreshToken: () => Promise<void>;
  clearError: () => void;
  setLoading: (loading: boolean) => void;
  updateUser: (updates: Partial<User>) => void;
}

// Mock API functions - replace with actual API calls
const mockApi = {
  login: async (credentials: LoginCredentials): Promise<AuthResponse> => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Mock validation
    if (credentials.email === 'demo@example.com' && credentials.password === 'password') {
      return {
        user: {
          id: '1',
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
  
  register: async (credentials: RegisterCredentials): Promise<AuthResponse> => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Mock validation
    if (credentials.password !== credentials.confirmPassword) {
      throw new Error('Passwords do not match');
    }
    
    if (credentials.password.length < 6) {
      throw new Error('Password must be at least 6 characters long');
    }
    
    return {
      user: {
        id: Date.now().toString(),
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
  },
  
  refreshToken: async (): Promise<AuthResponse> => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Mock refresh - in real app, this would use the refresh token
    return {
      user: {
        id: '1',
        email: 'demo@example.com',
        username: 'demo_user',
        displayName: 'Demo User',
        role: 'user',
        isEmailVerified: true,
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date()
      },
      token: 'new-mock-jwt-token',
      refreshToken: 'new-mock-refresh-token'
    };
  }
};

export const useAuthStore = create<AuthStore>()(
  devtools(
    persist(
      (set, get) => ({
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: null,

        login: async (credentials) => {
          set({ isLoading: true, error: null });
          
          try {
            const response = await mockApi.login(credentials);
            
            // Store tokens in localStorage (in real app, use httpOnly cookies)
            localStorage.setItem('auth_token', response.token);
            localStorage.setItem('refresh_token', response.refreshToken);
            
            set({
              user: response.user,
              isAuthenticated: true,
              isLoading: false,
              error: null
            });
          } catch (error) {
            set({
              user: null,
              isAuthenticated: false,
              isLoading: false,
              error: error instanceof Error ? error.message : 'Login failed'
            });
            throw error;
          }
        },

        register: async (credentials) => {
          set({ isLoading: true, error: null });
          
          try {
            const response = await mockApi.register(credentials);
            
            // Store tokens in localStorage (in real app, use httpOnly cookies)
            localStorage.setItem('auth_token', response.token);
            localStorage.setItem('refresh_token', response.refreshToken);
            
            set({
              user: response.user,
              isAuthenticated: true,
              isLoading: false,
              error: null
            });
          } catch (error) {
            set({
              user: null,
              isAuthenticated: false,
              isLoading: false,
              error: error instanceof Error ? error.message : 'Registration failed'
            });
            throw error;
          }
        },

        logout: () => {
          // Clear tokens from localStorage
          localStorage.removeItem('auth_token');
          localStorage.removeItem('refresh_token');
          
          set({
            user: null,
            isAuthenticated: false,
            isLoading: false,
            error: null
          });
        },

        refreshToken: async () => {
          const refreshToken = localStorage.getItem('refresh_token');
          if (!refreshToken) {
            throw new Error('No refresh token available');
          }
          
          try {
            const response = await mockApi.refreshToken();
            
            // Update tokens
            localStorage.setItem('auth_token', response.token);
            localStorage.setItem('refresh_token', response.refreshToken);
            
            set({
              user: response.user,
              isAuthenticated: true,
              error: null
            });
          } catch (error) {
            // If refresh fails, logout user
            get().logout();
            throw error;
          }
        },

        clearError: () => set({ error: null }),
        
        setLoading: (loading) => set({ isLoading: loading }),
        
        updateUser: (updates) => set((state) => ({
          user: state.user ? { ...state.user, ...updates } : null
        }))
      }),
      {
        name: 'auth-store',
        partialize: (state) => ({
          user: state.user,
          isAuthenticated: state.isAuthenticated
        })
      }
    ),
    {
      name: 'auth-store'
    }
  )
);

// Initialize auth state from localStorage on app start
export const initializeAuth = () => {
  const token = localStorage.getItem('auth_token');
  const refreshToken = localStorage.getItem('refresh_token');
  
  if (token && refreshToken) {
    // In a real app, you would validate the token here
    // For now, we'll assume it's valid if it exists
    useAuthStore.getState().setLoading(true);
    
    // Simulate token validation
    setTimeout(() => {
      useAuthStore.getState().setLoading(false);
      // If token is invalid, logout will be called by refreshToken
    }, 100);
  }
};


