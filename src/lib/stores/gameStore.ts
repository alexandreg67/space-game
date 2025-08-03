import { create } from "zustand";
import { subscribeWithSelector } from "zustand/middleware";
import type {
  GameState,
  PlayerEntity,
  EnemyEntity,
  BulletEntity,
  PowerupEntity,
  InputState,
  GameConfig,
  Vector2D,
  ScreenEffect,
} from "@/types/game";
import type { Particle } from "@/lib/game/utils/objectPool";

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

  // Screen effects
  screenEffects: ScreenEffect[];

  // Shield particles
  shieldParticles: Particle[];

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
  updatePlayerShield: (shieldHealth: number) => void;
  regenerateShield: (deltaTime: number) => void;
  damageShield: (damage: number) => void;

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

  // Screen effects
  addScreenEffect: (effect: ScreenEffect) => void;
  updateScreenEffects: (currentTime: number) => void;

  // Shield particles
  addShieldParticle: (particle: Particle) => void;
  addShieldParticles: (particles: Particle[]) => void;
  updateShieldParticles: (deltaTime: number) => void;
  clearShieldParticles: () => void;

  // Accessibility settings
  updateAccessibilitySettings: (settings: Partial<Pick<GameConfig, 'enableHapticFeedback' | 'enableScreenFlash' | 'reducedMotion' | 'flashIntensityLimit'>>) => void;
}

const defaultConfig: GameConfig = {
  width: 800,
  height: 600,
  playerSpeed: 300,
  bulletSpeed: 500,
  enemySpeed: 100,
  enemySpawnRate: 2000, // milliseconds
  maxBullets: 50,
  maxEnemies: 20,
  // Shield configuration
  shieldHeight: 50, // Height of protection zone from bottom
  shieldRegenRate: 0.5, // Points per second regeneration
  shieldRegenDelay: 3000, // Delay after damage before regen starts (ms)
  shieldMaxHealth: 100, // Maximum shield health
  // Visual effects settings
  enableScreenEffects: true, // Enable screen flash and shake effects
  // Accessibility settings
  enableHapticFeedback: true, // Enable haptic feedback (requires user consent)
  enableScreenFlash: true, // Enable screen flash effects
  reducedMotion: false, // Reduce motion for accessibility
  flashIntensityLimit: 0.6, // Maximum flash opacity (0.6 = 60% for accessibility)
};

const defaultInputState: InputState = {
  keys: new Set(),
  mouse: { x: 0, y: 0, pressed: false },
  touch: { x: 0, y: 0, active: false },
};

export const useGameStore = create<GameStore>()(
  subscribeWithSelector((set, get) => {
    const actions = {
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
          screenEffects: [],
          shieldParticles: [],
          input: { ...defaultInputState, keys: new Set() },
        });
        actions.createPlayer();
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
        actions.initializeGame();
      },

      // Player management
      createPlayer: () => {
        const { config } = get();
        const player: PlayerEntity = {
          id: "player",
          type: "player",
          position: {
            x: config.width / 2,
            y: config.height - 100,
          },
          velocity: { x: 0, y: 0 },
          size: { x: 40, y: 40 },
          rotation: 0,
          active: true,
          health: 100,
          maxHealth: 100,
          shootCooldown: 0,
          canShoot: true,
          // Shield system
          shieldHealth: config.shieldMaxHealth,
          maxShieldHealth: config.shieldMaxHealth,
          shieldRegenRate: config.shieldRegenRate,
          shieldRegenDelay: config.shieldRegenDelay,
          lastShieldDamageTime: 0,
          shieldActive: true,
        };
        set({ player });
      },

      updatePlayerPosition: (position: Vector2D) => {
        set((state) => ({
          player: state.player
            ? {
                ...state.player,
                position: { ...position },
              }
            : null,
        }));
      },

      updatePlayerHealth: (health: number) => {
        set((state) => ({
          player: state.player
            ? {
                ...state.player,
                health: Math.max(0, Math.min(health, state.player.maxHealth)),
              }
            : null,
        }));
      },

      updatePlayerShield: (shieldHealth: number) => {
        set((state) => ({
          player: state.player
            ? {
                ...state.player,
                shieldHealth: Math.max(0, Math.min(shieldHealth, state.player.maxShieldHealth)),
                shieldActive: shieldHealth > 0,
              }
            : null,
        }));
      },

      regenerateShield: (deltaTime: number) => {
        const state = get();
        const now = Date.now();
        
        if (!state.player || !state.player.shieldActive) return;
        
        const timeSinceLastDamage = now - state.player.lastShieldDamageTime;
        
        // Only regenerate if enough time has passed since last damage
        if (timeSinceLastDamage >= state.player.shieldRegenDelay && 
            state.player.shieldHealth < state.player.maxShieldHealth) {
          const regenAmount = (state.player.shieldRegenRate * deltaTime) / 1000;
          const newShieldHealth = Math.min(
            state.player.maxShieldHealth, 
            state.player.shieldHealth + regenAmount
          );
          
          actions.updatePlayerShield(newShieldHealth);
        }
      },

      damageShield: (damage: number) => {
        const state = get();
        if (!state.player) return;
        
        const newShieldHealth = Math.max(0, state.player.shieldHealth - damage);
        
        set((prevState) => ({
          player: prevState.player
            ? {
                ...prevState.player,
                shieldHealth: newShieldHealth,
                shieldActive: newShieldHealth > 0,
                lastShieldDamageTime: Date.now(),
              }
            : null,
        }));
      },

      // Entity management
      addEnemy: (enemy: EnemyEntity) => {
        set((state) => ({
          enemies: [...state.enemies, enemy],
        }));
      },

      removeEnemy: (id: string) => {
        set((state) => ({
          enemies: state.enemies.filter((enemy) => enemy.id !== id),
        }));
      },

      addBullet: (bullet: BulletEntity) => {
        set((state) => {
          const bullets = [...state.bullets, bullet];
          // Limit bullet count to prevent memory issues
          if (bullets.length > state.config.maxBullets) {
            bullets.shift(); // Remove oldest bullet
          }
          return { bullets };
        });
      },

      removeBullet: (id: string) => {
        set((state) => ({
          bullets: state.bullets.filter((bullet) => bullet.id !== id),
        }));
      },

      addPowerup: (powerup: PowerupEntity) => {
        set((state) => ({
          powerups: [...state.powerups, powerup],
        }));
      },

      removePowerup: (id: string) => {
        set((state) => ({
          powerups: state.powerups.filter((powerup) => powerup.id !== id),
        }));
      },

      // Game state updates
      updateScore: (points: number) => {
        set((state) => {
          const newScore = state.score + points;
          // Calculate new level based on score (level up every 1000 points)
          const newLevel = Math.floor(newScore / 1000) + 1;
          
          return {
            score: newScore,
            level: newLevel,
          };
        });
      },

      updateLives: (lives: number) => {
        set({ lives: Math.max(0, lives) });
      },

      updateLevel: (level: number) => {
        set({ level });
      },

      updateGameTime: (deltaTime: number) => {
        set((state) => ({
          gameTime: state.gameTime + deltaTime,
        }));
      },

      updateBackgroundOffset: (offset: number) => {
        set({ backgroundOffset: offset });
      },

      // Input handling
      updateInput: (input: Partial<InputState>) => {
        set((state) => ({
          input: { ...state.input, ...input },
        }));
      },

      addKey: (key: string) => {
        set((state) => {
          const newKeys = new Set(state.input.keys);
          newKeys.add(key);
          return {
            input: { ...state.input, keys: newKeys },
          };
        });
      },

      removeKey: (key: string) => {
        set((state) => {
          const newKeys = new Set(state.input.keys);
          newKeys.delete(key);
          return {
            input: { ...state.input, keys: newKeys },
          };
        });
      },

      updateMouse: (x: number, y: number, pressed: boolean) => {
        set((state) => ({
          input: {
            ...state.input,
            mouse: { x, y, pressed },
          },
        }));
      },

      updateTouch: (x: number, y: number, active: boolean) => {
        set((state) => ({
          input: {
            ...state.input,
            touch: { x, y, active },
          },
        }));
      },

      // Entity updates
      updateEntities: (deltaTime: number) => {
        set((state) => {
          const { config } = state;

          // Update bullets
          const updatedBullets = state.bullets
            .map((bullet) => ({
              ...bullet,
              position: {
                x: bullet.position.x + (bullet.velocity.x * deltaTime) / 1000,
                y: bullet.position.y + (bullet.velocity.y * deltaTime) / 1000,
              },
              lifespan: bullet.lifespan - deltaTime,
            }))
            .filter(
              (bullet) =>
                bullet.lifespan > 0 &&
                bullet.position.y > -50 &&
                bullet.position.y < config.height + 50
            );

          // Update enemies
          const updatedEnemies = state.enemies
            .map((enemy) => ({
              ...enemy,
              position: {
                x: enemy.position.x + (enemy.velocity.x * deltaTime) / 1000,
                y: enemy.position.y + (enemy.velocity.y * deltaTime) / 1000,
              },
            }))
            .filter(
              (enemy) => enemy.position.y < config.height + 100 && enemy.active
            );

          return {
            bullets: updatedBullets,
            enemies: updatedEnemies,
          };
        });
      },

      cleanupInactiveEntities: () => {
        set((state) => ({
          enemies: state.enemies.filter((enemy) => enemy.active),
          bullets: state.bullets.filter((bullet) => bullet.active),
          powerups: state.powerups.filter((powerup) => powerup.active),
        }));
      },

      // Screen effects management
      addScreenEffect: (effect: ScreenEffect) => {
        set((state) => ({
          screenEffects: [...state.screenEffects, effect],
        }));
      },

      updateScreenEffects: (currentTime: number) => {
        set((state) => ({
          screenEffects: state.screenEffects.filter(
            (effect) => currentTime - effect.timestamp < effect.duration
          ),
        }));
      },

      // Shield particles management
      addShieldParticle: (particle: Particle) => {
        set((state) => ({
          shieldParticles: [...state.shieldParticles, particle],
        }));
      },

      addShieldParticles: (particles: Particle[]) => {
        set((state) => ({
          shieldParticles: [...state.shieldParticles, ...particles],
        }));
      },

      updateShieldParticles: (deltaTime: number) => {
        const deltaSeconds = deltaTime / 1000;
        
        set((state) => ({
          shieldParticles: state.shieldParticles
            .map(particle => {
              const newLife = particle.life - deltaTime;
              // Pre-calculate alpha based on life ratio for better performance
              const alphaRatio = particle.maxLife > 0 ? newLife / particle.maxLife : 0;
              const calculatedAlpha = Math.max(0, alphaRatio);
              
              return {
                ...particle,
                x: particle.x + particle.vx * deltaSeconds,
                y: particle.y + particle.vy * deltaSeconds,
                life: newLife,
                alpha: calculatedAlpha
              };
            })
            .filter(particle => particle.life > 0)
        }));
      },

      clearShieldParticles: () => {
        set({ shieldParticles: [] });
      },

      // Accessibility settings management
      updateAccessibilitySettings: (
        settings: Partial<Pick<GameConfig, 'enableHapticFeedback' | 'enableScreenFlash' | 'reducedMotion' | 'flashIntensityLimit'>>
      ) => {
        set((state) => ({
          config: { ...state.config, ...settings }
        }));
      },
    };

    return {
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
      screenEffects: [],
      shieldParticles: [],

      // Return stable action references
      ...actions,
    };
  })
);

// Selector hooks for performance optimization with stable references
export const usePlayer = () => useGameStore((state) => state.player);
export const useEnemies = () => useGameStore((state) => state.enemies);
export const useBullets = () => useGameStore((state) => state.bullets);
export const useGameState = () => {
  const isRunning = useGameStore((state) => state.isRunning);
  const isPaused = useGameStore((state) => state.isPaused);
  const score = useGameStore((state) => state.score);
  const lives = useGameStore((state) => state.lives);
  const level = useGameStore((state) => state.level);

  return { isRunning, isPaused, score, lives, level };
};
export const useInput = () => useGameStore((state) => state.input);
export const useGameTime = () => useGameStore((state) => state.gameTime);

// Stable action selectors to prevent re-renders
export const useGameActions = () =>
  useGameStore((state) => ({
    initializeGame: state.initializeGame,
    startGame: state.startGame,
    pauseGame: state.pauseGame,
    resumeGame: state.resumeGame,
    endGame: state.endGame,
    resetGame: state.resetGame,
    updatePlayerPosition: state.updatePlayerPosition,
    updatePlayerHealth: state.updatePlayerHealth,
    updatePlayerShield: state.updatePlayerShield,
    regenerateShield: state.regenerateShield,
    damageShield: state.damageShield,
    addEnemy: state.addEnemy,
    removeEnemy: state.removeEnemy,
    addBullet: state.addBullet,
    removeBullet: state.removeBullet,
    updateScore: state.updateScore,
    updateLives: state.updateLives,
    updateLevel: state.updateLevel,
    updateGameTime: state.updateGameTime,
    updateBackgroundOffset: state.updateBackgroundOffset,
    updateEntities: state.updateEntities,
    cleanupInactiveEntities: state.cleanupInactiveEntities,
    addScreenEffect: state.addScreenEffect,
    updateScreenEffects: state.updateScreenEffects,
    addKey: state.addKey,
    removeKey: state.removeKey,
    updateMouse: state.updateMouse,
    updateTouch: state.updateTouch,
  }));
