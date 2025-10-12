import React, { useState, useCallback, useRef } from 'react';
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
  ScrollArea,
  Box,
  Divider,
  Progress,
  Tabs,
  Textarea,
  NumberInput,
  Switch,
  SimpleGrid,
  Center
} from '@mantine/core';
import {
  IconPlus,
  IconUpload,
  IconDownload,
  IconTrash,
  IconEdit,
  IconDots,
  IconSearch,
  IconFilter,
  IconLayout,
  IconList,
  IconPhoto,
  IconMusic,
  IconFile,
  IconMap,
  IconCopy
} from '@tabler/icons-react';
import { useMapStore } from '../stores/mapStore';
import { AssetPanelProps, Asset, AssetType } from '../types/models';
import { TokenCreator } from './TokenCreator';
import { formatDate } from '../utils/dateUtils';
import { addTestAsset, debugAssets } from '../utils/debugUtils';

export const AssetPanel: React.FC<AssetPanelProps> = ({
  assets,
  onAssetSelect,
  onAssetUpload,
  onAssetDelete
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState<AssetType | 'all'>('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [uploadModalOpened, setUploadModalOpened] = useState(false);
  const [editingAsset, setEditingAsset] = useState<Asset | null>(null);
  const [uploadProgress, setUploadProgress] = useState<Record<string, number>>({});
  const [uploadingFiles, setUploadingFiles] = useState<File[]>([]);
  const [assetForm, setAssetForm] = useState<Partial<Asset>>({});
  const [tokenCreatorOpened, setTokenCreatorOpened] = useState(false);
  const [selectedAssetForToken, setSelectedAssetForToken] = useState<Asset | null>(null);
  const [tokenData, setTokenData] = useState<Partial<import('../types/models').TokenAssetData>>({});
  
  const fileInputRef = useRef<HTMLButtonElement>(null);

  const { addAsset, updateAsset } = useMapStore();

  // Filter assets based on search and type
  const filteredAssets = assets.filter(asset => {
    const matchesSearch = asset.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = selectedType === 'all' || asset.type === selectedType;
    return matchesSearch && matchesType;
  });

  // Handle file upload
  const handleFileUpload = useCallback(async (files: File[]) => {
    setUploadingFiles(files);
    
    for (const file of files) {
      const assetId = `asset_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      try {
        // Simulate upload progress
        for (let progress = 0; progress <= 100; progress += 10) {
          setUploadProgress(prev => ({ ...prev, [assetId]: progress }));
          await new Promise(resolve => setTimeout(resolve, 100));
        }
        
        // Create thumbnail for images
        let thumbnail = '';
        if (file.type.startsWith('image/')) {
          thumbnail = await createThumbnail(file);
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
        
        // Create asset object
        const newAsset: Asset = {
          id: assetId,
          name: file.name,
          type: assetType,
          url: URL.createObjectURL(file), // In real app, this would be server URL
          thumbnail,
          size: file.size,
          uploadedAt: new Date()
        };
        
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
    setUploadModalOpened(false);
  }, [addAsset, onAssetUpload]);

  // Create thumbnail for images
  const createThumbnail = (file: File): Promise<string> => {
    return new Promise((resolve) => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = document.createElement('img');
      
      img.onload = () => {
        const maxSize = 150;
        let { width, height } = img;
        
        if (width > height) {
          if (width > maxSize) {
            height = (height * maxSize) / width;
            width = maxSize;
          }
        } else {
          if (height > maxSize) {
            width = (width * maxSize) / height;
            height = maxSize;
          }
        }
        
        canvas.width = width;
        canvas.height = height;
        ctx?.drawImage(img, 0, 0, width, height);
        
        resolve(canvas.toDataURL('image/jpeg', 0.8));
      };
      
      img.src = URL.createObjectURL(file);
    });
  };

  // Handle asset edit
  const handleAssetEdit = (asset: Asset) => {
    setEditingAsset(asset);
    setAssetForm({
      name: asset.name,
      type: asset.type
    });
  };

  // Handle create token from asset
  const handleCreateTokenFromAsset = (asset: Asset) => {
    setSelectedAssetForToken(asset);
    setTokenCreatorOpened(true);
  };

  // Handle form submission
  const handleFormSubmit = () => {
    if (editingAsset) {
      updateAsset(editingAsset.id, assetForm);
      setEditingAsset(null);
      setAssetForm({});
    }
  };

  // Handle drag and drop
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      handleFileUpload(files);
    }
  };

  // Get asset type icon
  const getAssetTypeIcon = (type: AssetType) => {
    switch (type) {
      case 'image':
        return <IconPhoto size={16} />;
      case 'token':
        return <IconPhoto size={16} />;
      case 'audio':
        return <IconMusic size={16} />;
      case 'map':
        return <IconMap size={16} />;
      default:
        return <IconFile size={16} />;
    }
  };

  // Format file size
  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <ScrollArea 
      h="100%" 
      scrollbarSize={8}
      scrollHideDelay={1000}
      style={{ 
        padding: '20px',
        height: 'calc(100vh - 60px)' // Subtract header height
      }}
    >
      <Container size="xl">
        <Stack gap="xl">
        {/* Header */}
        <Group justify="space-between">
          <Box>
            <Title order={2}>Asset Library</Title>
            <Text c="dimmed">
              Manage your maps, tokens, and audio files
            </Text>
          </Box>
          
          <Group>
            <Button
              leftSection={<IconPlus size={16} />}
              onClick={() => setUploadModalOpened(true)}
            >
              Upload Assets
            </Button>
            
            {/* Debug buttons - remove in production */}
            <Button
              variant="outline"
              size="xs"
              onClick={debugAssets}
            >
              Debug Assets
            </Button>
            <Button
              variant="outline"
              size="xs"
              onClick={addTestAsset}
            >
              Add Test Asset
            </Button>
          </Group>
        </Group>
        
        {/* Filters and Search */}
        <Card withBorder p="md">
          <Group justify="space-between" mb="md">
            <Group>
              <TextInput
                placeholder="Search assets..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                leftSection={<IconSearch size={16} />}
                style={{ width: 300 }}
              />
              
              <Select
                placeholder="Filter by type"
                value={selectedType}
                onChange={(value) => setSelectedType(value as AssetType | 'all')}
                data={[
                  { value: 'all', label: 'All Types' },
                  { value: 'image', label: 'Images' },
                  { value: 'token', label: 'Tokens' },
                  { value: 'audio', label: 'Audio' },
                  { value: 'map', label: 'Maps' }
                ]}
                leftSection={<IconFilter size={16} />}
                style={{ width: 150 }}
              />
            </Group>
            
            <Group>
              <ActionIcon
                variant={viewMode === 'grid' ? 'filled' : 'outline'}
                onClick={() => setViewMode('grid')}
              >
                <IconLayout size={16} />
              </ActionIcon>
              
              <ActionIcon
                variant={viewMode === 'list' ? 'filled' : 'outline'}
                onClick={() => setViewMode('list')}
              >
                <IconList size={16} />
              </ActionIcon>
            </Group>
          </Group>
          
          <Group justify="space-between">
            <Text size="sm" color="dimmed">
              {filteredAssets.length} of {assets.length} assets
            </Text>
            
            {/* Debug info - remove in production */}
            <Text size="xs" color="dimmed">
              Debug: assets.length = {assets.length}, filteredAssets.length = {filteredAssets.length}
            </Text>
          </Group>
        </Card>

        {/* Upload Progress */}
        {Object.keys(uploadProgress).length > 0 && (
          <Card withBorder p="md">
            <Title order={4} mb="md">Uploading Files</Title>
            <Stack gap="sm">
              {uploadingFiles.map((file, index) => {
                const assetId = Object.keys(uploadProgress)[index];
                const progress = uploadProgress[assetId] || 0;
                
                return (
                  <Box key={index}>
                    <Group justify="space-between" mb="xs">
                      <Text size="sm">{file.name}</Text>
                      <Text size="sm" c="dimmed">{progress}%</Text>
                    </Group>
                    <Progress value={progress} size="sm" />
                  </Box>
                );
              })}
            </Stack>
          </Card>
        )}

        {/* Assets Grid/List */}
        <Card withBorder p="md">
          {filteredAssets.length === 0 ? (
            <Center py="xl">
              <Stack align="center" gap="md">
                <IconPhoto size={48} color="gray" />
                <Text c="dimmed">No assets found</Text>
                <Text size="sm" c="dimmed">
                  Upload some assets to get started
                </Text>
              </Stack>
            </Center>
          ) : viewMode === 'grid' ? (
            <SimpleGrid cols={4} spacing="md">
              {filteredAssets.map((asset) => (
                <Card key={asset.id} withBorder p="sm" style={{ cursor: 'pointer' }}>
                  <Stack gap="sm">
                    {/* Thumbnail */}
                    <Box style={{ position: 'relative' }}>
                      {asset.thumbnail ? (
                        <Image
                          src={asset.thumbnail}
                          alt={asset.name}
                          height={120}
                          radius="sm"
                          onClick={() => onAssetSelect(asset)}
                        />
                      ) : (
                        <Box
                          style={{
                            height: 120,
                            backgroundColor: '#f8f9fa',
                            borderRadius: 4,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                          }}
                          onClick={() => onAssetSelect(asset)}
                        >
                          {getAssetTypeIcon(asset.type)}
                        </Box>
                      )}
                      
                      {/* Type Badge */}
                      <Badge
                        size="xs"
                        style={{
                          position: 'absolute',
                          top: 8,
                          right: 8
                        }}
                        color={
                          asset.type === 'image' ? 'blue' :
                          asset.type === 'token' ? 'green' :
                          asset.type === 'audio' ? 'purple' :
                          asset.type === 'map' ? 'orange' : 'gray'
                        }
                      >
                        {asset.type}
                      </Badge>
                    </Box>
                    
                    {/* Asset Info */}
                    <Box>
                      <Text size="sm" fw={500} lineClamp={2}>
                        {asset.name}
                      </Text>
                      <Text size="xs" c="dimmed">
                        {formatFileSize(asset.size)}
                      </Text>
                      <Text size="xs" c="dimmed">
                        {formatDate(asset.uploadedAt)}
                      </Text>
                    </Box>
                    
                    {/* Actions */}
                    <Group justify="space-between">
                      <Button
                        size="xs"
                        variant="outline"
                        onClick={() => onAssetSelect(asset)}
                      >
                        Use
                      </Button>
                      
                      <Menu shadow="md" width={200}>
                        <Menu.Target>
                          <ActionIcon variant="outline" size="sm">
                            <IconDots size={14} />
                          </ActionIcon>
                        </Menu.Target>
                        
                        <Menu.Dropdown>
                          <Menu.Item
                            leftSection={<IconEdit size={14} />}
                            onClick={() => handleAssetEdit(asset)}
                          >
                            Edit
                          </Menu.Item>
                          {(asset.type === 'image' || asset.type === 'token') && (
                            <Menu.Item
                              leftSection={<IconPlus size={14} />}
                              onClick={() => handleCreateTokenFromAsset(asset)}
                            >
                              Create Token
                            </Menu.Item>
                          )}
                          <Menu.Item
                            leftSection={<IconCopy size={14} />}
                            onClick={() => {
                              // Duplicate logic
                            }}
                          >
                            Duplicate
                          </Menu.Item>
                          <Menu.Item
                            leftSection={<IconDownload size={14} />}
                            onClick={() => {
                              const a = document.createElement('a');
                              a.href = asset.url;
                              a.download = asset.name;
                              a.click();
                            }}
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
                  </Stack>
                </Card>
              ))}
            </SimpleGrid>
          ) : (
            <ScrollArea.Autosize mah={600}>
              <Stack gap="sm">
                {filteredAssets.map((asset) => (
                  <Card key={asset.id} withBorder p="sm">
                    <Group justify="space-between">
                      <Group>
                        {asset.thumbnail ? (
                          <Image
                            src={asset.thumbnail}
                            alt={asset.name}
                            width={60}
                            height={45}
                            radius="sm"
                          />
                        ) : (
                          <Box
                            style={{
                              width: 60,
                              height: 45,
                              backgroundColor: '#f8f9fa',
                              borderRadius: 4,
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center'
                            }}
                          >
                            {getAssetTypeIcon(asset.type)}
                          </Box>
                        )}
                        
                        <Box>
                          <Text fw={500}>{asset.name}</Text>
                          <Text size="sm" c="dimmed">
                            {formatFileSize(asset.size)} • {formatDate(asset.uploadedAt)}
                          </Text>
                        </Box>
                      </Group>
                      
                      <Group>
                        <Badge
                          color={
                            asset.type === 'image' ? 'blue' :
                            asset.type === 'token' ? 'green' :
                            asset.type === 'audio' ? 'purple' :
                            asset.type === 'map' ? 'orange' : 'gray'
                          }
                        >
                          {asset.type}
                        </Badge>
                        
                        <Button
                          size="xs"
                          variant="outline"
                          onClick={() => onAssetSelect(asset)}
                        >
                          Use
                        </Button>
                        
                        <Menu shadow="md" width={200}>
                          <Menu.Target>
                            <ActionIcon variant="outline">
                              <IconDots size={16} />
                            </ActionIcon>
                          </Menu.Target>
                          
                          <Menu.Dropdown>
                            <Menu.Item
                              leftSection={<IconEdit size={14} />}
                              onClick={() => handleAssetEdit(asset)}
                            >
                              Edit
                            </Menu.Item>
                            {(asset.type === 'image' || asset.type === 'token') && (
                              <Menu.Item
                                leftSection={<IconPlus size={14} />}
                                onClick={() => handleCreateTokenFromAsset(asset)}
                              >
                                Create Token
                              </Menu.Item>
                            )}
                            <Menu.Item
                              leftSection={<IconCopy size={14} />}
                              onClick={() => {
                                // Duplicate logic
                              }}
                            >
                              Duplicate
                            </Menu.Item>
                            <Menu.Item
                              leftSection={<IconDownload size={14} />}
                              onClick={() => {
                                const a = document.createElement('a');
                                a.href = asset.url;
                                a.download = asset.name;
                                a.click();
                              }}
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
                    </Group>
                  </Card>
                ))}
              </Stack>
            </ScrollArea.Autosize>
          )}
        </Card>
      </Stack>

      {/* Upload Modal */}
      <Modal
        opened={uploadModalOpened}
        onClose={() => {
          setUploadModalOpened(false);
          setAssetForm({});
          setTokenData({});
        }}
        title="Upload Assets"
        size="lg"
      >
        <Stack gap="md">
          <Tabs defaultValue="upload">
            <Tabs.List>
              <Tabs.Tab value="upload">Upload Files</Tabs.Tab>
              <Tabs.Tab value="token">Create Token Asset</Tabs.Tab>
            </Tabs.List>
            
            <Tabs.Panel value="upload">
              <Stack gap="md">
                <FileInput
                  label="Select Files"
                  placeholder="Choose files to upload"
                  multiple
                  accept="image/*,audio/*"
                  ref={fileInputRef}
                  onChange={(files) => {
                    if (files) {
                      handleFileUpload(Array.from(files));
                    }
                  }}
                />
                
                <Box
                  style={{
                    border: '2px dashed #ccc',
                    borderRadius: 8,
                    padding: '2rem',
                    textAlign: 'center',
                    cursor: 'pointer'
                  }}
                  onDragOver={handleDragOver}
                  onDrop={handleDrop}
                  onClick={() => fileInputRef.current?.click()}
                >
                  <Stack align="center" gap="md">
                    <IconUpload size={48} color="gray" />
                    <Text c="dimmed">
                      Drag and drop files here, or click to select
                    </Text>
                    <Text size="sm" c="dimmed">
                      Supports images, audio files, and maps
                    </Text>
                  </Stack>
                </Box>
              </Stack>
            </Tabs.Panel>
            
            <Tabs.Panel value="token">
              <Stack gap="md">
                <TextInput
                  label="Token Name"
                  placeholder="Enter token name"
                  value={assetForm.name || ''}
                  onChange={(e) => setAssetForm(prev => ({ ...prev, name: e.target.value }))}
                  required
                />
                
                <FileInput
                  label="Token Image"
                  placeholder="Select token image"
                  accept="image/*"
                  required
                  onChange={(file) => {
                    if (file) {
                      const reader = new FileReader();
                      reader.onload = (e) => {
                        setAssetForm(prev => ({ 
                          ...prev, 
                          url: e.target?.result as string,
                          thumbnail: e.target?.result as string
                        }));
                      };
                      reader.readAsDataURL(file);
                    }
                  }}
                />
                
                <Divider label="Token Properties" />
                
                <Grid>
                  <Grid.Col span={6}>
                    <NumberInput
                      label="Size"
                      value={tokenData.size || 1}
                      onChange={(value) => setTokenData(prev => ({ ...prev, size: typeof value === 'number' ? value : 1 }))}
                      min={0.1}
                      max={5}
                      step={0.1}
                    />
                  </Grid.Col>
                  <Grid.Col span={6}>
                    <NumberInput
                      label="Rotation"
                      value={tokenData.rotation || 0}
                      onChange={(value) => setTokenData(prev => ({ ...prev, rotation: typeof value === 'number' ? value : 0 }))}
                      min={0}
                      max={360}
                    />
                  </Grid.Col>
                </Grid>
                
                <Grid>
                  <Grid.Col span={4}>
                    <NumberInput
                      label="Current HP"
                      value={tokenData.hp?.current || 10}
                      onChange={(value) => setTokenData(prev => ({ 
                        ...prev, 
                        hp: { 
                          ...prev.hp, 
                          current: typeof value === 'number' ? value : 10, 
                          max: prev.hp?.max || 10,
                          temporary: prev.hp?.temporary || 0
                        }
                      }))}
                      min={0}
                    />
                  </Grid.Col>
                  <Grid.Col span={4}>
                    <NumberInput
                      label="Max HP"
                      value={tokenData.hp?.max || 10}
                      onChange={(value) => setTokenData(prev => ({ 
                        ...prev, 
                        hp: { 
                          ...prev.hp, 
                          current: prev.hp?.current || 10, 
                          max: typeof value === 'number' ? value : 10,
                          temporary: prev.hp?.temporary || 0
                        }
                      }))}
                      min={1}
                    />
                  </Grid.Col>
                  <Grid.Col span={4}>
                    <NumberInput
                      label="Temp HP"
                      value={tokenData.hp?.temporary || 0}
                      onChange={(value) => setTokenData(prev => ({ 
                        ...prev, 
                        hp: { 
                          ...prev.hp, 
                          current: prev.hp?.current || 10, 
                          max: prev.hp?.max || 10,
                          temporary: typeof value === 'number' ? value : 0
                        }
                      }))}
                      min={0}
                    />
                  </Grid.Col>
                </Grid>
                
                <Grid>
                  <Grid.Col span={6}>
                    <NumberInput
                      label="Armor Class (AC)"
                      value={tokenData.ac || 10}
                      onChange={(value) => setTokenData(prev => ({ ...prev, ac: typeof value === 'number' ? value : 10 }))}
                      min={0}
                      max={30}
                    />
                  </Grid.Col>
                  <Grid.Col span={6}>
                    <NumberInput
                      label="Speed"
                      value={tokenData.speed || 30}
                      onChange={(value) => setTokenData(prev => ({ ...prev, speed: typeof value === 'number' ? value : 30 }))}
                      min={0}
                    />
                  </Grid.Col>
                </Grid>
                
                <Textarea
                  label="Description"
                  placeholder="Enter token description"
                  value={tokenData.description || ''}
                  onChange={(e) => setTokenData(prev => ({ ...prev, description: e.target.value }))}
                  rows={3}
                />
                
                <Textarea
                  label="Notes"
                  placeholder="Additional notes"
                  value={tokenData.notes || ''}
                  onChange={(e) => setTokenData(prev => ({ ...prev, notes: e.target.value }))}
                  rows={2}
                />
                
                <Group>
                  <Switch
                    label="Visible"
                    checked={tokenData.visible !== false}
                    onChange={(e) => setTokenData(prev => ({ ...prev, visible: e.currentTarget.checked }))}
                  />
                  <Switch
                    label="Locked"
                    checked={tokenData.locked || false}
                    onChange={(e) => setTokenData(prev => ({ ...prev, locked: e.currentTarget.checked }))}
                  />
                </Group>
                
                <Button
                  onClick={() => {
                    if (assetForm.name && assetForm.url) {
                      const newAsset: Asset = {
                        id: `asset_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
                        name: assetForm.name,
                        type: 'token',
                        url: assetForm.url,
                        thumbnail: assetForm.thumbnail || assetForm.url,
                        size: 0, // Will be set from file size
                        uploadedAt: new Date(),
                        tokenData: {
                          hp: tokenData.hp || { current: 10, max: 10, temporary: 0 },
                          states: [],
                          ownerId: 'gm_1',
                          locked: tokenData.locked || false,
                          visible: tokenData.visible !== false,
                          size: tokenData.size || 1,
                          rotation: tokenData.rotation || 0,
                          description: tokenData.description,
                          ac: tokenData.ac,
                          speed: tokenData.speed,
                          notes: tokenData.notes
                        }
                      };
                      addAsset(newAsset);
                      setUploadModalOpened(false);
                      setAssetForm({});
                      setTokenData({});
                    }
                  }}
                  disabled={!assetForm.name || !assetForm.url}
                >
                  Create Token Asset
                </Button>
              </Stack>
            </Tabs.Panel>
          </Tabs>
          
          <Group justify="flex-end" mt="md">
            <Button variant="outline" onClick={() => {
              setUploadModalOpened(false);
              setAssetForm({});
              setTokenData({});
            }}>
              Cancel
            </Button>
          </Group>
        </Stack>
      </Modal>

      {/* Edit Asset Modal */}
      <Modal
        opened={!!editingAsset}
        onClose={() => {
          setEditingAsset(null);
          setAssetForm({});
        }}
        title="Edit Asset"
        size="md"
      >
        <Stack gap="md">
          <TextInput
            label="Asset Name"
            value={assetForm.name || ''}
            onChange={(e) => setAssetForm(prev => ({ ...prev, name: e.target.value }))}
          />
          
          <Select
            label="Asset Type"
            value={assetForm.type || 'file'}
            onChange={(value) => setAssetForm(prev => ({ ...prev, type: value as AssetType }))}
            data={[
              { value: 'image', label: 'Image' },
              { value: 'token', label: 'Token' },
              { value: 'audio', label: 'Audio' },
              { value: 'map', label: 'Map' }
            ]}
          />
          
          <Group justify="flex-end" mt="md">
            <Button variant="outline" onClick={() => setEditingAsset(null)}>
              Cancel
            </Button>
            <Button onClick={handleFormSubmit}>
              Save Changes
            </Button>
          </Group>
        </Stack>
      </Modal>

      {/* Token Creator Modal */}
      <TokenCreator
        opened={tokenCreatorOpened}
        onClose={() => {
          setTokenCreatorOpened(false);
          setSelectedAssetForToken(null);
        }}
        fromAsset={selectedAssetForToken || undefined}
        initialPosition={{ x: 100, y: 100 }}
      />
      </Container>
    </ScrollArea>
  );
};
