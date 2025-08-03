import { useCallback, useEffect } from 'react';
import { useGameStore, useAudioConfig } from '@/lib/stores/gameStore';
import { SoundId, PlaySoundOptions } from '@/lib/audio/audioConfig';

/**
 * Hook for easy audio integration in game components
 * Handles initialization, sound playing, and audio configuration
 */
export const useGameAudio = () => {
  const audioConfig = useAudioConfig();
  
  // Use individual stable selectors to avoid recreating objects
  const initializeAudio = useGameStore((state) => state.initializeAudio);
  const updateAudioConfig = useGameStore((state) => state.updateAudioConfig);
  const toggleMute = useGameStore((state) => state.toggleMute);
  const playGameSound = useGameStore((state) => state.playGameSound);
  const playBackgroundMusic = useGameStore((state) => state.playBackgroundMusic);
  const pauseMusic = useGameStore((state) => state.pauseMusic);
  const resumeMusic = useGameStore((state) => state.resumeMusic);

  // Initialize audio on first user interaction
  const handleInitializeAudio = useCallback(async () => {
    if (audioConfig.enableAudio) return true;
    
    try {
      const success = await initializeAudio();
      if (success) {
        console.log('Audio system initialized successfully');
      }
      return success;
    } catch (error) {
      console.warn('Audio initialization failed:', error);
      return false;
    }
  }, [audioConfig.enableAudio, initializeAudio]);

  // Auto-setup user interaction listeners for audio initialization
  useEffect(() => {
    if (audioConfig.enableAudio) return;

    const handleUserInteraction = async () => {
      if (audioConfig.enableAudio) return;
      try {
        await initializeAudio();
      } catch (error) {
        console.warn('Audio initialization failed:', error);
      }
    };

    // Listen for various user interaction events
    const events = ['click', 'touchstart', 'keydown', 'pointerdown'];
    const cleanup: (() => void)[] = [];

    events.forEach(eventType => {
      document.addEventListener(eventType, handleUserInteraction, { 
        once: true, 
        passive: true 
      });
      cleanup.push(() => 
        document.removeEventListener(eventType, handleUserInteraction)
      );
    });

    return () => {
      cleanup.forEach(fn => fn());
    };
  }, [audioConfig.enableAudio, initializeAudio]);

  // Optimized sound playing function
  const playSound = useCallback((soundId: SoundId, options?: PlaySoundOptions) => {
    if (!audioConfig.enableAudio || audioConfig.muted) return null;
    return playGameSound(soundId, options);
  }, [audioConfig.enableAudio, audioConfig.muted, playGameSound]);

  // Music control functions
  const playMusic = useCallback((musicId: string) => {
    console.log('useGameAudio.playMusic() called', {
      musicId,
      enableAudio: audioConfig.enableAudio,
      muted: audioConfig.muted,
      audioConfig
    });
    if (!audioConfig.enableAudio || audioConfig.muted) {
      console.log('Music blocked by useGameAudio conditions');
      return;
    }
    console.log('Calling playBackgroundMusic()...');
    playBackgroundMusic(musicId);
  }, [audioConfig.enableAudio, audioConfig.muted, playBackgroundMusic]);

  const handleToggleMute = useCallback(() => {
    return toggleMute();
  }, [toggleMute]);

  // Volume control functions
  const setMasterVolume = useCallback((volume: number) => {
    updateAudioConfig({ masterVolume: Math.max(0, Math.min(1, volume)) });
  }, [updateAudioConfig]);

  const setSfxVolume = useCallback((volume: number) => {
    updateAudioConfig({ sfxVolume: Math.max(0, Math.min(1, volume)) });
  }, [updateAudioConfig]);

  const setMusicVolume = useCallback((volume: number) => {
    updateAudioConfig({ musicVolume: Math.max(0, Math.min(1, volume)) });
  }, [updateAudioConfig]);

  // Game-specific audio shortcuts
  const playLaserSound = useCallback((options?: PlaySoundOptions) => {
    return playSound('laser', options);
  }, [playSound]);

  const playExplosionSound = useCallback((options?: PlaySoundOptions) => {
    return playSound('explosion', options);
  }, [playSound]);

  const playShieldHitSound = useCallback((options?: PlaySoundOptions) => {
    return playSound('shield_hit', options);
  }, [playSound]);

  const playPlayerHitSound = useCallback((options?: PlaySoundOptions) => {
    return playSound('player_hit', options);
  }, [playSound]);

  const playGameOverSound = useCallback((options?: PlaySoundOptions) => {
    return playSound('game_over', options);
  }, [playSound]);

  const playLevelUpSound = useCallback((options?: PlaySoundOptions) => {
    return playSound('level_up', options);
  }, [playSound]);

  const playUIClickSound = useCallback((options?: PlaySoundOptions) => {
    return playSound('ui_click', options);
  }, [playSound]);

  return {
    // Audio state
    audioConfig,
    isAudioEnabled: audioConfig.enableAudio,
    isMuted: audioConfig.muted,

    // Control functions
    initializeAudio: handleInitializeAudio,
    toggleMute: handleToggleMute,
    setMasterVolume,
    setSfxVolume,
    setMusicVolume,

    // Generic audio functions
    playSound,
    playMusic,
    pauseMusic,
    resumeMusic,

    // Game-specific shortcuts
    playLaserSound,
    playExplosionSound,
    playShieldHitSound,
    playPlayerHitSound,
    playGameOverSound,
    playLevelUpSound,
    playUIClickSound,

    // Advanced config
    updateAudioConfig,
  };
};