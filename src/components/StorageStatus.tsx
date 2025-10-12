import React, { useState, useEffect } from 'react';
import { 
  ActionIcon, 
  Tooltip, 
  Progress, 
  Text, 
  Group, 
  Badge,
  Modal,
  Stack,
  Button,
  Alert,
  Box
} from '@mantine/core';
import { IconDatabase, IconTrash, IconAlertTriangle } from '@tabler/icons-react';
import { useMapStore } from '../stores/mapStore';

export const StorageStatus: React.FC = () => {
  const { getStorageStats, cleanupStorage } = useMapStore();
  const [stats, setStats] = useState<any>(null);
  const [opened, setOpened] = useState(false);

  const updateStats = () => {
    const currentStats = getStorageStats();
    setStats(currentStats);
  };

  useEffect(() => {
    updateStats();
    // Update stats every 30 seconds
    const interval = setInterval(updateStats, 30000);
    return () => clearInterval(interval);
  }, []);

  const handleCleanup = () => {
    cleanupStorage();
    updateStats();
  };

  if (!stats) return null;

  const getStatusColor = () => {
    if (stats.critical) return 'red';
    if (stats.warning) return 'yellow';
    return 'green';
  };

  const getStatusText = () => {
    if (stats.critical) return 'Critical';
    if (stats.warning) return 'Warning';
    return 'Good';
  };

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <>
      <Tooltip label={`Storage: ${stats.percentage}% used`}>
        <ActionIcon
          variant="subtle"
          color={getStatusColor()}
          onClick={() => setOpened(true)}
        >
          <IconDatabase size={16} />
        </ActionIcon>
      </Tooltip>

      <Modal
        opened={opened}
        onClose={() => setOpened(false)}
        title="Storage Status"
        size="md"
      >
        <Stack gap="md">
          {stats.critical && (
            <Alert
              icon={<IconAlertTriangle size={16} />}
              title="Storage Critical"
              color="red"
              variant="light"
            >
              Your browser storage is nearly full. Consider cleaning up old data.
            </Alert>
          )}

          {stats.warning && !stats.critical && (
            <Alert
              icon={<IconAlertTriangle size={16} />}
              title="Storage Warning"
              color="yellow"
              variant="light"
            >
              Your browser storage is getting full. Consider cleaning up old data.
            </Alert>
          )}

          <Box>
            <Group justify="space-between" mb="xs">
              <Text size="sm" fw={500}>Storage Usage</Text>
              <Badge color={getStatusColor()} variant="light">
                {getStatusText()}
              </Badge>
            </Group>
            
            <Progress
              value={stats.percentage}
              color={getStatusColor()}
              size="lg"
              radius="md"
            />
            
            <Group justify="space-between" mt="xs">
              <Text size="xs" c="dimmed">
                {formatBytes(stats.used)} of {formatBytes(stats.limit)}
              </Text>
              <Text size="xs" c="dimmed">
                {stats.percentage}%
              </Text>
            </Group>
          </Box>

          <Text size="sm" c="dimmed">
            The app stores your maps, scenes, and settings in your browser's local storage. 
            Large images and frequent updates can fill up this space.
          </Text>

          <Group justify="space-between">
            <Button
              variant="outline"
              leftSection={<IconTrash size={16} />}
              onClick={handleCleanup}
              disabled={!stats.needsCleanup}
            >
              Clean Up Storage
            </Button>
            
            <Button
              variant="outline"
              onClick={() => setOpened(false)}
            >
              Close
            </Button>
          </Group>
        </Stack>
      </Modal>
    </>
  );
};
