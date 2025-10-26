import React, { useState } from 'react';
import {
  Container,
  Paper,
  TextInput,
  PasswordInput,
  Button,
  Title,
  Text,
  Stack,
  Group,
  Alert,
  Divider
} from '@mantine/core';
import { IconAlertCircle, IconLogin } from '@tabler/icons-react';
import { useAuthStore, LoginCredentials } from '../stores/authStore';
import { RegisterForm } from './RegisterForm';

export const LoginForm: React.FC = () => {
  const { login, isLoading, error, clearError } = useAuthStore();
  const [showRegister, setShowRegister] = useState(false);
  const [formData, setFormData] = useState<LoginCredentials>({
    email: '',
    password: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();
    
    try {
      await login(formData);
    } catch (error) {
      // Error is handled by the store
    }
  };

  const handleInputChange = (field: keyof LoginCredentials) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({ ...prev, [field]: e.target.value }));
  };

  if (showRegister) {
    return <RegisterForm onBackToLogin={() => setShowRegister(false)} />;
  }

  return (
    <Container size={420} my={40}>
      <Title ta="center" mb="xl">
        Welcome to D&D Map App
      </Title>
      
      <Paper withBorder shadow="md" p={30} mt={30} radius="md">
        <form onSubmit={handleSubmit}>
          <Stack gap="md">
            <TextInput
              label="Email"
              placeholder="your@email.com"
              value={formData.email}
              onChange={handleInputChange('email')}
              required
              type="email"
            />
            
            <PasswordInput
              label="Password"
              placeholder="Your password"
              value={formData.password}
              onChange={handleInputChange('password')}
              required
            />
            
            {error && (
              <Alert icon={<IconAlertCircle size={16} />} color="red">
                {error}
              </Alert>
            )}
            
            <Button
              type="submit"
              fullWidth
              loading={isLoading}
              leftSection={<IconLogin size={16} />}
            >
              Sign In
            </Button>
          </Stack>
        </form>
        
        <Divider my="md" />
        
        <Group justify="center">
          <Text size="sm" c="dimmed">
            Don't have an account?{' '}
            <Button
              variant="subtle"
              size="sm"
              onClick={() => setShowRegister(true)}
            >
              Sign up
            </Button>
          </Text>
        </Group>
        
        <Divider my="md" />
        
        <Alert icon={<IconAlertCircle size={16} />} color="blue" variant="light">
          <Text size="sm">
            <strong>Demo Account:</strong><br />
            Email: demo@example.com<br />
            Password: password
          </Text>
        </Alert>
      </Paper>
    </Container>
  );
};