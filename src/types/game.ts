export interface Vector2D {
  x: number;
  y: number;
}

export interface Bounds {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface GameConfig {
  width: number;
  height: number;
  playerSpeed: number;
  bulletSpeed: number;
  enemySpeed: number;
  enemySpawnRate: number;
  maxBullets: number;
  maxEnemies: number;
  // Shield configuration
  shieldHeight: number;
  shieldRegenRate: number;
  shieldRegenDelay: number;
  shieldMaxHealth: number;
  // Visual effects settings
  enableScreenEffects: boolean;
}

export interface GameState {
  isRunning: boolean;
  isPaused: boolean;
  score: number;
  lives: number;
  level: number;
  gameTime: number;
}

export interface EntityType {
  id: string;
  type: 'player' | 'enemy' | 'bullet' | 'powerup';
  position: Vector2D;
  velocity: Vector2D;
  size: Vector2D;
  rotation: number;
  active: boolean;
  health?: number;
  damage?: number;
  color?: string;
}

export interface PlayerEntity extends EntityType {
  type: 'player';
  health: number;
  maxHealth: number;
  shootCooldown: number;
  canShoot: boolean;
  // Shield system
  shieldHealth: number;
  maxShieldHealth: number;
  shieldRegenRate: number;
  shieldRegenDelay: number;
  lastShieldDamageTime: number;
  shieldActive: boolean;
}

export interface EnemyEntity extends EntityType {
  type: 'enemy';
  health: number;
  damage: number;
  aiType: 'straight' | 'zigzag' | 'seeking' | 'circling';
  spawnTime: number;
  shieldDamage: number; // Damage to shield when breaching bottom boundary
}

export interface BulletEntity extends EntityType {
  type: 'bullet';
  damage: number;
  owner: 'player' | 'enemy';
  lifespan: number;
}

export interface PowerupEntity extends EntityType {
  type: 'powerup';
  powerupType: 'health' | 'multishot' | 'speed' | 'shield';
  duration?: number;
}

export interface CollisionBox {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface InputState {
  keys: Set<string>;
  mouse: {
    x: number;
    y: number;
    pressed: boolean;
  };
  touch: {
    x: number;
    y: number;
    active: boolean;
  };
}

export interface GameAssets {
  player: HTMLImageElement;
  enemies: Record<string, HTMLImageElement>;
  bullets: Record<string, HTMLImageElement>;
  backgrounds: HTMLImageElement[];
  sounds: Record<string, HTMLAudioElement>;
}

export interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  color: string;
  size: number;
}

export interface ExplosionEffect {
  x: number;
  y: number;
  particles: Particle[];
  active: boolean;
}


export interface ShieldZone {
  y: number; // Y position of the shield line
  height: number; // Height of the protection zone
  active: boolean;
}

export interface ScreenEffect {
  type: 'flash' | 'shake';
  color?: string; // For flash effects
  intensity: number; // 0-1 for flash opacity, 0-1 for shake amplitude
  duration: number; // Duration in milliseconds
  timestamp: number; // When the effect started
}

export interface ParticleExtended extends Particle {
  alpha: number;
  decay: number;
}