import { Howl, Howler } from 'howler';
import { AudioPool } from './AudioPool';
import { AudioConfig, DEFAULT_AUDIO_CONFIG, SoundId, MusicId, PlaySoundOptions } from './audioConfig';

/**
 * Centralized audio management system for the space game
 * Handles sound effects, background music, and audio configuration
 */
class AudioManager {
  private sounds: Map<string, Howl> = new Map();
  private soundPools: Map<string, AudioPool> = new Map();
  private music: Howl | null = null;
  private config: AudioConfig = { ...DEFAULT_AUDIO_CONFIG };
  private initialized = false;
  private loadingPromises: Map<string, Promise<void>> = new Map();

  constructor() {
    // Set initial global volume
    Howler.volume(this.config.masterVolume);
  }

  /**
   * Initialize audio system after user interaction
   * Required for autoplay policy compliance
   */
  async initialize(): Promise<boolean> {
    console.log('AudioManager.initialize() called, current state:', {
      initialized: this.initialized,
      enableAudio: this.config.enableAudio,
      howlerCtxState: Howler.ctx?.state
    });

    if (this.initialized && this.config.enableAudio) {
      console.log('Audio already initialized, returning true');
      return true;
    }

    try {
      // Resume audio context if suspended (autoplay policy)
      if (Howler.ctx && Howler.ctx.state === 'suspended') {
        console.log('Resuming suspended audio context...');
        await Howler.ctx.resume();
        console.log('Audio context resumed, new state:', Howler.ctx.state);
      }

      this.config.enableAudio = true;
      this.initialized = true;

      // Preload critical sound effects
      console.log('Preloading critical sounds...');
      await this.preloadCriticalSounds();

      console.log('Audio system initialized successfully');
      return true;
    } catch (error) {
      console.warn('Audio initialization failed:', error);
      this.config.enableAudio = false;
      return false;
    }
  }

  /**
   * Preload essential game sounds for immediate availability
   */
  private async preloadCriticalSounds(): Promise<void> {
    const criticalSounds = [
      { id: 'laser', src: '/sounds/sfx/laser.wav', pooled: true },
      { id: 'explosion', src: '/sounds/sfx/explosion.wav', pooled: false },
      { id: 'shield_hit', src: '/sounds/sfx/shield_hit.wav', pooled: true },
      { id: 'player_hit', src: '/sounds/sfx/player_hit.wav', pooled: false },
    ];

    console.log('Loading critical sounds:', criticalSounds.map(s => s.id));
    const loadPromises = criticalSounds.map(sound => {
      console.log(`Loading sound: ${sound.id} from ${sound.src}`);
      return this.loadSound(sound.id, sound.src, sound.pooled);
    });
    
    try {
      const results = await Promise.allSettled(loadPromises);
      console.log('Critical sounds preload results:', results);
      console.log('Critical sounds preloaded successfully');
    } catch (error) {
      console.warn('Some sounds failed to preload:', error);
    }
  }

  /**
   * Load a sound file and optionally create a pool for it
   */
  private loadSound(id: string, src: string, usePool = false): Promise<void> {
    if (this.loadingPromises.has(id)) {
      return this.loadingPromises.get(id)!;
    }

    const loadPromise = new Promise<void>((resolve, _reject) => {
      if (usePool) {
        try {
          const pool = new AudioPool(src, 3, {
            volume: this.config.sfxVolume * this.config.masterVolume,
            onloaderror: () => {
              console.warn(`Failed to load pooled sound: ${id}`);
              resolve(); // Don't reject, continue without this sound
            },
          });
          
          this.soundPools.set(id, pool);
          resolve();
        } catch (error) {
          console.warn(`Failed to create audio pool for ${id}:`, error);
          resolve();
        }
      } else {
        const sound = new Howl({
          src: [src],
          volume: this.config.sfxVolume * this.config.masterVolume,
          onload: () => resolve(),
          onloaderror: () => {
            console.warn(`Failed to load sound: ${id}`);
            resolve(); // Don't reject, continue without this sound
          },
        });
        
        this.sounds.set(id, sound);
      }
    });

    this.loadingPromises.set(id, loadPromise);
    return loadPromise;
  }

  /**
   * Play a sound effect by ID
   */
  playSound(id: SoundId, options: PlaySoundOptions = {}): number | null {
    console.log(`Attempting to play sound: ${id}`, { enableAudio: this.config.enableAudio, muted: this.config.muted, options });
    
    if (!this.config.enableAudio || this.config.muted) {
      console.log(`Sound blocked - enableAudio: ${this.config.enableAudio}, muted: ${this.config.muted}`);
      return null;
    }

    // Try pooled sound first
    const pool = this.soundPools.get(id);
    if (pool) {
      const volume = (options.volume ?? 1) * this.config.sfxVolume * this.config.masterVolume;
      console.log(`Playing pooled sound: ${id}, volume: ${volume}`);
      const playId = pool.play({ 
        volume, 
        rate: options.rate 
      });
      console.log(`Pooled sound ${id} play result:`, playId);
      return playId;
    }

    // Fall back to regular sound
    const sound = this.sounds.get(id);
    if (sound) {
      const volume = (options.volume ?? 1) * this.config.sfxVolume * this.config.masterVolume;
      console.log(`Playing regular sound: ${id}, volume: ${volume}`);
      sound.volume(volume);
      sound.loop(options.loop ?? false);
      
      if (options.rate !== undefined) {
        sound.rate(options.rate);
      }
      
      const playId = sound.play();
      console.log(`Regular sound ${id} play result:`, playId);
      return playId;
    }

    // If sound not found, try to load it dynamically
    console.log(`Sound ${id} not preloaded, attempting to load...`);
    console.log(`Available pools:`, Array.from(this.soundPools.keys()));
    console.log(`Available sounds:`, Array.from(this.sounds.keys()));
    this.loadSound(id, `/sounds/sfx/${id}.wav`, false)
      .then(() => {
        // Retry playing the sound after loading
        const loadedSound = this.sounds.get(id);
        if (loadedSound) {
          const volume = (options.volume ?? 1) * this.config.sfxVolume * this.config.masterVolume;
          loadedSound.volume(volume);
          loadedSound.loop(options.loop ?? false);
          
          if (options.rate !== undefined) {
            loadedSound.rate(options.rate);
          }
          
          loadedSound.play();
        }
      })
      .catch(error => {
        console.warn(`Failed to dynamically load sound: ${id}`, error);
      });

    return null;
  }

  /**
   * Play background music
   */
  async playMusic(id: MusicId, options: PlaySoundOptions = {}): Promise<void> {
    console.log(`AudioManager.playMusic() called with id: ${id}`, {
      enableAudio: this.config.enableAudio,
      muted: this.config.muted,
      musicVolume: this.config.musicVolume,
      masterVolume: this.config.masterVolume,
      options
    });

    if (!this.config.enableAudio || this.config.muted) {
      console.log('Music playback blocked - audio disabled or muted');
      return;
    }

    // Stop current music
    if (this.music) {
      console.log('Stopping current music');
      this.music.stop();
      this.music = null;
    }

    try {
      const musicSrc = `/sounds/music/${id}.wav`;
      console.log(`Creating Howl for music: ${musicSrc}`);
      
      this.music = new Howl({
        src: [musicSrc],
        volume: this.config.musicVolume * this.config.masterVolume,
        loop: options.loop ?? true,
        onload: () => {
          console.log(`Music ${id} loaded successfully, attempting to play...`);
          if (this.music && this.config.enableAudio && !this.config.muted) {
            const playId = this.music.play();
            console.log(`Music ${id} play() called, playId:`, playId);
          } else {
            console.log('Music not played - conditions not met', {
              musicExists: !!this.music,
              enableAudio: this.config.enableAudio,
              muted: this.config.muted
            });
          }
        },
        onloaderror: (id, error) => {
          console.warn(`Failed to load music: ${id}`, error);
        },
        onplay: () => {
          console.log(`Music ${id} started playing`);
        },
        onplayerror: (id, error) => {
          console.warn(`Music ${id} play error:`, error);
        },
      });
    } catch (error) {
      console.warn(`Error playing music ${id}:`, error);
    }
  }

  /**
   * Stop background music
   */
  stopMusic(): void {
    if (this.music) {
      this.music.stop();
    }
  }

  /**
   * Pause/resume music based on game state
   */
  pauseMusic(): void {
    if (this.music && this.music.playing()) {
      this.music.pause();
    }
  }

  resumeMusic(): void {
    if (this.music && !this.music.playing() && this.config.enableAudio && !this.config.muted) {
      this.music.play();
    }
  }

  /**
   * Update audio configuration
   */
  updateConfig(newConfig: Partial<AudioConfig>): void {
    const oldConfig = { ...this.config };
    this.config = { ...this.config, ...newConfig };

    // Apply global changes
    Howler.volume(this.config.masterVolume);
    Howler.mute(this.config.muted);

    // Update music volume if changed
    if (this.music && (oldConfig.musicVolume !== this.config.musicVolume || oldConfig.masterVolume !== this.config.masterVolume)) {
      this.music.volume(this.config.musicVolume * this.config.masterVolume);
    }

    // Update sound effect volumes
    if (oldConfig.sfxVolume !== this.config.sfxVolume || oldConfig.masterVolume !== this.config.masterVolume) {
      const newSfxVolume = this.config.sfxVolume * this.config.masterVolume;
      
      this.sounds.forEach(sound => {
        sound.volume(newSfxVolume);
      });
      
      this.soundPools.forEach(pool => {
        pool.setVolume(newSfxVolume);
      });
    }

    // Handle audio enable/disable
    if (oldConfig.enableAudio !== this.config.enableAudio) {
      if (!this.config.enableAudio) {
        this.stopAll();
      }
    }
  }

  /**
   * Toggle mute state
   */
  toggleMute(): boolean {
    this.updateConfig({ muted: !this.config.muted });
    return this.config.muted;
  }

  /**
   * Get current configuration
   */
  getConfig(): AudioConfig {
    return { ...this.config };
  }

  /**
   * Stop all audio
   */
  stopAll(): void {
    this.sounds.forEach(sound => sound.stop());
    this.soundPools.forEach(pool => pool.stopAll());
    if (this.music) {
      this.music.stop();
    }
  }

  /**
   * Check if audio system is ready
   */
  isReady(): boolean {
    return this.initialized && this.config.enableAudio;
  }

  /**
   * Test audio functionality with a simple sound
   */
  testAudio(): void {
    console.log('Testing audio system...');
    console.log('Audio system state:', {
      initialized: this.initialized,
      enableAudio: this.config.enableAudio,
      muted: this.config.muted,
      masterVolume: this.config.masterVolume,
      contextState: Howler.ctx?.state
    });
    
    // Test playing UI click sound
    this.playSound('ui_click', { volume: 0.8 });
  }

  /**
   * Get audio system status for debugging
   */
  getStatus() {
    return {
      initialized: this.initialized,
      config: this.config,
      soundsLoaded: this.sounds.size,
      poolsCreated: this.soundPools.size,
      musicLoaded: !!this.music,
      pools: Object.fromEntries(
        Array.from(this.soundPools.entries()).map(([id, pool]) => [id, pool.getStatus()])
      ),
    };
  }

  /**
   * Cleanup all audio resources
   */
  dispose(): void {
    this.stopAll();
    
    this.sounds.forEach(sound => sound.unload());
    this.soundPools.forEach(pool => pool.dispose());
    
    if (this.music) {
      this.music.unload();
    }

    this.sounds.clear();
    this.soundPools.clear();
    this.loadingPromises.clear();
    this.music = null;
    this.initialized = false;
  }
}

// Export singleton instance
export const audioManager = new AudioManager();