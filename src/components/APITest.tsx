import React, { useState } from 'react';
import { Button, Stack, Text, Alert, Group } from '@mantine/core';
import { IconCheck, IconX } from '@tabler/icons-react';
import { campaignsAPI, charactersAPI, assetsAPI } from '../services/api';

export const APITest: React.FC = () => {
  const [testResults, setTestResults] = useState<Record<string, 'pending' | 'success' | 'error'>>({});
  const [isRunning, setIsRunning] = useState(false);

  const runTest = async (testName: string, testFn: () => Promise<any>) => {
    setTestResults(prev => ({ ...prev, [testName]: 'pending' }));
    try {
      await testFn();
      setTestResults(prev => ({ ...prev, [testName]: 'success' }));
    } catch (error) {
      console.error(`Test ${testName} failed:`, error);
      setTestResults(prev => ({ ...prev, [testName]: 'error' }));
    }
  };

  const runAllTests = async () => {
    setIsRunning(true);
    setTestResults({});

    // Test API health
    await runTest('API Health', async () => {
      const response = await fetch('http://localhost:3001/health');
      if (!response.ok) throw new Error('API not responding');
    });

    // Test campaigns API
    await runTest('Get Campaigns', async () => {
      await campaignsAPI.getAll();
    });

    // Test characters API
    await runTest('Get Characters', async () => {
      await charactersAPI.getAll();
    });

    // Test assets API
    await runTest('Get Assets', async () => {
      await assetsAPI.getAll();
    });

    // Test reference data
    await runTest('Get Races', async () => {
      await charactersAPI.getRaces();
    });

    await runTest('Get Classes', async () => {
      await charactersAPI.getClasses();
    });

    await runTest('Get Backgrounds', async () => {
      await charactersAPI.getBackgrounds();
    });

    setIsRunning(false);
  };

  const getTestIcon = (status: 'pending' | 'success' | 'error') => {
    switch (status) {
      case 'success':
        return <IconCheck size={16} color="green" />;
      case 'error':
        return <IconX size={16} color="red" />;
      default:
        return <Text size="sm">⏳</Text>;
    }
  };

  const getTestColor = (status: 'pending' | 'success' | 'error') => {
    switch (status) {
      case 'success':
        return 'green';
      case 'error':
        return 'red';
      default:
        return 'blue';
    }
  };

  return (
    <Stack gap="md" p="md">
      <Text size="lg" fw={600}>API Integration Test</Text>
      
      <Button 
        onClick={runAllTests} 
        loading={isRunning}
        disabled={isRunning}
      >
        {isRunning ? 'Running Tests...' : 'Run All Tests'}
      </Button>

      {Object.entries(testResults).length > 0 && (
        <Stack gap="xs">
          {Object.entries(testResults).map(([testName, status]) => (
            <Group key={testName} gap="sm">
              {getTestIcon(status)}
              <Text size="sm" c={getTestColor(status)}>
                {testName}: {status}
              </Text>
            </Group>
          ))}
        </Stack>
      )}

      <Alert color="blue" title="API Test Instructions">
        <Text size="sm">
          1. Make sure the API server is running on port 3001<br/>
          2. Click "Run All Tests" to verify API connectivity<br/>
          3. All tests should show green checkmarks if working correctly
        </Text>
      </Alert>
    </Stack>
  );
};
