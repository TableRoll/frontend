import React, { useEffect } from 'react';
import { useAuthStore } from '../stores/authStore';
import { LoginForm } from './LoginForm';
import { RegisterForm } from './RegisterForm';
import { setAuthToken } from '../services/api';

interface AuthWrapperProps {
  children: React.ReactNode;
}

// Check if we should bypass authentication (development mode)
const shouldBypassAuth = () => {
  // Only bypass in development, never in production
  if (process.env.NODE_ENV === 'production') {
    return false;
  }
  
  // Check environment variable or localStorage flag
  const bypassAuth = process.env.REACT_APP_BYPASS_AUTH === 'true' || 
                     localStorage.getItem('bypassAuth') === 'true';
  return bypassAuth;
};

export const AuthWrapper: React.FC<AuthWrapperProps> = ({ children }) => {
  const { isAuthenticated, isLoading, user } = useAuthStore();

  // Auto-authenticate in development mode if bypass is enabled
  useEffect(() => {
    if (shouldBypassAuth() && !isAuthenticated) {
      // Set mock token for development
      setAuthToken('mock-token-for-development');
      
      // Set mock user in store
      useAuthStore.setState({
        user: {
          id: '00000000-0000-0000-0000-000000000001',
          email: 'dev@example.com',
          username: 'developer',
          displayName: 'Development User',
          role: 'user',
          isEmailVerified: true,
          createdAt: new Date(),
          updatedAt: new Date()
        },
        isAuthenticated: true,
        isLoading: false,
        error: null
      });
    }
  }, [isAuthenticated]);

  if (isLoading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh',
        fontSize: '18px'
      }}>
        Loading...
      </div>
    );
  }

  if (!isAuthenticated) {
    return <LoginForm />;
  }

  return <>{children}</>;
};