# AUDIO_RESOURCES.md

This document contains comprehensive resources and research for implementing audio in the space game.

## Recommended Audio Libraries

### 1. **Howler.js** (Primary Recommendation)
- **NPM**: `howler` (24,663 GitHub stars, 544,577 weekly downloads)
- **Size**: 7KB gzipped
- **Best For**: Game audio, sound effects, music
- **Features**: 
  - Web Audio API + HTML5 Audio fallback
  - Audio sprites support
  - Automatic caching and pooling
  - Chrome autoplay policy compliance
  - Cross-browser compatibility
- **Documentation**: https://howlerjs.com/
- **GitHub**: https://github.com/goldfire/howler.js

### 2. **use-sound** (React Integration)
- **NPM**: `use-sound` (React hook for Howler.js)
- **Size**: 1KB (loads 10KB Howler.js asynchronously)
- **Best For**: React components with sound effects
- **Features**:
  - React hooks pattern
  - Built on Howler.js
  - Audio sprites support
- **Documentation**: https://github.com/joshwcomeau/use-sound
- **Creator**: Josh W. Comeau (React community leader)

### 3. **Web Audio API** (Advanced Use Cases)
- **Type**: Native browser API
- **Size**: 0KB (native)
- **Best For**: Complex audio processing, 3D audio, real-time effects
- **Features**:
  - Maximum performance and control
  - Advanced audio synthesis
  - Real-time audio processing
- **Documentation**: https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API

## Performance Comparison

| Library | Bundle Size | Memory Usage | CPU Impact | Ease of Use | Game Suitability |
|---------|-------------|--------------|------------|-------------|------------------|
| Howler.js | 7KB | Low (auto-cache) | Low | High | Excellent |
| use-sound | 1KB+10KB | Low | Low | Very High | Excellent |
| Web Audio API | 0KB | Manual | Lowest | Low | Good (complex) |
| Tone.js | 150KB+ | High | Medium | Medium | Poor (overkill) |

## Free Audio Resources

### Sound Effects Libraries

#### **Freesound.org**
- **URL**: https://freesound.org/
- **License**: Creative Commons (various)
- **Quality**: Professional
- **Categories**: Extensive game audio library
- **Recommended Search Terms**: "space laser", "explosion", "shield impact", "game music"

#### **Mixkit.co**
- **URL**: https://mixkit.co/free-sound-effects/game/
- **License**: Royalty-free
- **Quality**: High
- **Content**: 36+ game sound effects
- **Space Game Assets**: Laser sounds, explosions, UI sounds

#### **OpenGameArt.org**
- **URL**: https://opengameart.org/art-search-advanced?keys=&field_art_type_tid%5B%5D=12
- **License**: Various open source
- **Quality**: Variable (community-driven)
- **Content**: Game-specific audio organized by category

#### **Pixabay**
- **URL**: https://pixabay.com/sound-effects/search/game/
- **License**: Royalty-free
- **Quality**: Good
- **Content**: Video game sounds and music

### Background Music Resources

#### **Kenney.nl**
- **URL**: https://kenney.nl/assets?q=audio
- **License**: CC0 (Public Domain)
- **Quality**: Professional
- **Content**: Game asset packs including space-themed music

#### **Indie Game Music**
- **URL**: https://indiegamemusic.com/
- **License**: Royalty-free (paid)
- **Quality**: Professional
- **Content**: Designed specifically for indie games

#### **YouTube Audio Library**
- **URL**: https://studio.youtube.com/channel/UC*/music
- **License**: Creative Commons
- **Quality**: High
- **Content**: Ambient space music, electronic soundtracks

### Sound Creation Tools

#### **Bfxr.net**
- **URL**: https://www.bfxr.net/
- **Type**: Online sound generator
- **Best For**: 8-bit style game sounds
- **Features**: Laser, explosion, pickup sound presets

#### **Cakewalk by BandLab**
- **URL**: https://www.bandlab.com/products/cakewalk
- **Type**: Free DAW
- **Best For**: Creating custom music and effects
- **License**: Free professional software

## Code Examples and Implementation Patterns

### Audio Manager Pattern (Recommended)

```typescript
// lib/audio/AudioManager.ts
import { Howl, Howler } from 'howler';

interface AudioConfig {
  masterVolume: number;
  musicVolume: number;
  sfxVolume: number;
  muted: boolean;
  enableAudio: boolean;
}

class AudioManager {
  private sounds: Map<string, Howl> = new Map();
  private music: Howl | null = null;
  private config: AudioConfig = {
    masterVolume: 0.7,
    musicVolume: 0.5,
    sfxVolume: 0.8,
    muted: false,
    enableAudio: false, // Default off for UX
  };

  constructor() {
    // Set global volume
    Howler.volume(this.config.masterVolume);
  }

  // Initialize audio system after user interaction
  async initialize() {
    if (this.config.enableAudio) return;
    
    // Check for user interaction requirement
    if (Howler.ctx && Howler.ctx.state === 'suspended') {
      await Howler.ctx.resume();
    }
    
    this.config.enableAudio = true;
    await this.preloadCriticalSounds();
  }

  // Preload essential game sounds
  private async preloadCriticalSounds() {
    const sounds = [
      { id: 'laser', src: '/sounds/sfx/laser.mp3' },
      { id: 'explosion', src: '/sounds/sfx/explosion.mp3' },
      { id: 'shield_hit', src: '/sounds/sfx/shield_hit.mp3' },
      { id: 'player_hit', src: '/sounds/sfx/player_hit.mp3' },
    ];

    const loadPromises = sounds.map(({ id, src }) => 
      new Promise<void>((resolve) => {
        const sound = new Howl({
          src: [src],
          volume: this.config.sfxVolume,
          onload: () => resolve(),
          onloaderror: () => resolve(), // Continue even if load fails
        });
        this.sounds.set(id, sound);
      })
    );

    await Promise.all(loadPromises);
  }

  // Play sound effect
  playSound(id: string, options?: { volume?: number; loop?: boolean }) {
    if (!this.config.enableAudio || this.config.muted) return;

    const sound = this.sounds.get(id);
    if (sound) {
      const volume = (options?.volume ?? 1) * this.config.sfxVolume * this.config.masterVolume;
      sound.volume(volume);
      sound.loop(options?.loop ?? false);
      return sound.play();
    }
  }

  // Background music management
  playMusic(src: string, options?: { volume?: number; loop?: boolean }) {
    if (!this.config.enableAudio || this.config.muted) return;

    if (this.music) {
      this.music.stop();
    }

    this.music = new Howl({
      src: [src],
      volume: this.config.musicVolume * this.config.masterVolume,
      loop: options?.loop ?? true,
      onload: () => this.music?.play(),
    });
  }

  // Configuration management
  updateConfig(newConfig: Partial<AudioConfig>) {
    this.config = { ...this.config, ...newConfig };
    
    // Apply changes immediately
    Howler.volume(this.config.masterVolume);
    Howler.mute(this.config.muted);
    
    if (this.music) {
      this.music.volume(this.config.musicVolume * this.config.masterVolume);
    }
  }

  toggleMute() {
    this.updateConfig({ muted: !this.config.muted });
    return this.config.muted;
  }

  getConfig() {
    return { ...this.config };
  }

  // Cleanup
  dispose() {
    this.sounds.forEach(sound => sound.unload());
    this.music?.unload();
    this.sounds.clear();
    this.music = null;
  }
}

export const audioManager = new AudioManager();
```

### React Hook Integration

```typescript
// hooks/useGameAudio.ts
import { useCallback, useEffect } from 'react';
import { audioManager } from '@/lib/audio/AudioManager';
import { useGameStore } from '@/lib/stores/gameStore';

export const useGameAudio = () => {
  const audioConfig = useGameStore(state => state.audioConfig);
  const updateAudioConfig = useGameStore(state => state.updateAudioConfig);

  // Initialize audio on first user interaction
  const initializeAudio = useCallback(async () => {
    await audioManager.initialize();
    updateAudioConfig({ enableAudio: true });
  }, [updateAudioConfig]);

  // Sync store config with audio manager
  useEffect(() => {
    audioManager.updateConfig(audioConfig);
  }, [audioConfig]);

  const playSound = useCallback((soundId: string, options?: any) => {
    return audioManager.playSound(soundId, options);
  }, []);

  const toggleMute = useCallback(() => {
    const muted = audioManager.toggleMute();
    updateAudioConfig({ muted });
  }, [updateAudioConfig]);

  return {
    playSound,
    toggleMute,
    initializeAudio,
    audioConfig,
  };
};
```

### Audio Sprites Configuration

```typescript
// Audio sprite for efficient loading
const gameAudioSprite = new Howl({
  src: ['/sounds/game-audio-sprite.mp3'],
  sprite: {
    laser: [0, 500],        // 0ms to 500ms
    explosion: [1000, 1500], // 1s to 2.5s
    shield_hit: [3000, 800], // 3s to 3.8s
    powerup: [4000, 1200],   // 4s to 5.2s
    ui_click: [6000, 300],   // 6s to 6.3s
  },
  volume: 0.8,
});
```

## Integration with Existing Game Architecture

### Zustand Store Integration

```typescript
// Add to existing gameStore.ts
interface GameStore extends GameState {
  audioConfig: AudioConfig;
  updateAudioConfig: (config: Partial<AudioConfig>) => void;
  playGameSound: (soundId: string) => void;
}

// Actions
updateAudioConfig: (config) => 
  set((state) => ({ 
    audioConfig: { ...state.audioConfig, ...config } 
  })),

playGameSound: (soundId) => {
  if (get().audioConfig.enableAudio) {
    audioManager.playSound(soundId);
  }
},
```

### Game Event Integration Points

```typescript
// GameCanvas.tsx - Player shooting (line ~300)
if (canShoot) {
  createBullet(newBullet);
  playGameSound('laser'); // Add audio trigger
  setLastShotTime(currentTime);
}

// CollisionSystem.ts - Enemy destruction (line ~230)
if (collision) {
  increaseScore(enemy.points);
  playGameSound('explosion'); // Add audio trigger
  createParticleEffect(enemy.position);
}

// ShieldSystem.ts - Shield impact (line ~80)
const impact = checkShieldCollision(bullet, shield);
if (impact.hit) {
  playGameSound('shield_hit'); // Add audio trigger
  updateShieldIntegrity(impact.damage);
}
```

## Mobile and Cross-Browser Compatibility

### Autoplay Policy Handling

```typescript
// Handle autoplay restrictions
const handleUserInteraction = async () => {
  if (audioManager.getConfig().enableAudio) return;
  
  try {
    await audioManager.initialize();
    console.log('Audio initialized successfully');
  } catch (error) {
    console.warn('Audio initialization failed:', error);
  }
};

// Add to GameCanvas or main component
useEffect(() => {
  const events = ['click', 'touchstart', 'keydown'];
  
  const cleanup = events.map(event => {
    document.addEventListener(event, handleUserInteraction, { once: true });
    return () => document.removeEventListener(event, handleUserInteraction);
  });
  
  return () => cleanup.forEach(fn => fn());
}, []);
```

### Performance Optimizations

#### Object Pooling for Audio

```typescript
class AudioPool {
  private pool: Howl[] = [];
  private active: Set<Howl> = new Set();
  
  constructor(src: string, poolSize: number = 5) {
    for (let i = 0; i < poolSize; i++) {
      const sound = new Howl({
        src: [src],
        onend: (id) => this.releaseToPool(sound),
      });
      this.pool.push(sound);
    }
  }
  
  play(): number | null {
    const sound = this.pool.pop();
    if (!sound) return null;
    
    this.active.add(sound);
    return sound.play();
  }
  
  private releaseToPool(sound: Howl) {
    this.active.delete(sound);
    this.pool.push(sound);
  }
}
```

#### Lazy Loading Strategy

```typescript
const loadAudioLazily = async (soundMap: Record<string, string>) => {
  const loadSound = (id: string, src: string) => 
    new Promise<{ id: string; sound: Howl }>((resolve, reject) => {
      const sound = new Howl({
        src: [src],
        onload: () => resolve({ id, sound }),
        onloaderror: reject,
      });
    });

  try {
    const results = await Promise.allSettled(
      Object.entries(soundMap).map(([id, src]) => loadSound(id, src))
    );
    
    results.forEach((result, index) => {
      if (result.status === 'fulfilled') {
        audioManager.addSound(result.value.id, result.value.sound);
      } else {
        console.warn(`Failed to load sound: ${Object.keys(soundMap)[index]}`);
      }
    });
  } catch (error) {
    console.error('Audio loading failed:', error);
  }
};
```

## Recommended Audio Assets for Space Game

### Sound Effects (SFX) - Target < 1MB total

1. **Laser Shot** (200-500ms)
   - Format: MP3, 44.1kHz, 128kbps
   - Search terms: "sci-fi laser", "space weapon", "energy blast"
   - Recommended source: Freesound.org

2. **Enemy Explosion** (1-2s)
   - Format: MP3, 44.1kHz, 128kbps
   - Search terms: "space explosion", "ship destruction", "energy blast"
   - Recommended source: Mixkit.co

3. **Shield Impact** (300-800ms)
   - Format: MP3, 44.1kHz, 128kbps
   - Search terms: "energy shield", "force field", "deflection"
   - Recommended source: Freesound.org

4. **Player Hit/Damage** (500ms-1s)
   - Format: MP3, 44.1kHz, 128kbps
   - Search terms: "damage alert", "warning sound", "critical hit"
   - Recommended source: OpenGameArt.org

5. **Game Over** (2-3s)
   - Format: MP3, 44.1kHz, 128kbps
   - Search terms: "game over", "defeat", "fail sound"
   - Recommended source: Pixabay

6. **Level Up** (1-2s)
   - Format: MP3, 44.1kHz, 128kbps
   - Search terms: "achievement", "level up", "success"
   - Recommended source: Mixkit.co

7. **UI Click** (100-200ms)
   - Format: MP3, 44.1kHz, 128kbps
   - Search terms: "button click", "ui sound", "interface"
   - Recommended source: Freesound.org

### Background Music - Target < 1MB

1. **Main Theme** (3-5 minutes, loopable)
   - Format: MP3, 44.1kHz, 96kbps (music can be lower quality)
   - Search terms: "space ambient", "sci-fi background", "cosmic music"
   - Recommended source: Kenney.nl or YouTube Audio Library
   - Style: Atmospheric, non-intrusive, space theme

## File Structure Recommendations

```
src/
├── assets/
│   └── sounds/
│       ├── sfx/
│       │   ├── laser.mp3              # Player shooting
│       │   ├── explosion.mp3          # Enemy destruction
│       │   ├── shield_hit.mp3         # Shield impact
│       │   ├── player_hit.mp3         # Player damage
│       │   ├── game_over.mp3          # Game over
│       │   ├── level_up.mp3           # Level progression
│       │   └── ui_click.mp3           # UI interactions
│       ├── music/
│       │   └── space_ambient.mp3      # Background music
│       └── sprite/
│           └── game-audio-sprite.mp3  # Combined audio sprite
├── lib/
│   └── audio/
│       ├── AudioManager.ts            # Main audio system
│       ├── AudioPool.ts               # Object pooling
│       └── audioConfig.ts             # Configuration constants
└── components/
    └── game/
        └── UI/
            ├── AudioControls.tsx      # Volume/mute toggle
            └── AudioSettings.tsx      # Detailed settings panel
```

## Implementation Phases

### Phase 1: Core Infrastructure (Day 1)
1. Install Howler.js: `npm install howler @types/howler`
2. Create AudioManager class
3. Integrate with existing gameStore
4. Add basic audio toggle UI in HUD

### Phase 2: Essential Sound Effects (Day 1-2)
1. Implement player shooting sound
2. Add enemy explosion effects
3. Shield impact audio
4. Test performance and memory usage

### Phase 3: Background Music & Polish (Day 2-3)
1. Background music system
2. Audio settings panel
3. Advanced volume controls
4. Mobile optimization

### Phase 4: Testing & Optimization (Day 3)
1. Cross-browser testing
2. Mobile device testing
3. Performance optimization
4. Memory leak testing
5. Accessibility features

## Testing Checklist

### Functionality Tests
- [ ] Audio toggle works correctly
- [ ] Sound effects trigger at correct moments
- [ ] Background music loops seamlessly
- [ ] Volume controls affect audio levels
- [ ] Audio persists through game state changes

### Performance Tests
- [ ] No memory leaks during extended play
- [ ] Audio doesn't impact game FPS
- [ ] Fast loading on slow connections
- [ ] Graceful handling of audio load failures

### Compatibility Tests
- [ ] Chrome desktop/mobile
- [ ] Firefox desktop/mobile  
- [ ] Safari desktop/mobile
- [ ] Edge desktop
- [ ] iOS Safari (autoplay restrictions)
- [ ] Android Chrome (performance)

### Accessibility Tests
- [ ] Audio settings are keyboard accessible
- [ ] Screen reader announces audio state
- [ ] Visual indicators for audio status
- [ ] Respects user's audio preferences

## License Compliance

When using Creative Commons audio:
1. **CC0**: No attribution required (safest choice)
2. **CC BY**: Attribution required (add credits section)
3. **CC BY-SA**: Attribution + ShareAlike (may affect game licensing)

### Attribution Template
```
# Audio Credits

## Sound Effects
- Laser sound: [Author Name] - [License] - [Source URL]
- Explosion sound: [Author Name] - [License] - [Source URL]

## Music
- Background music: [Artist Name] - [License] - [Source URL]
```

## Next Steps

1. **Start with Phase 1**: Basic audio infrastructure
2. **Download recommended assets**: Use freesound.org and mixkit.co
3. **Test on mobile early**: iOS autoplay restrictions are critical
4. **Monitor bundle size**: Keep total audio under 2MB
5. **Document everything**: Maintain this resource file

This comprehensive resource guide provides everything needed to implement a professional audio system in the space game while maintaining performance and compatibility across all target platforms.