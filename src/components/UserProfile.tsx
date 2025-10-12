import React from 'react';
import {
  Menu,
  Avatar,
  Text,
  Button,
  Group,
  UnstyledButton,
  rem,
  Box,
  Divider
} from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { notifications } from '@mantine/notifications';
import {
  IconChevronDown,
  IconLogout,
  IconUser,
  IconSettings,
  IconCrown
} from '@tabler/icons-react';
import { useAuthStore } from '../stores/authStore';

export const UserProfile: React.FC = () => {
  const { user, logout } = useAuthStore();
  const [opened, { toggle, close }] = useDisclosure(false);

  const handleLogout = () => {
    logout();
    notifications.show({
      title: 'Logged out',
      message: 'You have been successfully logged out.',
      color: 'blue'
    });
    close();
  };

  if (!user) return null;

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'admin':
        return <IconCrown size={16} />;
      case 'premium':
        return <IconCrown size={16} />;
      default:
        return <IconUser size={16} />;
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'admin':
        return 'red';
      case 'premium':
        return 'yellow';
      default:
        return 'blue';
    }
  };

  return (
    <Menu
      shadow="md"
      width={200}
      position="bottom-end"
      opened={opened}
      onClose={close}
    >
      <Menu.Target>
        <UnstyledButton
          onClick={toggle}
          style={{
            padding: 'var(--mantine-spacing-xs)',
            borderRadius: 'var(--mantine-radius-sm)',
            transition: 'background-color 100ms ease',
          }}
          data-expanded={opened}
        >
          <Group gap="xs" wrap="nowrap">
            <Avatar
              src={user.avatar}
              size="sm"
              radius="xl"
              color={getRoleColor(user.role)}
            >
              {user.displayName.charAt(0).toUpperCase()}
            </Avatar>
            <Box style={{ flex: 1, minWidth: 0 }}>
              <Text size="sm" fw={500} style={{ 
                overflow: 'hidden', 
                textOverflow: 'ellipsis', 
                whiteSpace: 'nowrap',
                maxWidth: '120px'
              }}>
                {user.displayName}
              </Text>
              <Text c="dimmed" size="xs" style={{ 
                overflow: 'hidden', 
                textOverflow: 'ellipsis', 
                whiteSpace: 'nowrap',
                maxWidth: '120px'
              }}>
                {user.email}
              </Text>
            </Box>
            <IconChevronDown
              style={{ width: rem(14), height: rem(14) }}
              stroke={1.5}
            />
          </Group>
        </UnstyledButton>
      </Menu.Target>

      <Menu.Dropdown>
        <Menu.Label>Account</Menu.Label>
        <Menu.Item
          leftSection={getRoleIcon(user.role)}
          disabled
        >
          <Box>
            <Text size="sm" fw={500}>
              {user.role.charAt(0).toUpperCase() + user.role.slice(1)} User
            </Text>
            <Text size="xs" c="dimmed">
              {user.isEmailVerified ? 'Verified' : 'Unverified'}
            </Text>
          </Box>
        </Menu.Item>

        <Menu.Item
          leftSection={<IconUser size={16} />}
          disabled
        >
          Profile
        </Menu.Item>

        <Menu.Item
          leftSection={<IconSettings size={16} />}
          disabled
        >
          Settings
        </Menu.Item>

        <Divider />

        <Menu.Item
          leftSection={<IconLogout size={16} />}
          onClick={handleLogout}
          color="red"
        >
          Logout
        </Menu.Item>
      </Menu.Dropdown>
    </Menu>
  );
};
