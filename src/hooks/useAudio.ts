import { useCallback, useEffect, useRef, useState } from 'react';
import { AudioTrack, Playlist } from '../types/models';
import { useMapStore } from '../stores/mapStore';

interface UseAudioOptions {
  autoPlay?: boolean;
  crossfade?: boolean;
  crossfadeDuration?: number;
}

export const useAudio = ({
  autoPlay = false,
  crossfade = true,
  crossfadeDuration = 2000
}: UseAudioOptions = {}) => {
  const { currentPlaylist, updatePlaylist } = useMapStore();
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const crossfadeTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const progressIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Initialize audio element
  useEffect(() => {
    if (!audioRef.current) {
      audioRef.current = new Audio();
      audioRef.current.preload = 'metadata';
    }

    const audio = audioRef.current;

    const handleLoadedMetadata = () => {
      setDuration(audio.duration);
      setIsLoading(false);
    };

    const handleTimeUpdate = () => {
      setCurrentTime(audio.currentTime);
    };

    const handleEnded = () => {
      if (currentPlaylist) {
        playNext();
      } else {
        setIsPlaying(false);
        setCurrentTime(0);
      }
    };

    const handleError = () => {
      setError('Failed to load audio track');
      setIsLoading(false);
      setIsPlaying(false);
    };

    const handleCanPlay = () => {
      setIsLoading(false);
    };

    const handleLoadStart = () => {
      setIsLoading(true);
      setError(null);
    };

    audio.addEventListener('loadedmetadata', handleLoadedMetadata);
    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('ended', handleEnded);
    audio.addEventListener('error', handleError);
    audio.addEventListener('canplay', handleCanPlay);
    audio.addEventListener('loadstart', handleLoadStart);

    return () => {
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('ended', handleEnded);
      audio.removeEventListener('error', handleError);
      audio.removeEventListener('canplay', handleCanPlay);
      audio.removeEventListener('loadstart', handleLoadStart);
    };
  }, [currentPlaylist]);

  // Update volume when it changes
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume;
    }
  }, [volume]);

  // Play current track
  const play = useCallback(async () => {
    if (!audioRef.current || !currentPlaylist) return;

    const currentTrack = currentPlaylist.tracks[currentPlaylist.currentTrackIndex];
    if (!currentTrack) return;

    try {
      audioRef.current.src = currentTrack.url;
      audioRef.current.volume = currentTrack.volume * volume;
      audioRef.current.loop = currentTrack.loop;
      
      await audioRef.current.play();
      setIsPlaying(true);
      setError(null);
    } catch (err) {
      setError('Failed to play audio track');
      setIsPlaying(false);
    }
  }, [currentPlaylist, volume]);

  // Pause current track
  const pause = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      setIsPlaying(false);
    }
  }, []);

  // Toggle play/pause
  const togglePlayPause = useCallback(() => {
    if (isPlaying) {
      pause();
    } else {
      play();
    }
  }, [isPlaying, play, pause]);

  // Play next track
  const playNext = useCallback(() => {
    if (!currentPlaylist) return;

    const nextIndex = (currentPlaylist.currentTrackIndex + 1) % currentPlaylist.tracks.length;
    updatePlaylist(currentPlaylist.id, { currentTrackIndex: nextIndex });
  }, [currentPlaylist, updatePlaylist]);

  // Play previous track
  const playPrevious = useCallback(() => {
    if (!currentPlaylist) return;

    const prevIndex = currentPlaylist.currentTrackIndex === 0 
      ? currentPlaylist.tracks.length - 1 
      : currentPlaylist.currentTrackIndex - 1;
    updatePlaylist(currentPlaylist.id, { currentTrackIndex: prevIndex });
  }, [currentPlaylist, updatePlaylist]);

  // Seek to specific time
  const seek = useCallback((time: number) => {
    if (audioRef.current) {
      audioRef.current.currentTime = time;
      setCurrentTime(time);
    }
  }, []);

  // Set volume
  const setAudioVolume = useCallback((newVolume: number) => {
    const clampedVolume = Math.max(0, Math.min(1, newVolume));
    setVolume(clampedVolume);
    
    if (currentPlaylist) {
      updatePlaylist(currentPlaylist.id, { volume: clampedVolume });
    }
  }, [currentPlaylist, updatePlaylist]);

  // Fade in
  const fadeIn = useCallback((duration: number = 2000) => {
    if (!audioRef.current) return;

    const startVolume = 0;
    const endVolume = volume;
    const steps = 50;
    const stepDuration = duration / steps;
    const volumeStep = (endVolume - startVolume) / steps;

    let currentStep = 0;
    audioRef.current.volume = startVolume;

    const fadeInterval = setInterval(() => {
      currentStep++;
      const newVolume = startVolume + (volumeStep * currentStep);
      audioRef.current!.volume = newVolume;

      if (currentStep >= steps) {
        clearInterval(fadeInterval);
        audioRef.current!.volume = endVolume;
      }
    }, stepDuration);
  }, [volume]);

  // Fade out
  const fadeOut = useCallback((duration: number = 2000) => {
    if (!audioRef.current) return;

    const startVolume = audioRef.current.volume;
    const endVolume = 0;
    const steps = 50;
    const stepDuration = duration / steps;
    const volumeStep = (endVolume - startVolume) / steps;

    let currentStep = 0;

    const fadeInterval = setInterval(() => {
      currentStep++;
      const newVolume = startVolume + (volumeStep * currentStep);
      audioRef.current!.volume = newVolume;

      if (currentStep >= steps) {
        clearInterval(fadeInterval);
        audioRef.current!.volume = endVolume;
        pause();
      }
    }, stepDuration);
  }, [pause]);

  // Crossfade to next track
  const crossfadeToNext = useCallback(() => {
    if (!crossfade || !currentPlaylist) return;

    const currentTrack = currentPlaylist.tracks[currentPlaylist.currentTrackIndex];
    if (!currentTrack || !currentTrack.fadeOut) return;

    // Start fade out
    fadeOut(currentTrack.fadeOut);

    // Schedule next track to start
    crossfadeTimeoutRef.current = setTimeout(() => {
      playNext();
      const nextTrack = currentPlaylist.tracks[(currentPlaylist.currentTrackIndex + 1) % currentPlaylist.tracks.length];
      if (nextTrack && nextTrack.fadeIn) {
        fadeIn(nextTrack.fadeIn);
      }
    }, currentTrack.fadeOut);
  }, [crossfade, currentPlaylist, fadeOut, fadeIn, playNext]);

  // Play specific track by index
  const playTrack = useCallback((trackIndex: number) => {
    if (!currentPlaylist || trackIndex < 0 || trackIndex >= currentPlaylist.tracks.length) return;

    updatePlaylist(currentPlaylist.id, { currentTrackIndex: trackIndex });
  }, [currentPlaylist, updatePlaylist]);

  // Stop playback
  const stop = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      setIsPlaying(false);
      setCurrentTime(0);
    }
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (crossfadeTimeoutRef.current) {
        clearTimeout(crossfadeTimeoutRef.current);
      }
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current);
      }
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.src = '';
      }
    };
  }, []);

  return {
    // State
    isPlaying,
    currentTime,
    duration,
    volume,
    isLoading,
    error,
    currentTrack: currentPlaylist?.tracks[currentPlaylist.currentTrackIndex] || null,
    
    // Actions
    play,
    pause,
    togglePlayPause,
    playNext,
    playPrevious,
    seek,
    setVolume: setAudioVolume,
    fadeIn,
    fadeOut,
    crossfadeToNext,
    playTrack,
    stop,
    
    // Utilities
    formatTime: (time: number) => {
      const minutes = Math.floor(time / 60);
      const seconds = Math.floor(time % 60);
      return `${minutes}:${seconds.toString().padStart(2, '0')}`;
    }
  };
};
