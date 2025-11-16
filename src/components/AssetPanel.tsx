import React, { useState, useCallback } from 'react';
import {
  Container,
  Title,
  Text,
  Grid,
  Card,
  Group,
  Button,
  Badge,
  Stack,
  Modal,
  TextInput,
  FileInput,
  Select,
  ActionIcon,
  Menu,
  Image,
  Box,
  Progress,
  Center
} from '@mantine/core';
import {
  IconPlus,
  IconDownload,
  IconTrash,
  IconEdit,
  IconDots,
  IconSearch,
  IconLayout,
  IconList,
  IconPhoto,
  IconMusic,
  IconFile,
  IconMap
} from '@tabler/icons-react';
import { useMapStore } from '../stores/mapStore';
import { Asset, AssetType } from '../types/models';
import { assetsAPI } from '../services/api';

interface AssetPanelProps {
  assets: Asset[];
  onAssetSelect: (asset: Asset) => void;
  onAssetUpload: (files: File[]) => void;
  onAssetDelete: (assetId: string) => void;
}

export const AssetPanel: React.FC<AssetPanelProps> = ({
  assets,
  onAssetSelect,
  onAssetUpload,
  onAssetDelete
}) => {
  const { addAsset, currentCampaign } = useMapStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState<AssetType | 'all'>('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [uploadModalOpened, setUploadModalOpened] = useState(false);
  const [uploadingFiles, setUploadingFiles] = useState<File[]>([]);
  const [uploadProgress, setUploadProgress] = useState<Record<string, number>>({});

  // Filter assets based on search and type
  // Exclude map-type assets as they're managed in the Maps section
  const filteredAssets = assets.filter(asset => {
    const matchesSearch = asset.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = selectedType === 'all' || asset.type === selectedType;
    const isNotMapAsset = asset.type !== 'map'; // Hide map images from asset panel
    return matchesSearch && matchesType && isNotMapAsset;
  });

  // Handle file upload
  const handleFileUpload = useCallback(async (files: File[]) => {
    setUploadingFiles(files);
    setUploadModalOpened(false);

    for (const file of files) {
      const assetId = `asset_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      try {
        // Simulate upload progress
        for (let progress = 0; progress <= 100; progress += 10) {
          setUploadProgress(prev => ({ ...prev, [assetId]: progress }));
          await new Promise(resolve => setTimeout(resolve, 100));
        }
        
        // Determine asset type
        let assetType: AssetType = 'image'; // Default to image
        if (file.type.startsWith('image/')) {
          assetType = file.name.includes('token') ? 'token' : 'image';
        } else if (file.type.startsWith('audio/')) {
          assetType = 'audio';
        } else if (file.name.includes('map')) {
          assetType = 'map';
        }
        
        // Upload to API
        const response = await assetsAPI.upload(file, {
          name: file.name,
          assetType,
          campaignId: currentCampaign?.id,
          isPublic: false
        });
        
        const newAsset = response.asset;
        
        // Add to local store
        addAsset(newAsset);
        onAssetUpload([file]);
        
      } catch (error) {
        console.error('Upload failed:', error);
      } finally {
        setUploadProgress(prev => {
          const newProgress = { ...prev };
          delete newProgress[assetId];
          return newProgress;
        });
      }
    }
    
    setUploadingFiles([]);
  }, [addAsset, onAssetUpload, currentCampaign]);

  // Thumbnails are now handled by the API

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getAssetIcon = (type: AssetType) => {
    switch (type) {
      case 'image': return <IconPhoto size={20} />;
      case 'token': return <IconMap size={20} />;
      case 'audio': return <IconMusic size={20} />;
      case 'map': return <IconMap size={20} />;
      default: return <IconFile size={20} />;
    }
  };

  const getAssetColor = (type: AssetType) => {
    switch (type) {
      case 'image': return 'blue';
      case 'token': return 'green';
      case 'audio': return 'purple';
      case 'map': return 'orange';
      default: return 'gray';
    }
  };

  return (
    <Container fluid py="xl">
      <Stack gap="lg">
        {/* Header */}
        <Group justify="space-between">
          <div>
            <Title order={1}>Assets</Title>
            <Text c="dimmed">Manage your images, tokens, and other assets</Text>
          </div>
          <Button
            leftSection={<IconPlus size={16} />}
            onClick={() => setUploadModalOpened(true)}
          >
            Upload Assets
          </Button>
        </Group>

        {/* Filters and Search */}
        <Card withBorder p="md">
          <Group justify="space-between" mb="md">
            <Group gap="md">
              <TextInput
                placeholder="Search assets..."
                leftSection={<IconSearch size={16} />}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{ width: 300 }}
              />
              <Select
                placeholder="Filter by type"
                data={[
                  { value: 'all', label: 'All Types' },
                  { value: 'image', label: 'Images' },
                  { value: 'token', label: 'Tokens' },
                  { value: 'audio', label: 'Audio' },
                  { value: 'map', label: 'Maps' }
                ]}
                value={selectedType}
                onChange={(value) => setSelectedType(value as AssetType | 'all')}
                style={{ width: 150 }}
              />
            </Group>
            <Group gap="xs">
              <ActionIcon
                variant={viewMode === 'grid' ? 'filled' : 'subtle'}
                onClick={() => setViewMode('grid')}
              >
                <IconLayout size={16} />
              </ActionIcon>
              <ActionIcon
                variant={viewMode === 'list' ? 'filled' : 'subtle'}
                onClick={() => setViewMode('list')}
              >
                <IconList size={16} />
              </ActionIcon>
            </Group>
          </Group>
        </Card>

        {/* Assets Grid/List */}
        {filteredAssets.length === 0 ? (
          <Card withBorder p="xl">
            <Center>
              <Stack align="center" gap="md">
                <IconPhoto size={64} color="gray" />
                <Text size="lg" c="dimmed">No assets found</Text>
                <Text size="sm" c="dimmed" ta="center">
                  {searchQuery || selectedType !== 'all' 
                    ? 'Try adjusting your search or filters'
                    : 'Upload some assets to get started'
                  }
                </Text>
                <Button
                  leftSection={<IconPlus size={16} />}
                  onClick={() => setUploadModalOpened(true)}
                >
                  Upload Assets
                </Button>
              </Stack>
            </Center>
          </Card>
        ) : (
          <Grid>
            {filteredAssets.map((asset) => (
              <Grid.Col key={asset.id} span={viewMode === 'grid' ? { base: 12, sm: 6, md: 4, lg: 3 } : 12}>
                <Card withBorder shadow="sm" h="100%">
                  <Stack gap="sm" h="100%">
                    {/* Asset Preview */}
                    <Box style={{ height: viewMode === 'grid' ? 150 : 80, overflow: 'hidden' }}>
                      {asset.thumbnail ? (
                        <Image
                          src={asset.thumbnail}
                          alt={asset.name}
                          fit="cover"
                          h="100%"
                          w="100%"
                        />
                      ) : (
                        <Center h="100%" bg="gray.1">
                          {getAssetIcon(asset.type)}
                        </Center>
                      )}
                    </Box>

                    {/* Asset Info */}
                    <Stack gap="xs" style={{ flex: 1 }}>
                      <Group justify="space-between">
                        <Text fw={500} lineClamp={1} style={{ flex: 1 }}>
                          {asset.name}
                        </Text>
                        <Menu>
                          <Menu.Target>
                            <ActionIcon variant="subtle" size="sm">
                              <IconDots size={14} />
                            </ActionIcon>
                          </Menu.Target>
                          <Menu.Dropdown>
                            <Menu.Item
                              leftSection={<IconEdit size={14} />}
                              onClick={() => onAssetSelect(asset)}
                            >
                              Select
                            </Menu.Item>
                            <Menu.Item
                              leftSection={<IconDownload size={14} />}
                              onClick={() => window.open(asset.url, '_blank')}
                            >
                              Download
                            </Menu.Item>
                            <Menu.Divider />
                            <Menu.Item
                              leftSection={<IconTrash size={14} />}
                              color="red"
                              onClick={() => onAssetDelete(asset.id)}
                            >
                              Delete
                            </Menu.Item>
                          </Menu.Dropdown>
                        </Menu>
                      </Group>

                      <Group justify="space-between">
                        <Badge color={getAssetColor(asset.type)} size="sm">
                          {asset.type}
                        </Badge>
                        <Text size="xs" c="dimmed">
                          {formatFileSize(asset.size)}
                        </Text>
                      </Group>

                      <Text size="xs" c="dimmed">
                        {asset.uploadedAt instanceof Date 
                          ? asset.uploadedAt.toLocaleDateString()
                          : new Date(asset.uploadedAt).toLocaleDateString()
                        }
                      </Text>
                    </Stack>
                  </Stack>
                </Card>
              </Grid.Col>
            ))}
          </Grid>
        )}

        {/* Upload Modal */}
        <Modal
          opened={uploadModalOpened}
          onClose={() => setUploadModalOpened(false)}
          title="Upload Assets"
          size="lg"
        >
          <Stack gap="md">
            <FileInput
              label="Select Files"
              placeholder="Choose files to upload"
              multiple
              accept="image/*,audio/*"
              onChange={(files) => {
                if (files) {
                  handleFileUpload(Array.from(files));
                }
              }}
            />
            
            <Text size="sm" c="dimmed">
              Supported formats: Images (JPG, PNG, GIF), Audio (MP3, WAV)
            </Text>
          </Stack>
        </Modal>

        {/* Upload Progress */}
        {uploadingFiles.length > 0 && (
          <Card withBorder p="md">
            <Text fw={500} mb="md">Uploading Files...</Text>
            <Stack gap="sm">
              {uploadingFiles.map((file, index) => (
                <Box key={index}>
                  <Group justify="space-between" mb="xs">
                    <Text size="sm">{file.name}</Text>
                    <Text size="sm" c="dimmed">
                      {uploadProgress[`asset_${index}`] || 0}%
                    </Text>
                  </Group>
                  <Progress
                    value={uploadProgress[`asset_${index}`] || 0}
                    size="sm"
                  />
                </Box>
              ))}
            </Stack>
          </Card>
        )}
      </Stack>
    </Container>
  );
};