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
import { IconAlertCircle, IconUserPlus, IconArrowLeft } from '@tabler/icons-react';
import { useAuthStore, RegisterCredentials } from '../stores/authStore';

interface RegisterFormProps {
  onBackToLogin?: () => void;
}

export const RegisterForm: React.FC<RegisterFormProps> = ({ onBackToLogin }) => {
  const { register, isLoading, error, clearError } = useAuthStore();
  const [formData, setFormData] = useState<RegisterCredentials>({
    email: '',
    username: '',
    displayName: '',
    password: '',
    confirmPassword: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();
    
    if (formData.password !== formData.confirmPassword) {
      return;
    }
    
    try {
      await register(formData);
    } catch (error) {
      // Error is handled by the store
    }
  };

  const handleInputChange = (field: keyof RegisterCredentials) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({ ...prev, [field]: e.target.value }));
  };

  const passwordsMatch = formData.password === formData.confirmPassword;
  const isFormValid = formData.email && formData.username && formData.displayName && 
                     formData.password && formData.confirmPassword && passwordsMatch;

  return (
    <Container size={420} my={40}>
      <Title ta="center" mb="xl">
        Create Account
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
            
            <TextInput
              label="Username"
              placeholder="your_username"
              value={formData.username}
              onChange={handleInputChange('username')}
              required
            />
            
            <TextInput
              label="Display Name"
              placeholder="Your Name"
              value={formData.displayName}
              onChange={handleInputChange('displayName')}
              required
            />
            
            <PasswordInput
              label="Password"
              placeholder="Your password"
              value={formData.password}
              onChange={handleInputChange('password')}
              required
            />
            
            <PasswordInput
              label="Confirm Password"
              placeholder="Confirm your password"
              value={formData.confirmPassword}
              onChange={handleInputChange('confirmPassword')}
              required
              error={formData.confirmPassword && !passwordsMatch ? 'Passwords do not match' : undefined}
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
              disabled={!isFormValid}
              leftSection={<IconUserPlus size={16} />}
            >
              Create Account
            </Button>
          </Stack>
        </form>
        
        <Divider my="md" />
        
        <Group justify="center">
          <Text size="sm" c="dimmed">
            Already have an account?{' '}
            <Button
              variant="subtle"
              size="sm"
              onClick={onBackToLogin}
              leftSection={<IconArrowLeft size={14} />}
            >
              Back to login
            </Button>
          </Text>
        </Group>
      </Paper>
    </Container>
  );
};