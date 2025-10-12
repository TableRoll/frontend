import React, { useState, useEffect } from 'react';
import { Container, Center, Loader, Box } from '@mantine/core';
import { LoginForm } from './LoginForm';
import { RegisterForm } from './RegisterForm';
import { useAuthStore, initializeAuth } from '../stores/authStore';

interface AuthWrapperProps {
  children: React.ReactNode;
}

type AuthMode = 'login' | 'register';

export const AuthWrapper: React.FC<AuthWrapperProps> = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuthStore();
  const [authMode, setAuthMode] = useState<AuthMode>('login');

  useEffect(() => {
    // Initialize authentication state on app start
    initializeAuth();
  }, []);

  const handleAuthSuccess = () => {
    // Authentication success is handled by the store
    // This callback can be used for additional actions if needed
  };

  if (isLoading) {
    return (
      <Container size="sm" h="100vh">
        <Center h="100%">
          <Box ta="center">
            <Loader size="lg" />
            <Box mt="md">Loading...</Box>
          </Box>
        </Center>
      </Container>
    );
  }

  if (!isAuthenticated) {
    return (
      <Container size="sm" h="100vh">
        <Center h="100%">
          {authMode === 'login' ? (
            <LoginForm
              onSwitchToRegister={() => setAuthMode('register')}
              onLoginSuccess={handleAuthSuccess}
            />
          ) : (
            <RegisterForm
              onSwitchToLogin={() => setAuthMode('login')}
              onRegisterSuccess={handleAuthSuccess}
            />
          )}
        </Center>
      </Container>
    );
  }

  return <>{children}</>;
};


