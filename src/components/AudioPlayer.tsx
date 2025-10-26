import React, { useState } from 'react';
import {
  Container,
  Title,
  Text,
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
  ScrollArea,
  Box,
  Alert,
  Textarea,
  NumberInput,
  Switch,
  Slider,
  Center,
  SimpleGrid
} from '@mantine/core';
import {
  IconPlus,
  IconDownload,
  IconTrash,
  IconEdit,
  IconDots,
  IconSearch,
  IconMusic,
  IconPlayerPlay,
  IconPlayerPause,
  IconPlayerSkipForward,
  IconPlayerSkipBack,
  IconVolume,
  IconRepeat,
  IconPlaylist,
  IconCopy,
  IconAlertCircle
} from '@tabler/icons-react';
import { useMapStore } from '../stores/mapStore';
import { useAudio } from '../hooks/useAudio';
import { AudioPlayerProps, AudioTrack, Playlist } from '../types/models';

export const AudioPlayer: React.FC<AudioPlayerProps> = ({
  playlist,
  onTrackChange,
  onVolumeChange,
  onPlayPause
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [playlistModalOpened, setPlaylistModalOpened] = useState(false);
  const [trackModalOpened, setTrackModalOpened] = useState(false);
  const [editingPlaylist, setEditingPlaylist] = useState<Playlist | null>(null);
  const [editingTrack, setEditingTrack] = useState<AudioTrack | null>(null);
  const [playlistForm, setPlaylistForm] = useState<Partial<Playlist>>({});
  const [trackForm, setTrackForm] = useState<Partial<AudioTrack>>({});
  const [shuffleMode, setShuffleMode] = useState(false);
  const [repeatMode, setRepeatMode] = useState<'none' | 'one' | 'all'>('none');

  const {
    playlists,
    currentPlaylist,
    addPlaylist,
    updatePlaylist,
    deletePlaylist,
    setCurrentPlaylist
  } = useMapStore();

  const {
    isPlaying,
    currentTime,
    duration,
    volume,
    currentTrack,
    isLoading,
    error,
    togglePlayPause,
    playNext,
    playPrevious,
    seek,
    setVolume: setAudioVolume,
    formatTime
  } = useAudio();

  // Handle playlist creation
  const handleCreatePlaylist = () => {
    if (playlistForm.name) {
      const newPlaylist: Playlist = {
        id: `playlist_${Date.now()}`,
        name: playlistForm.name,
        tracks: [],
        currentTrackIndex: 0,
        isPlaying: false,
        volume: 1
      };
      addPlaylist(newPlaylist);
      setPlaylistForm({});
      setPlaylistModalOpened(false);
    }
  };

  // Handle track addition
  const handleAddTrack = () => {
    if (trackForm.name && trackForm.url && currentPlaylist) {
      const newTrack: AudioTrack = {
        id: `track_${Date.now()}`,
        name: trackForm.name,
        url: trackForm.url,
        volume: trackForm.volume || 1,
        loop: trackForm.loop || false,
        fadeIn: trackForm.fadeIn || 0,
        fadeOut: trackForm.fadeOut || 0,
        duration: trackForm.duration || 0
      };
      
      const updatedPlaylist = {
        ...currentPlaylist,
        tracks: [...currentPlaylist.tracks, newTrack]
      };
      
      updatePlaylist(currentPlaylist.id, updatedPlaylist);
      setTrackForm({});
      setTrackModalOpened(false);
    }
  };

  // Handle track file upload
  const handleTrackUpload = (file: File | null) => {
    if (file) {
      const url = URL.createObjectURL(file);
      setTrackForm(prev => ({
        ...prev,
        name: file.name.replace(/\.[^/.]+$/, ""), // Remove extension
        url: url
      }));
    }
  };

  // Handle volume change
  const handleVolumeChange = (value: number) => {
    setAudioVolume(value);
    onVolumeChange(value);
  };

  // Handle track selection
  const handleTrackSelect = (trackIndex: number) => {
    onTrackChange(trackIndex);
  };

  // Handle play/pause
  const handlePlayPause = () => {
    togglePlayPause();
    onPlayPause(!isPlaying);
  };

  // Handle seek
  const handleSeek = (value: number) => {
    seek(value);
  };

  // Handle repeat mode toggle
  const handleRepeatToggle = () => {
    const modes: Array<'none' | 'one' | 'all'> = ['none', 'one', 'all'];
    const currentIndex = modes.indexOf(repeatMode);
    const nextMode = modes[(currentIndex + 1) % modes.length];
    setRepeatMode(nextMode);
  };

  // Get repeat icon
  const getRepeatIcon = () => {
    switch (repeatMode) {
      case 'one':
        return <IconRepeat size={16} style={{ color: '#4dabf7' }} />;
      case 'all':
        return <IconRepeat size={16} style={{ color: '#4dabf7' }} />;
      default:
        return <IconRepeat size={16} />;
    }
  };

  // Filter tracks based on search
  const filteredTracks = currentPlaylist?.tracks.filter(track =>
    track.name.toLowerCase().includes(searchQuery.toLowerCase())
  ) || [];

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
      <Container fluid>
        <Stack gap="xl">
        {/* Header */}
        <Group justify="space-between">
          <Box>
            <Title order={2}>Audio Player</Title>
            <Text c="dimmed">
              Manage your audio playlists and ambient sounds
            </Text>
          </Box>
          
          <Group>
            <Button
              leftSection={<IconPlus size={16} />}
              onClick={() => setPlaylistModalOpened(true)}
            >
              New Playlist
            </Button>
            
            <Button
              leftSection={<IconPlus size={16} />}
              onClick={() => setTrackModalOpened(true)}
              disabled={!currentPlaylist}
            >
              Add Track
            </Button>
          </Group>
        </Group>
        
        {/* Playlist Selector */}
        <Card withBorder p="md">
          <Group justify="space-between" mb="md">
            <Title order={4}>Current Playlist</Title>
            <Select
              placeholder="Select a playlist"
              value={currentPlaylist?.id || ''}
              onChange={(value) => {
                const playlist = playlists.find(p => p.id === value);
                setCurrentPlaylist(playlist || null);
              }}
              data={playlists.map(p => ({ value: p.id, label: p.name }))}
              style={{ width: 200 }}
            />
          </Group>
          
          {currentPlaylist && (
            <Group>
              <Badge color="blue" size="lg">
                {currentPlaylist.name}
              </Badge>
              <Text size="sm" color="dimmed">
                {currentPlaylist.tracks.length} tracks
              </Text>
            </Group>
          )}
        </Card>

        {/* Main Player */}
        {currentPlaylist && currentTrack && (
          <Card withBorder p="md">
            <Stack gap="md">
              {/* Track Info */}
              <Group justify="space-between">
                <Box>
                  <Text size="lg" fw={500}>{currentTrack.name}</Text>
                  <Text size="sm" c="dimmed">
                    Track {currentPlaylist.currentTrackIndex + 1} of {currentPlaylist.tracks.length}
                  </Text>
                </Box>
                
                <Group>
                  <ActionIcon
                    variant={shuffleMode ? 'filled' : 'outline'}
                    onClick={() => setShuffleMode(!shuffleMode)}
                  >
                    <IconRepeat size={16} />
                  </ActionIcon>
                  
                  <ActionIcon
                    variant="outline"
                    onClick={handleRepeatToggle}
                  >
                    {getRepeatIcon()}
                  </ActionIcon>
                </Group>
              </Group>

              {/* Progress Bar */}
              <Box>
                <Group justify="space-between" mb="xs">
                  <Text size="sm" c="dimmed">
                    {formatTime(currentTime)}
                  </Text>
                  <Text size="sm" c="dimmed">
                    {formatTime(duration)}
                  </Text>
                </Group>
                
                <Slider
                  value={currentTime}
                  max={duration}
                  onChange={handleSeek}
                  size="sm"
                  styles={{
                    thumb: {
                      width: 16,
                      height: 16,
                    },
                  }}
                />
              </Box>

              {/* Controls */}
              <Group justify="center" gap="lg">
                <ActionIcon
                  size="lg"
                  variant="outline"
                  onClick={playPrevious}
                >
                  <IconPlayerSkipBack size={20} />
                </ActionIcon>
                
                <ActionIcon
                  size="xl"
                  variant="filled"
                  onClick={handlePlayPause}
                  loading={isLoading}
                >
                  {isPlaying ? <IconPlayerPause size={24} /> : <IconPlayerPlay size={24} />}
                </ActionIcon>
                
                <ActionIcon
                  size="lg"
                  variant="outline"
                  onClick={playNext}
                >
                  <IconPlayerSkipForward size={20} />
                </ActionIcon>
              </Group>

              {/* Volume Control */}
              <Group justify="center" gap="md">
                <IconVolume size={16} />
                <Slider
                  value={volume}
                  onChange={handleVolumeChange}
                  min={0}
                  max={1}
                  step={0.1}
                  style={{ width: 150 }}
                  size="sm"
                />
                <Text size="sm" color="dimmed">
                  {Math.round(volume * 100)}%
                </Text>
              </Group>

              {/* Error Display */}
              {error && (
                <Alert icon={<IconAlertCircle size={16} />} color="red">
                  {error}
                </Alert>
              )}
            </Stack>
          </Card>
        )}

        {/* Track List */}
        {currentPlaylist && (
          <Card withBorder p="md">
            <Group justify="space-between" mb="md">
              <Title order={4}>Tracks</Title>
              
              <TextInput
                placeholder="Search tracks..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                leftSection={<IconSearch size={16} />}
                style={{ width: 300 }}
              />
            </Group>
            
            <ScrollArea.Autosize mah={400}>
              <Stack gap="sm">
                {filteredTracks.length === 0 ? (
                  <Center py="xl">
                    <Stack align="center" gap="md">
                      <IconMusic size={48} color="gray" />
                      <Text c="dimmed">No tracks found</Text>
                      <Text size="sm" c="dimmed">
                        Add some tracks to your playlist
                      </Text>
                    </Stack>
                  </Center>
                ) : (
                  filteredTracks.map((track, index) => (
                    <Card
                      key={track.id}
                      withBorder
                      p="sm"
                      style={{
                        cursor: 'pointer',
                        backgroundColor: currentPlaylist.currentTrackIndex === index ? '#f8f9fa' : 'transparent'
                      }}
                      onClick={() => handleTrackSelect(index)}
                    >
                      <Group justify="space-between">
                        <Group>
                          <ActionIcon
                            variant="outline"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleTrackSelect(index);
                            }}
                          >
                            {currentPlaylist.currentTrackIndex === index && isPlaying ? (
                              <IconPlayerPause size={14} />
                            ) : (
                              <IconPlayerPlay size={14} />
                            )}
                          </ActionIcon>
                          
                          <Box>
                            <Text fw={500}>{track.name}</Text>
                            <Text size="sm" c="dimmed">
                              {formatTime(track.duration)}
                            </Text>
                          </Box>
                        </Group>
                        
                        <Group>
                          {track.loop && (
                            <Badge size="sm" color="blue">Loop</Badge>
                          )}
                          
                          <Text size="sm" color="dimmed">
                            {Math.round(track.volume * 100)}%
                          </Text>
                          
                          <Menu shadow="md" width={200}>
                            <Menu.Target>
                              <ActionIcon
                                variant="outline"
                                onClick={(e) => e.stopPropagation()}
                              >
                                <IconDots size={16} />
                              </ActionIcon>
                            </Menu.Target>
                            
                            <Menu.Dropdown>
                              <Menu.Item
                                leftSection={<IconEdit size={14} />}
                                onClick={() => {
                                  setEditingTrack(track);
                                  setTrackForm(track);
                                  setTrackModalOpened(true);
                                }}
                              >
                                Edit
                              </Menu.Item>
                              <Menu.Item
                                leftSection={<IconCopy size={14} />}
                                onClick={() => {
                                  // Duplicate track logic
                                }}
                              >
                                Duplicate
                              </Menu.Item>
                              <Menu.Item
                                leftSection={<IconDownload size={14} />}
                                onClick={() => {
                                  const a = document.createElement('a');
                                  a.href = track.url;
                                  a.download = track.name;
                                  a.click();
                                }}
                              >
                                Download
                              </Menu.Item>
                              <Menu.Divider />
                              <Menu.Item
                                leftSection={<IconTrash size={14} />}
                                color="red"
                                onClick={() => {
                                  const updatedTracks = currentPlaylist.tracks.filter(t => t.id !== track.id);
                                  updatePlaylist(currentPlaylist.id, { tracks: updatedTracks });
                                }}
                              >
                                Remove
                              </Menu.Item>
                            </Menu.Dropdown>
                          </Menu>
                        </Group>
                      </Group>
                    </Card>
                  ))
                )}
              </Stack>
            </ScrollArea.Autosize>
          </Card>
        )}

        {/* Playlist List */}
        <Card withBorder p="md">
          <Title order={4} mb="md">All Playlists</Title>
          
          <SimpleGrid cols={3} spacing="md">
            {playlists.map((playlist) => (
              <Card key={playlist.id} withBorder p="sm">
                <Stack gap="sm">
                  <Group justify="space-between">
                    <Text fw={500}>{playlist.name}</Text>
                    <Menu shadow="md" width={200}>
                      <Menu.Target>
                        <ActionIcon variant="outline" size="sm">
                          <IconDots size={14} />
                        </ActionIcon>
                      </Menu.Target>
                      
                      <Menu.Dropdown>
                        <Menu.Item
                          leftSection={<IconPlaylist size={14} />}
                          onClick={() => setCurrentPlaylist(playlist)}
                        >
                          Load Playlist
                        </Menu.Item>
                        <Menu.Item
                          leftSection={<IconEdit size={14} />}
                          onClick={() => {
                            setEditingPlaylist(playlist);
                            setPlaylistForm(playlist);
                            setPlaylistModalOpened(true);
                          }}
                        >
                          Edit
                        </Menu.Item>
                        <Menu.Item
                          leftSection={<IconCopy size={14} />}
                          onClick={() => {
                            // Duplicate playlist logic
                          }}
                        >
                          Duplicate
                        </Menu.Item>
                        <Menu.Divider />
                        <Menu.Item
                          leftSection={<IconTrash size={14} />}
                          color="red"
                          onClick={() => deletePlaylist(playlist.id)}
                        >
                          Delete
                        </Menu.Item>
                      </Menu.Dropdown>
                    </Menu>
                  </Group>
                  
                  <Text size="sm" c="dimmed">
                    {playlist.tracks.length} tracks
                  </Text>
                  
                  <Button
                    size="xs"
                    variant="outline"
                    onClick={() => setCurrentPlaylist(playlist)}
                  >
                    Load
                  </Button>
                </Stack>
              </Card>
            ))}
          </SimpleGrid>
        </Card>
      </Stack>

      {/* Create Playlist Modal */}
      <Modal
        opened={playlistModalOpened}
        onClose={() => {
          setPlaylistModalOpened(false);
          setPlaylistForm({});
          setEditingPlaylist(null);
        }}
        title={editingPlaylist ? "Edit Playlist" : "Create New Playlist"}
        size="md"
      >
        <Stack gap="md">
          <TextInput
            label="Playlist Name"
            placeholder="Enter playlist name"
            value={playlistForm.name || ''}
            onChange={(e) => setPlaylistForm(prev => ({ ...prev, name: e.target.value }))}
            required
          />
          
          <Textarea
            label="Description"
            placeholder="Optional playlist description"
            value={playlistForm.name || ''}
            onChange={(e) => setPlaylistForm(prev => ({ ...prev, name: e.target.value }))}
            minRows={3}
          />
          
          <Group justify="flex-end" mt="md">
            <Button variant="outline" onClick={() => setPlaylistModalOpened(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreatePlaylist}>
              {editingPlaylist ? 'Update Playlist' : 'Create Playlist'}
            </Button>
          </Group>
        </Stack>
      </Modal>

      {/* Add Track Modal */}
      <Modal
        opened={trackModalOpened}
        onClose={() => {
          setTrackModalOpened(false);
          setTrackForm({});
          setEditingTrack(null);
        }}
        title={editingTrack ? "Edit Track" : "Add New Track"}
        size="md"
      >
        <Stack gap="md">
          <TextInput
            label="Track Name"
            placeholder="Enter track name"
            value={trackForm.name || ''}
            onChange={(e) => setTrackForm(prev => ({ ...prev, name: e.target.value }))}
            required
          />
          
          <FileInput
            label="Audio File"
            placeholder="Select audio file"
            accept="audio/*"
            onChange={handleTrackUpload}
            required
          />
          
          <Group grow>
            <NumberInput
              label="Volume"
              value={trackForm.volume || 1}
              onChange={(value) => setTrackForm(prev => ({ ...prev, volume: typeof value === 'number' ? value : 1 }))}
              min={0}
              max={1}
              step={0.1}
            />
            
            <NumberInput
              label="Duration (seconds)"
              value={trackForm.duration || 0}
              onChange={(value) => setTrackForm(prev => ({ ...prev, duration: typeof value === 'number' ? value : 0 }))}
              min={0}
            />
          </Group>
          
          <Group grow>
            <NumberInput
              label="Fade In (ms)"
              value={trackForm.fadeIn || 0}
              onChange={(value) => setTrackForm(prev => ({ ...prev, fadeIn: typeof value === 'number' ? value : 0 }))}
              min={0}
            />
            
            <NumberInput
              label="Fade Out (ms)"
              value={trackForm.fadeOut || 0}
              onChange={(value) => setTrackForm(prev => ({ ...prev, fadeOut: typeof value === 'number' ? value : 0 }))}
              min={0}
            />
          </Group>
          
          <Switch
            label="Loop track"
            checked={trackForm.loop || false}
            onChange={(e) => setTrackForm(prev => ({ ...prev, loop: e.currentTarget.checked }))}
          />
          
          <Group justify="flex-end" mt="md">
            <Button variant="outline" onClick={() => setTrackModalOpened(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddTrack}>
              {editingTrack ? 'Update Track' : 'Add Track'}
            </Button>
          </Group>
        </Stack>
      </Modal>
      </Container>
    </ScrollArea>
  );
};
