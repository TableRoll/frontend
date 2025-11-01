import React, { useState } from 'react';
import { Button, Stack, Text, Alert, Group, FileInput, Card, Image, Code, Divider } from '@mantine/core';
import { IconCheck, IconX, IconDatabase, IconTrash } from '@tabler/icons-react';
import { campaignsAPI, mapsAPI, assetsAPI } from '../services/api';
import { notifications } from '@mantine/notifications';

export const DatabaseTest: React.FC = () => {
  const [testResults, setTestResults] = useState<Record<string, 'pending' | 'success' | 'error'>>({});
  const [isRunning, setIsRunning] = useState(false);
  const [testData, setTestData] = useState<{
    campaignId?: string;
    assetId?: string;
    mapId?: string;
    imageUrl?: string;
    campaignName?: string;
    mapName?: string;
  }>({});
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const runTest = async (testName: string, testFn: () => Promise<any>) => {
    setTestResults(prev => ({ ...prev, [testName]: 'pending' }));
    try {
      const result = await testFn();
      setTestResults(prev => ({ ...prev, [testName]: 'success' }));
      return result;
    } catch (error) {
      console.error(`Test ${testName} failed:`, error);
      setTestResults(prev => ({ ...prev, [testName]: 'error' }));
      throw error;
    }
  };

  const clearCache = () => {
    // Clear localStorage
    localStorage.clear();
    
    // Clear session storage
    sessionStorage.clear();
    
    // Clear IndexedDB (for map store persistence)
    if (window.indexedDB) {
      indexedDB.databases().then(dbs => {
        dbs.forEach(db => {
          if (db.name) {
            indexedDB.deleteDatabase(db.name);
          }
        });
      });
    }
    
    notifications.show({
      title: 'Cache Cleared',
      message: 'All browser cache, localStorage, and IndexedDB cleared. Refresh the page to see changes.',
      color: 'blue'
    });
  };

  const runFullTest = async () => {
    if (!selectedFile) {
      notifications.show({
        title: 'Error',
        message: 'Please select an image file first',
        color: 'red'
      });
      return;
    }

    setIsRunning(true);
    setTestResults({});
    setTestData({});

    try {
      // Step 1: Create a campaign
      const campaign = await runTest('1. Create Campaign', async () => {
        const response = await campaignsAPI.create({
          name: `Test Campaign ${Date.now()}`,
          description: 'Auto-generated test campaign for database verification'
        });
        setTestData(prev => ({ 
          ...prev, 
          campaignId: response.campaign.id,
          campaignName: response.campaign.name 
        }));
        return response.campaign;
      });

      // Step 2: Upload image as asset
      const asset = await runTest('2. Upload Image Asset', async () => {
        const response = await assetsAPI.upload(selectedFile!, {
          name: selectedFile!.name,
          assetType: 'map',
          campaignId: campaign.id,
          isPublic: false
        });
        setTestData(prev => ({ 
          ...prev, 
          assetId: response.asset.id,
          imageUrl: assetsAPI.getFileUrl(response.asset.id)
        }));
        return response.asset;
      });

      // Step 3: Create map linked to campaign and asset
      const map = await runTest('3. Create Map in Database', async () => {
        const response = await mapsAPI.create({
          name: `Test Map ${Date.now()}`,
          description: 'Auto-generated test map',
          campaignId: campaign.id,
          assetId: asset.id,
          widthPx: 2048,
          heightPx: 1536,
          gridSize: 50,
          gridType: 'square'
        });
        setTestData(prev => ({ 
          ...prev, 
          mapId: response.map.id,
          mapName: response.map.name 
        }));
        return response.map;
      });

      // Step 4: Verify we can retrieve the map
      await runTest('4. Retrieve Map from Database', async () => {
        const response = await mapsAPI.getById(map.id);
        if (!response.map) {
          throw new Error('Map not found in database');
        }
        return response.map;
      });

      // Step 5: Verify we can get the image
      await runTest('5. Verify Image URL Accessible', async () => {
        const imgUrl = assetsAPI.getFileUrl(asset.id);
        const response = await fetch(imgUrl);
        if (!response.ok) {
          throw new Error('Image not accessible');
        }
        return imgUrl;
      });

      notifications.show({
        title: 'All Tests Passed! ✅',
        message: 'Database integration is working correctly',
        color: 'green'
      });

    } catch (error) {
      notifications.show({
        title: 'Test Failed',
        message: error instanceof Error ? error.message : 'Unknown error occurred',
        color: 'red'
      });
    } finally {
      setIsRunning(false);
    }
  };

  const checkDatabase = async () => {
    setIsRunning(true);
    try {
      await runTest('Check Campaigns in DB', async () => {
        const response = await campaignsAPI.getAll();
        console.log('Campaigns in DB:', response.campaigns);
        return response.campaigns;
      });

      await runTest('Check Maps in DB', async () => {
        const response = await mapsAPI.getAll();
        console.log('Maps in DB:', response.maps);
        return response.maps;
      });

      await runTest('Check Assets in DB', async () => {
        const response = await assetsAPI.getAll();
        console.log('Assets in DB:', response.assets);
        return response.assets;
      });
    } catch (error) {
      console.error('Database check failed:', error);
    } finally {
      setIsRunning(false);
    }
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
    <Card withBorder p="md" style={{ maxWidth: 800, margin: '20px auto' }}>
      <Stack gap="md">
        <Group>
          <IconDatabase size={32} color="blue" />
          <div>
            <Text size="xl" fw={700}>Database Integration Test</Text>
            <Text size="sm" c="dimmed">Test complete map creation workflow with database persistence</Text>
          </div>
        </Group>

        <Divider />

        <Alert color="blue" title="Test Instructions">
          <Text size="sm">
            This test will:<br/>
            1. Create a campaign in PostgreSQL database<br/>
            2. Upload an image and store it as an asset<br/>
            3. Create a map linked to the campaign and asset<br/>
            4. Verify retrieval from database<br/>
            5. Verify image can be accessed via URL
          </Text>
        </Alert>

        <FileInput
          label="Select Test Image"
          placeholder="Choose a map image"
          accept="image/*"
          value={selectedFile}
          onChange={setSelectedFile}
          disabled={isRunning}
        />

        <Group>
          <Button 
            onClick={runFullTest} 
            loading={isRunning}
            disabled={isRunning || !selectedFile}
            leftSection={<IconDatabase size={16} />}
          >
            Run Full Database Test
          </Button>

          <Button 
            onClick={checkDatabase} 
            loading={isRunning}
            disabled={isRunning}
            variant="outline"
          >
            Check Database Contents
          </Button>

          <Button 
            onClick={clearCache} 
            color="red"
            variant="outline"
            leftSection={<IconTrash size={16} />}
          >
            Clear All Cache
          </Button>
        </Group>

        {Object.entries(testResults).length > 0 && (
          <Card withBorder p="sm">
            <Text size="sm" fw={600} mb="xs">Test Results:</Text>
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
          </Card>
        )}

        {testData.campaignId && (
          <Card withBorder p="sm">
            <Text size="sm" fw={600} mb="xs">Created Test Data:</Text>
            <Stack gap="xs">
              <Code block>{JSON.stringify(testData, null, 2)}</Code>
            </Stack>
          </Card>
        )}

        {testData.imageUrl && (
          <Card withBorder p="sm">
            <Text size="sm" fw={600} mb="xs">Retrieved Image from Database:</Text>
            <Image 
              src={testData.imageUrl} 
              alt="Test map from database"
              radius="md"
              style={{ maxHeight: 300, objectFit: 'contain' }}
            />
          </Card>
        )}

        <Alert color="yellow" title="Important Notes">
          <Text size="sm">
            • Maps are ONLY saved to database if created within a campaign<br/>
            • Maps created without a campaign are stored in localStorage only<br/>
            • Use "Clear All Cache" to test if data persists in database<br/>
            • Check browser console for detailed API responses
          </Text>
        </Alert>
      </Stack>
    </Card>
  );
};

