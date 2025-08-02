import { create } from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';
import type { 
  GameState, 
  PlayerEntity, 
  EnemyEntity, 
  BulletEntity, 
  PowerupEntity,
  InputState,
  GameConfig,
  Vector2D
} from '@/types/game';

interface GameStore extends GameState {
  // Entities
  player: PlayerEntity | null;
  enemies: EnemyEntity[];
  bullets: BulletEntity[];
  powerups: PowerupEntity[];
  
  // Input
  input: InputState;
  
  // Game config
  config: GameConfig;
  
  // Background scroll
  backgroundOffset: number;
  
  // Actions
  initializeGame: () => void;
  startGame: () => void;
  pauseGame: () => void;
  resumeGame: () => void;
  endGame: () => void;
  resetGame: () => void;
  
  // Player actions
  createPlayer: () => void;
  updatePlayerPosition: (position: Vector2D) => void;
  updatePlayerHealth: (health: number) => void;
  
  // Entity management
  addEnemy: (enemy: EnemyEntity) => void;
  removeEnemy: (id: string) => void;
  addBullet: (bullet: BulletEntity) => void;
  removeBullet: (id: string) => void;
  addPowerup: (powerup: PowerupEntity) => void;
  removePowerup: (id: string) => void;
  
  // Game state updates
  updateScore: (points: number) => void;
  updateLives: (lives: number) => void;
  updateLevel: (level: number) => void;
  updateGameTime: (deltaTime: number) => void;
  updateBackgroundOffset: (offset: number) => void;
  
  // Input handling
  updateInput: (input: Partial<InputState>) => void;
  addKey: (key: string) => void;
  removeKey: (key: string) => void;
  updateMouse: (x: number, y: number, pressed: boolean) => void;
  updateTouch: (x: number, y: number, active: boolean) => void;
  
  // Entity updates
  updateEntities: (deltaTime: number) => void;
  cleanupInactiveEntities: () => void;
}

const defaultConfig: GameConfig = {
  width: 800,
  height: 600,
  playerSpeed: 300,
  bulletSpeed: 500,
  enemySpeed: 100,
  enemySpawnRate: 2000, // milliseconds
  maxBullets: 50,
  maxEnemies: 20
};

const defaultInputState: InputState = {
  keys: new Set(),
  mouse: { x: 0, y: 0, pressed: false },
  touch: { x: 0, y: 0, active: false }
};

export const useGameStore = create<GameStore>()(
  subscribeWithSelector((set, get) => ({
    // Initial state
    isRunning: false,
    isPaused: false,
    score: 0,
    lives: 3,
    level: 1,
    gameTime: 0,
    
    player: null,
    enemies: [],
    bullets: [],
    powerups: [],
    
    input: defaultInputState,
    config: defaultConfig,
    backgroundOffset: 0,
    
    // Game lifecycle
    initializeGame: () => {
      set({
        isRunning: false,
        isPaused: false,
        score: 0,
        lives: 3,
        level: 1,
        gameTime: 0,
        enemies: [],
        bullets: [],
        powerups: [],
        backgroundOffset: 0,
        input: { ...defaultInputState, keys: new Set() }
      });
      get().createPlayer();
    },
    
    startGame: () => {
      set({ isRunning: true, isPaused: false });
    },
    
    pauseGame: () => {
      set({ isPaused: true });
    },
    
    resumeGame: () => {
      set({ isPaused: false });
    },
    
    endGame: () => {
      set({ isRunning: false, isPaused: false });
    },
    
    resetGame: () => {
      get().initializeGame();
    },
    
    // Player management
    createPlayer: () => {
      const { config } = get();
      const player: PlayerEntity = {
        id: 'player',
        type: 'player',
        position: { 
          x: config.width / 2, 
          y: config.height - 100 
        },
        velocity: { x: 0, y: 0 },
        size: { x: 40, y: 40 },
        rotation: 0,
        active: true,
        health: 100,
        maxHealth: 100,
        shootCooldown: 0,
        canShoot: true
      };
      set({ player });
    },
    
    updatePlayerPosition: (position: Vector2D) => {
      set(state => ({
        player: state.player ? {
          ...state.player,
          position: { ...position }
        } : null
      }));
    },
    
    updatePlayerHealth: (health: number) => {
      set(state => ({
        player: state.player ? {
          ...state.player,
          health: Math.max(0, Math.min(health, state.player.maxHealth))
        } : null
      }));
    },
    
    // Entity management
    addEnemy: (enemy: EnemyEntity) => {
      set(state => ({
        enemies: [...state.enemies, enemy]
      }));
    },
    
    removeEnemy: (id: string) => {
      set(state => ({
        enemies: state.enemies.filter(enemy => enemy.id !== id)
      }));
    },
    
    addBullet: (bullet: BulletEntity) => {
      set(state => {
        const bullets = [...state.bullets, bullet];
        // Limit bullet count to prevent memory issues
        if (bullets.length > state.config.maxBullets) {
          bullets.shift(); // Remove oldest bullet
        }
        return { bullets };
      });
    },
    
    removeBullet: (id: string) => {
      set(state => ({
        bullets: state.bullets.filter(bullet => bullet.id !== id)
      }));
    },
    
    addPowerup: (powerup: PowerupEntity) => {
      set(state => ({
        powerups: [...state.powerups, powerup]
      }));
    },
    
    removePowerup: (id: string) => {
      set(state => ({
        powerups: state.powerups.filter(powerup => powerup.id !== id)
      }));
    },
    
    // Game state updates
    updateScore: (points: number) => {
      set(state => ({
        score: state.score + points
      }));
    },
    
    updateLives: (lives: number) => {
      set({ lives: Math.max(0, lives) });
    },
    
    updateLevel: (level: number) => {
      set({ level });
    },
    
    updateGameTime: (deltaTime: number) => {
      set(state => ({
        gameTime: state.gameTime + deltaTime
      }));
    },
    
    updateBackgroundOffset: (offset: number) => {
      set({ backgroundOffset: offset });
    },
    
    // Input handling
    updateInput: (input: Partial<InputState>) => {
      set(state => ({
        input: { ...state.input, ...input }
      }));
    },
    
    addKey: (key: string) => {
      set(state => {
        const newKeys = new Set(state.input.keys);
        newKeys.add(key);
        return {
          input: { ...state.input, keys: newKeys }
        };
      });
    },
    
    removeKey: (key: string) => {
      set(state => {
        const newKeys = new Set(state.input.keys);
        newKeys.delete(key);
        return {
          input: { ...state.input, keys: newKeys }
        };
      });
    },
    
    updateMouse: (x: number, y: number, pressed: boolean) => {
      set(state => ({
        input: {
          ...state.input,
          mouse: { x, y, pressed }
        }
      }));
    },
    
    updateTouch: (x: number, y: number, active: boolean) => {
      set(state => ({
        input: {
          ...state.input,
          touch: { x, y, active }
        }
      }));
    },
    
    // Entity updates
    updateEntities: (deltaTime: number) => {
      set(state => {
        const { config } = state;
        
        // Update bullets
        const updatedBullets = state.bullets.map(bullet => ({
          ...bullet,
          position: {
            x: bullet.position.x + bullet.velocity.x * deltaTime / 1000,
            y: bullet.position.y + bullet.velocity.y * deltaTime / 1000
          },
          lifespan: bullet.lifespan - deltaTime
        })).filter(bullet => 
          bullet.lifespan > 0 && 
          bullet.position.y > -50 && 
          bullet.position.y < config.height + 50
        );
        
        // Update enemies
        const updatedEnemies = state.enemies.map(enemy => ({
          ...enemy,
          position: {
            x: enemy.position.x + enemy.velocity.x * deltaTime / 1000,
            y: enemy.position.y + enemy.velocity.y * deltaTime / 1000
          }
        })).filter(enemy => 
          enemy.position.y < config.height + 100 && 
          enemy.active
        );
        
        return {
          bullets: updatedBullets,
          enemies: updatedEnemies
        };
      });
    },
    
    cleanupInactiveEntities: () => {
      set(state => ({
        enemies: state.enemies.filter(enemy => enemy.active),
        bullets: state.bullets.filter(bullet => bullet.active),
        powerups: state.powerups.filter(powerup => powerup.active)
      }));
    }
  }))
);

// Selector hooks for performance optimization
export const usePlayer = () => useGameStore(state => state.player);
export const useEnemies = () => useGameStore(state => state.enemies);
export const useBullets = () => useGameStore(state => state.bullets);
export const useGameState = () => useGameStore(state => ({
  isRunning: state.isRunning,
  isPaused: state.isPaused,
  score: state.score,
  lives: state.lives,
  level: state.level
}));
export const useInput = () => useGameStore(state => state.input);
export const useGameTime = () => useGameStore(state => state.gameTime);