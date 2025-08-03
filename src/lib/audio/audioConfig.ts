// Audio configuration types and constants
export interface AudioConfig {
  masterVolume: number;
  musicVolume: number;
  sfxVolume: number;
  muted: boolean;
  enableAudio: boolean;
}

export const DEFAULT_AUDIO_CONFIG: AudioConfig = {
  masterVolume: 0.7,
  musicVolume: 0.5,
  sfxVolume: 0.8,
  muted: false,
  enableAudio: false, // Default off for UX best practices
};

export const AUDIO_ASSETS = {
  SFX: {
    LASER: 'laser',
    EXPLOSION: 'explosion',
    SHIELD_HIT: 'shield_hit',
    PLAYER_HIT: 'player_hit',
    GAME_OVER: 'game_over',
    LEVEL_UP: 'level_up',
    UI_CLICK: 'ui_click',
  },
  MUSIC: {
    SPACE_AMBIENT: 'space_ambient',
  },
} as const;

export type SoundId = typeof AUDIO_ASSETS.SFX[keyof typeof AUDIO_ASSETS.SFX];
export type MusicId = typeof AUDIO_ASSETS.MUSIC[keyof typeof AUDIO_ASSETS.MUSIC];

export interface PlaySoundOptions {
  volume?: number;
  loop?: boolean;
  rate?: number;
}