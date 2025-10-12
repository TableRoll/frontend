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
import { IconAlertCircle, IconUserPlus, IconEye, IconEyeOff } from '@tabler/icons-react';
import { useAuthStore } from '../stores/authStore';
import { RegisterCredentials } from '../types/models';

interface RegisterFormProps {
  onSwitchToLogin: () => void;
  onRegisterSuccess?: () => void;
}

export const RegisterForm: React.FC<RegisterFormProps> = ({ 
  onSwitchToLogin, 
  onRegisterSuccess 
}) => {
  const { register, isLoading, error, clearError } = useAuthStore();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const form = useForm<RegisterCredentials>({
    initialValues: {
      email: '',
      username: '',
      displayName: '',
      password: '',
      confirmPassword: ''
    },
    validate: {
      email: (value) => {
        if (!value) return 'Email is required';
        if (!/^\S+@\S+\.\S+$/.test(value)) return 'Invalid email format';
        return null;
      },
      username: (value) => {
        if (!value) return 'Username is required';
        if (value.length < 3) return 'Username must be at least 3 characters';
        if (!/^[a-zA-Z0-9_]+$/.test(value)) return 'Username can only contain letters, numbers, and underscores';
        return null;
      },
      displayName: (value) => {
        if (!value) return 'Display name is required';
        if (value.length < 2) return 'Display name must be at least 2 characters';
        return null;
      },
      password: (value) => {
        if (!value) return 'Password is required';
        if (value.length < 6) return 'Password must be at least 6 characters';
        if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(value)) {
          return 'Password must contain at least one uppercase letter, one lowercase letter, and one number';
        }
        return null;
      },
      confirmPassword: (value, values) => {
        if (!value) return 'Please confirm your password';
        if (value !== values.password) return 'Passwords do not match';
        return null;
      }
    }
  });

  const handleSubmit = async (values: RegisterCredentials) => {
    try {
      clearError();
      await register(values);
      notifications.show({
        title: 'Welcome!',
        message: 'Your account has been created successfully.',
        color: 'green'
      });
      onRegisterSuccess?.();
    } catch (error) {
      notifications.show({
        title: 'Registration failed',
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
            Create Account
          </Title>
          <Text c="dimmed" size="sm">
            Join the D&D Map community
          </Text>
        </Box>

        {error && (
          <Alert
            icon={<IconAlertCircle size={16} />}
            title="Registration Error"
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
              leftSection={<IconUserPlus size={16} />}
            />

            <TextInput
              label="Username"
              placeholder="your_username"
              required
              {...form.getInputProps('username')}
              leftSection={<IconUserPlus size={16} />}
            />

            <TextInput
              label="Display Name"
              placeholder="Your Name"
              required
              {...form.getInputProps('displayName')}
              leftSection={<IconUserPlus size={16} />}
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

            <PasswordInput
              label="Confirm Password"
              placeholder="Confirm your password"
              required
              {...form.getInputProps('confirmPassword')}
              leftSection={<IconEye size={16} />}
              rightSection={
                <Button
                  variant="subtle"
                  size="xs"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  style={{ border: 'none' }}
                >
                  {showConfirmPassword ? <IconEyeOff size={16} /> : <IconEye size={16} />}
                </Button>
              }
            />

            <Button
              type="submit"
              fullWidth
              loading={isLoading}
              disabled={isLoading}
            >
              {isLoading ? 'Creating account...' : 'Create Account'}
            </Button>
          </Stack>
        </form>

        <Group justify="center" mt="md">
          <Text size="sm" c="dimmed">
            Already have an account?{' '}
            <Anchor
              component="button"
              type="button"
              onClick={onSwitchToLogin}
              size="sm"
            >
              Sign in
            </Anchor>
          </Text>
        </Group>

        <Box ta="center" mt="sm">
          <Text size="xs" c="dimmed">
            By creating an account, you agree to our Terms of Service and Privacy Policy
          </Text>
        </Box>
      </Stack>
    </Paper>
  );
};


