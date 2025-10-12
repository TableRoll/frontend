import React, { useState } from 'react';
import {
  Paper,
  TextInput,
  PasswordInput,
  Button,
  Stack,
  Title,
  Text,
  Alert,
  Anchor,
  Group,
  Divider,
  Box
} from '@mantine/core';
import { useForm } from '@mantine/form';
import { notifications } from '@mantine/notifications';
import { IconAlertCircle, IconLogin, IconEye, IconEyeOff } from '@tabler/icons-react';
import { useAuthStore } from '../stores/authStore';
import { LoginCredentials } from '../types/models';

interface LoginFormProps {
  onSwitchToRegister: () => void;
  onLoginSuccess?: () => void;
}

export const LoginForm: React.FC<LoginFormProps> = ({ 
  onSwitchToRegister, 
  onLoginSuccess 
}) => {
  const { login, isLoading, error, clearError } = useAuthStore();
  const [showPassword, setShowPassword] = useState(false);

  const form = useForm<LoginCredentials>({
    initialValues: {
      email: '',
      password: ''
    },
    validate: {
      email: (value) => {
        if (!value) return 'Email is required';
        if (!/^\S+@\S+\.\S+$/.test(value)) return 'Invalid email format';
        return null;
      },
      password: (value) => {
        if (!value) return 'Password is required';
        if (value.length < 6) return 'Password must be at least 6 characters';
        return null;
      }
    }
  });

  const handleSubmit = async (values: LoginCredentials) => {
    try {
      clearError();
      await login(values);
      notifications.show({
        title: 'Welcome back!',
        message: 'You have successfully logged in.',
        color: 'green'
      });
      onLoginSuccess?.();
    } catch (error) {
      notifications.show({
        title: 'Login failed',
        message: error instanceof Error ? error.message : 'An error occurred',
        color: 'red'
      });
    }
  };

  const handleDemoLogin = async () => {
    try {
      clearError();
      await login({ email: 'demo@example.com', password: 'password' });
      notifications.show({
        title: 'Demo login successful!',
        message: 'You are now logged in as a demo user.',
        color: 'green'
      });
      onLoginSuccess?.();
    } catch (error) {
      notifications.show({
        title: 'Demo login failed',
        message: error instanceof Error ? error.message : 'An error occurred',
        color: 'red'
      });
    }
  };

  return (
    <Paper radius="md" p="xl" withBorder style={{ width: '100%', maxWidth: 400 }}>
      <Stack gap="md">
        <Box ta="center">
          <Title order={2} mb="xs">
            Welcome Back
          </Title>
          <Text c="dimmed" size="sm">
            Sign in to your D&D Map account
          </Text>
        </Box>

        {error && (
          <Alert
            icon={<IconAlertCircle size={16} />}
            title="Login Error"
            color="red"
            variant="light"
          >
            {error}
          </Alert>
        )}

        <form onSubmit={form.onSubmit(handleSubmit)}>
          <Stack gap="md">
            <TextInput
              label="Email"
              placeholder="your@email.com"
              required
              {...form.getInputProps('email')}
              leftSection={<IconLogin size={16} />}
            />

            <PasswordInput
              label="Password"
              placeholder="Your password"
              required
              {...form.getInputProps('password')}
              leftSection={<IconEye size={16} />}
              rightSection={
                <Button
                  variant="subtle"
                  size="xs"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{ border: 'none' }}
                >
                  {showPassword ? <IconEyeOff size={16} /> : <IconEye size={16} />}
                </Button>
              }
            />

            <Button
              type="submit"
              fullWidth
              loading={isLoading}
              disabled={isLoading}
            >
              {isLoading ? 'Signing in...' : 'Sign In'}
            </Button>
          </Stack>
        </form>

        <Divider label="or" labelPosition="center" />

        <Button
          variant="outline"
          fullWidth
          onClick={handleDemoLogin}
          disabled={isLoading}
        >
          Try Demo Account
        </Button>

        <Group justify="center" mt="md">
          <Text size="sm" c="dimmed">
            Don't have an account?{' '}
            <Anchor
              component="button"
              type="button"
              onClick={onSwitchToRegister}
              size="sm"
            >
              Sign up
            </Anchor>
          </Text>
        </Group>

        <Box ta="center" mt="sm">
          <Text size="xs" c="dimmed">
            Demo credentials: demo@example.com / password
          </Text>
        </Box>
      </Stack>
    </Paper>
  );
};


