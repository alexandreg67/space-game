// Generic object pool for memory optimization
export class ObjectPool<T> {
  private pool: T[] = [];
  private active: T[] = [];
  private createFn: () => T;
  private resetFn: (obj: T) => void;
  private maxSize: number;

  constructor(
    createFn: () => T,
    resetFn: (obj: T) => void,
    initialSize: number = 50,
    maxSize: number = 200
  ) {
    this.createFn = createFn;
    this.resetFn = resetFn;
    this.maxSize = maxSize;
    
    // Pre-allocate objects
    for (let i = 0; i < initialSize; i++) {
      this.pool.push(this.createFn());
    }
  }

  // Get object from pool or create new one
  get(): T {
    let obj: T;
    
    if (this.pool.length > 0) {
      obj = this.pool.pop()!;
    } else {
      obj = this.createFn();
    }
    
    this.active.push(obj);
    return obj;
  }

  // Return object to pool
  release(obj: T): void {
    const index = this.active.indexOf(obj);
    if (index !== -1) {
      this.active.splice(index, 1);
      this.resetFn(obj);
      
      // Only return to pool if under max size
      if (this.pool.length < this.maxSize) {
        this.pool.push(obj);
      }
    }
  }

  // Release all active objects
  releaseAll(): void {
    while (this.active.length > 0) {
      const obj = this.active.pop()!;
      this.resetFn(obj);
      
      if (this.pool.length < this.maxSize) {
        this.pool.push(obj);
      }
    }
  }

  // Get stats for debugging
  getStats() {
    return {
      poolSize: this.pool.length,
      activeSize: this.active.length,
      totalSize: this.pool.length + this.active.length
    };
  }

  // Clear all objects
  clear(): void {
    this.pool = [];
    this.active = [];
  }
}

// Specific pools for game entities
import type { BulletEntity, EnemyEntity, PowerupEntity } from '@/types/game';

// Bullet pool configuration
export const createBulletPool = () => {
  return new ObjectPool<BulletEntity>(
    // Create function
    () => ({
      id: '',
      type: 'bullet',
      position: { x: 0, y: 0 },
      velocity: { x: 0, y: 0 },
      size: { x: 8, y: 16 },
      rotation: 0,
      active: false,
      damage: 10,
      owner: 'player',
      lifespan: 3000
    }),
    // Reset function
    (bullet) => {
      bullet.active = false;
      bullet.position.x = 0;
      bullet.position.y = 0;
      bullet.velocity.x = 0;
      bullet.velocity.y = 0;
      bullet.rotation = 0;
      bullet.lifespan = 3000;
    },
    100, // Initial size
    300  // Max size
  );
};

// Enemy pool configuration
export const createEnemyPool = () => {
  return new ObjectPool<EnemyEntity>(
    // Create function
    () => ({
      id: '',
      type: 'enemy',
      position: { x: 0, y: 0 },
      velocity: { x: 0, y: 0 },
      size: { x: 32, y: 32 },
      rotation: 0,
      active: false,
      health: 30,
      damage: 20,
      aiType: 'straight',
      spawnTime: 0,
      shieldDamage: 10
    }),
    // Reset function
    (enemy) => {
      enemy.active = false;
      enemy.position.x = 0;
      enemy.position.y = 0;
      enemy.velocity.x = 0;
      enemy.velocity.y = 0;
      enemy.rotation = 0;
      enemy.health = 30;
      enemy.aiType = 'straight';
      enemy.spawnTime = 0;
    },
    50,  // Initial size
    150  // Max size
  );
};

// Powerup pool configuration
export const createPowerupPool = () => {
  return new ObjectPool<PowerupEntity>(
    // Create function
    () => ({
      id: '',
      type: 'powerup',
      position: { x: 0, y: 0 },
      velocity: { x: 0, y: 0 },
      size: { x: 24, y: 24 },
      rotation: 0,
      active: false,
      powerupType: 'health',
      duration: 5000
    }),
    // Reset function
    (powerup) => {
      powerup.active = false;
      powerup.position.x = 0;
      powerup.position.y = 0;
      powerup.velocity.x = 0;
      powerup.velocity.y = 0;
      powerup.rotation = 0;
      powerup.powerupType = 'health';
      powerup.duration = 5000;
    },
    20, // Initial size
    50  // Max size
  );
};

// Particle system for visual effects
export interface Particle {
  id?: string;
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  color: string;
  size: number;
  alpha: number;
  decay: number;
  type?: 'default' | 'shield_impact' | 'shield_spark' | 'shield_ripple' | 'explosion';
}

// Fallback particle creation function
export const createParticle = (): Particle => ({
  id: '',
  x: 0,
  y: 0,
  vx: 0,
  vy: 0,
  life: 1000,
  maxLife: 1000,
  color: '#ffffff',
  size: 2,
  alpha: 1,
  decay: 0,
  type: 'default'
});

export const createParticlePool = () => {
  return new ObjectPool<Particle>(
    // Create function
    createParticle,
    // Reset function
    (particle) => {
      particle.id = '';
      particle.x = 0;
      particle.y = 0;
      particle.vx = 0;
      particle.vy = 0;
      particle.life = 1000;
      particle.maxLife = 1000;
      particle.color = '#ffffff';
      particle.size = 2;
      particle.alpha = 1;
      particle.decay = 0;
      particle.type = 'default';
    },
    200, // Initial size
    500  // Max size
  );
};

// Pool manager to handle multiple pools
export class PoolManager {
  private pools: Map<string, ObjectPool<any>> = new Map();

  registerPool<T>(name: string, pool: ObjectPool<T>): void {
    this.pools.set(name, pool);
  }

  getPool<T>(name: string): ObjectPool<T> | undefined {
    return this.pools.get(name);
  }

  releaseAll(): void {
    this.pools.forEach(pool => pool.releaseAll());
  }

  clearAll(): void {
    this.pools.forEach(pool => pool.clear());
  }

  getStats(): Record<string, unknown> {
    const stats: Record<string, unknown> = {};
    this.pools.forEach((pool, name) => {
      stats[name] = pool.getStats();
    });
    return stats;
  }
}

// Global pool manager instance
export const poolManager = new PoolManager();

// Track initialization state
let poolsInitialized = false;

// Initialize default pools
export function initializePools(): void {
  if (poolsInitialized) {
    if (process.env.NODE_ENV === 'development') {
      console.debug('Object pools already initialized - skipping re-initialization');
    }
    return;
  }
  
  poolManager.registerPool('bullets', createBulletPool());
  poolManager.registerPool('enemies', createEnemyPool());
  poolManager.registerPool('powerups', createPowerupPool());
  poolManager.registerPool('particles', createParticlePool());
  
  poolsInitialized = true;
  if (process.env.NODE_ENV === 'development') {
    console.log('Object pools initialized successfully');
  }
}

// Check if pools are initialized
export function arePoolsInitialized(): boolean {
  return poolsInitialized;
}

// Convenience functions
export function getBulletFromPool(): BulletEntity {
  const pool = poolManager.getPool<BulletEntity>('bullets');
  if (!pool) throw new Error('Bullet pool not initialized');
  return pool.get();
}

export function releaseBulletToPool(bullet: BulletEntity): void {
  const pool = poolManager.getPool<BulletEntity>('bullets');
  if (pool) pool.release(bullet);
}

export function getEnemyFromPool(): EnemyEntity {
  const pool = poolManager.getPool<EnemyEntity>('enemies');
  if (!pool) throw new Error('Enemy pool not initialized');
  return pool.get();
}

export function releaseEnemyToPool(enemy: EnemyEntity): void {
  const pool = poolManager.getPool<EnemyEntity>('enemies');
  if (pool) pool.release(enemy);
}

export function getPowerupFromPool(): PowerupEntity {
  const pool = poolManager.getPool<PowerupEntity>('powerups');
  if (!pool) throw new Error('Powerup pool not initialized');
  return pool.get();
}

export function releasePowerupToPool(powerup: PowerupEntity): void {
  const pool = poolManager.getPool<PowerupEntity>('powerups');
  if (pool) pool.release(powerup);
}

export function getParticleFromPool(): Particle {
  const pool = poolManager.getPool<Particle>('particles');
  if (!pool) {
    console.warn('Particle pool not initialized, creating fallback particle');
    return createParticle();
  }
  return pool.get();
}

export function releaseParticleToPool(particle: Particle): void {
  const pool = poolManager.getPool<Particle>('particles');
  if (pool) pool.release(particle);
}