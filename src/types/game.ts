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
}

export interface EnemyEntity extends EntityType {
  type: 'enemy';
  health: number;
  damage: number;
  aiType: 'straight' | 'zigzag' | 'seeking' | 'circling';
  spawnTime: number;
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