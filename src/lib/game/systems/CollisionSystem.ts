import { useGameStore } from '@/lib/stores/gameStore';
import { checkEntityCollision, QuadTree, getEntityCollisionBox } from '@/lib/game/utils/collision';
import { releaseBulletToPool, releaseEnemyToPool, getParticleFromPool } from '@/lib/game/utils/objectPool';
import type { PlayerEntity, EnemyEntity, BulletEntity } from '@/types/game';

export class CollisionSystem {
  private quadTree: QuadTree;
  private gameWidth: number;
  private gameHeight: number;

  constructor(gameWidth: number, gameHeight: number) {
    this.gameWidth = gameWidth;
    this.gameHeight = gameHeight;
    this.quadTree = new QuadTree({
      x: 0,
      y: 0,
      width: gameWidth,
      height: gameHeight
    });
  }

  // Main collision detection update
  update(): void {
    const gameState = useGameStore.getState();
    const { player, enemies, bullets } = gameState;

    if (!player || !player.active) return;

    // Clear and rebuild quad tree
    this.quadTree.clear();

    // Insert all entities into quad tree
    [player, ...enemies, ...bullets].forEach(entity => {
      if (entity && entity.active) {
        this.quadTree.insert(entity);
      }
    });

    // Check collisions
    this.checkBulletEnemyCollisions(bullets, enemies);
    this.checkBulletPlayerCollisions(bullets, player);
    this.checkPlayerEnemyCollisions(player, enemies);
    
    // Clean up inactive entities
    this.cleanupInactiveEntities();
  }

  // Bullet vs Enemy collisions
  private checkBulletEnemyCollisions(bullets: BulletEntity[], _enemies: EnemyEntity[]): void {
    const playerBullets = bullets.filter(b => b.active && b.owner === 'player');
    
    playerBullets.forEach(bullet => {
      const nearbyEntities = this.quadTree.retrieve(bullet);
      const nearbyEnemies = nearbyEntities.filter(e => 
        e.type === 'enemy' && e.active
      ) as EnemyEntity[];

      nearbyEnemies.forEach(enemy => {
        if (checkEntityCollision(bullet, enemy)) {
          this.handleBulletEnemyCollision(bullet, enemy);
        }
      });
    });
  }

  // Bullet vs Player collisions
  private checkBulletPlayerCollisions(bullets: BulletEntity[], player: PlayerEntity): void {
    const enemyBullets = bullets.filter(b => b.active && b.owner === 'enemy');
    
    enemyBullets.forEach(bullet => {
      if (checkEntityCollision(bullet, player)) {
        this.handleBulletPlayerCollision(bullet, player);
      }
    });
  }

  // Player vs Enemy collisions
  private checkPlayerEnemyCollisions(player: PlayerEntity, _enemies: EnemyEntity[]): void {
    const nearbyEntities = this.quadTree.retrieve(player);
    const nearbyEnemies = nearbyEntities.filter(e => 
      e.type === 'enemy' && e.active
    ) as EnemyEntity[];

    nearbyEnemies.forEach(enemy => {
      if (checkEntityCollision(player, enemy)) {
        this.handlePlayerEnemyCollision(player, enemy);
      }
    });
  }

  // Handle bullet hitting enemy
  private handleBulletEnemyCollision(bullet: BulletEntity, enemy: EnemyEntity): void {
    const gameState = useGameStore.getState();
    
    // Damage enemy
    enemy.health -= bullet.damage;
    
    // Calculate impact intensity based on damage and enemy health
    const intensity = Math.min(bullet.damage / 30, 1.0);
    
    // Create enhanced impact effect
    this.createImpactEffect(bullet.position.x, bullet.position.y, '#ffaa00', intensity);
    
    // Remove bullet
    bullet.active = false;
    gameState.removeBullet(bullet.id);
    releaseBulletToPool(bullet);
    
    // Check if enemy is destroyed
    if (enemy.health <= 0) {
      this.destroyEnemy(enemy);
    }
  }

  // Handle bullet hitting player
  private handleBulletPlayerCollision(bullet: BulletEntity, player: PlayerEntity): void {
    const gameState = useGameStore.getState();
    
    // Calculate intensity based on damage relative to player health
    const intensity = Math.min(bullet.damage / 25, 1.2);
    
    // Check shield first, then player health
    if (player.shieldActive && player.shieldHealth > 0) {
      // Shield absorbs the damage
      const shieldDamage = Math.min(bullet.damage, player.shieldHealth);
      const excessDamage = bullet.damage - shieldDamage;
      
      // Play shield hit sound
      gameState.playGameSound('shield_hit', { volume: 0.7 });
      
      gameState.damageShield(shieldDamage);
      
      // Create shield impact effect with intensity
      this.createImpactEffect(bullet.position.x, bullet.position.y, '#00ffff', intensity * 0.8);
      
      // If there's excess damage, apply to player health
      if (excessDamage > 0) {
        const newHealth = player.health - excessDamage;
        gameState.updatePlayerHealth(newHealth);
        
        // Play player hit sound
        gameState.playGameSound('player_hit', { volume: 0.9 });
        
        // Create additional impact effect for health damage with higher intensity
        this.createImpactEffect(bullet.position.x, bullet.position.y, '#ff4400', intensity * 1.2);
        
        // Check if player is destroyed
        if (newHealth <= 0) {
          this.handlePlayerDestroyed();
        }
      }
    } else {
      // No shield protection - damage player directly
      const newHealth = player.health - bullet.damage;
      gameState.updatePlayerHealth(newHealth);
      
      // Play player hit sound
      gameState.playGameSound('player_hit', { volume: 0.9 });
      
      // Create intense impact effect for unshielded hit
      this.createImpactEffect(bullet.position.x, bullet.position.y, '#ff4400', intensity * 1.5);
      
      // Check if player is destroyed
      if (newHealth <= 0) {
        this.handlePlayerDestroyed();
      }
    }
    
    // Remove bullet
    bullet.active = false;
    gameState.removeBullet(bullet.id);
    releaseBulletToPool(bullet);
  }

  // Handle player colliding with enemy
  private handlePlayerEnemyCollision(player: PlayerEntity, enemy: EnemyEntity): void {
    const gameState = useGameStore.getState();
    
    // Damage both entities
    const playerDamage = enemy.damage;
    const enemyDamage = 50; // Player collision damage to enemy
    
    // Check shield first for player damage
    if (player.shieldActive && player.shieldHealth > 0) {
      // Shield absorbs the damage
      const shieldDamage = Math.min(playerDamage, player.shieldHealth);
      const excessDamage = playerDamage - shieldDamage;
      
      gameState.damageShield(shieldDamage);
      
      // If there's excess damage, apply to player health
      if (excessDamage > 0) {
        const newPlayerHealth = player.health - excessDamage;
        gameState.updatePlayerHealth(newPlayerHealth);
        
        // Check if player is destroyed
        if (newPlayerHealth <= 0) {
          this.handlePlayerDestroyed();
        }
      }
    } else {
      // No shield protection - damage player directly
      const newPlayerHealth = player.health - playerDamage;
      gameState.updatePlayerHealth(newPlayerHealth);
      
      // Check if player is destroyed
      if (newPlayerHealth <= 0) {
        this.handlePlayerDestroyed();
      }
    }
    
    // Damage enemy
    enemy.health -= enemyDamage;
    
    // Create large impact effect with high intensity
    const collisionIntensity = 1.8; // Player-enemy collisions are always intense
    this.createImpactEffect(
      (player.position.x + enemy.position.x) / 2,
      (player.position.y + enemy.position.y) / 2,
      player.shieldActive && player.shieldHealth > 0 ? '#00ffff' : '#ffffff',
      collisionIntensity
    );
    
    // Check if enemy is destroyed
    if (enemy.health <= 0) {
      this.destroyEnemy(enemy);
    }
  }

  // Destroy enemy and award points
  private destroyEnemy(enemy: EnemyEntity): void {
    const gameState = useGameStore.getState();
    
    // Calculate score based on enemy type
    let points = 100;
    switch (enemy.aiType) {
      case 'straight': points = 100; break;
      case 'zigzag': points = 150; break;
      case 'seeking': points = 200; break;
      case 'circling': points = 250; break;
    }
    
    // Award points
    gameState.updateScore(points);
    
    // Play explosion sound
    gameState.playGameSound('explosion', { volume: 0.8 });
    
    // Create explosion effect
    this.createExplosionEffect(enemy.position.x, enemy.position.y);
    
    // Remove enemy
    enemy.active = false;
    gameState.removeEnemy(enemy.id);
    releaseEnemyToPool(enemy);
  }

  // Handle player destruction
  private handlePlayerDestroyed(): void {
    const gameState = useGameStore.getState();
    
    // Create large explosion
    if (gameState.player) {
      this.createExplosionEffect(
        gameState.player.position.x, 
        gameState.player.position.y,
        true // Large explosion
      );
    }
    
    // Reduce lives
    const newLives = gameState.lives - 1;
    gameState.updateLives(newLives);
    
    // Check game over
    if (newLives <= 0) {
      // Play game over sound
      gameState.playGameSound('game_over', { volume: 1.0 });
      // Explicitly call checkGameOver when lives reach 0
      gameState.checkGameOver();
    } else {
      // Respawn player after delay
      setTimeout(() => {
        if (gameState.player) {
          gameState.updatePlayerHealth(100);
          this.resetPlayerShield();
          gameState.updatePlayerPosition({
            x: gameState.config.width / 2,
            y: gameState.config.height - 100
          });
        }
      }, 2000);
    }
  }

  // Reset player shield to full health
  private resetPlayerShield(): void {
    const gameState = useGameStore.getState();
    gameState.updatePlayerShield(gameState.config.shieldMaxHealth);
  }

  // Create enhanced impact particle effect
  private createImpactEffect(x: number, y: number, color: string, intensity: number = 1.0): void {
    const particleCount = Math.floor(8 * intensity); // Scale particle count with intensity
    const baseColors = color === '#00ffff' ? 
      ['#00ffff', '#44aaff', '#88ccff', '#aaccff'] : // Shield colors
      color === '#ff4400' ? 
      ['#ff4400', '#ffaa00', '#ff8800', '#ffffff'] : // Health damage colors
      ['#ffaa00', '#ff8800', '#ffcc44', '#ffffff']; // Default impact colors

    for (let i = 0; i < particleCount; i++) {
      const particle = getParticleFromPool();
      
      // Enhanced positioning with slight spread
      particle.x = x + (Math.random() - 0.5) * 15;
      particle.y = y + (Math.random() - 0.5) * 15;
      
      // Physics-based velocity with radial pattern
      const angle = (Math.PI * 2 * i) / particleCount + (Math.random() - 0.5) * 0.5;
      const speed = 100 + intensity * 150 + Math.random() * 100;
      particle.vx = Math.cos(angle) * speed;
      particle.vy = Math.sin(angle) * speed;
      
      // Enhanced particle properties
      particle.life = 250 + intensity * 250 + Math.random() * 200;
      particle.maxLife = particle.life;
      particle.color = baseColors[Math.floor(Math.random() * baseColors.length)];
      particle.size = Math.random() * 2 + intensity * 2 + 0.5;
      particle.alpha = 1;
      particle.decay = 0.007 + Math.random() * 0.005;
    }

    // Add screen flash for significant impacts
    if (intensity > 0.7) {
      this.createScreenFlash(color, intensity * 0.3);
    }
  }

  // Create enhanced explosion particle effect
  private createExplosionEffect(x: number, y: number, large: boolean = false): void {
    const particleCount = large ? 24 : 16; // Increased particle count
    const colors = ['#ff4400', '#ffaa00', '#ff8800', '#ffffff', '#ff0000'];
    const innerRing = Math.floor(particleCount * 0.6);
    const outerRing = particleCount - innerRing;
    
    // Inner ring - faster, brighter particles
    for (let i = 0; i < innerRing; i++) {
      const particle = getParticleFromPool();
      const angle = (Math.PI * 2 * i) / innerRing + Math.random() * 0.3;
      const speed = (large ? 120 : 80) + Math.random() * 80;
      
      particle.x = x + (Math.random() - 0.5) * 10;
      particle.y = y + (Math.random() - 0.5) * 10;
      particle.vx = Math.cos(angle) * speed;
      particle.vy = Math.sin(angle) * speed;
      particle.life = large ? 600 : 400;
      particle.maxLife = particle.life;
      particle.color = colors[Math.floor(Math.random() * colors.length)];
      particle.size = large ? Math.random() * 4 + 2 : Math.random() * 3 + 1;
      particle.alpha = 1;
      particle.decay = 0.006;
    }
    
    // Outer ring - slower, longer-lasting particles
    for (let i = 0; i < outerRing; i++) {
      const particle = getParticleFromPool();
      const angle = (Math.PI * 2 * i) / outerRing + Math.random() * 0.5;
      const speed = (large ? 180 : 140) + Math.random() * 60;
      
      particle.x = x;
      particle.y = y;
      particle.vx = Math.cos(angle) * speed;
      particle.vy = Math.sin(angle) * speed;
      particle.life = large ? 1000 : 700;
      particle.maxLife = particle.life;
      particle.color = colors[Math.floor(Math.random() * (colors.length - 1))]; // Skip white for outer ring
      particle.size = large ? Math.random() * 3 + 1 : Math.random() * 2 + 0.5;
      particle.alpha = 0.8;
      particle.decay = 0.004;
    }

    // Screen flash for large explosions
    if (large) {
      this.createScreenFlash('#ffffff', 0.4);
      this.createCameraShake(0.8, 300);
    }
  }

  // Create screen flash effect
  private createScreenFlash(color: string, intensity: number): void {
    const gameState = useGameStore.getState();
    if (!gameState.config?.enableScreenEffects) return; // Allow disabling in settings
    
    // Create a temporary flash element via game store
    gameState.addScreenEffect({
      type: 'flash',
      color: color,
      intensity: Math.min(intensity, 0.6), // Cap intensity to prevent seizure risk
      duration: 150, // Short flash duration
      timestamp: Date.now()
    });
  }

  // Create camera shake effect
  private createCameraShake(intensity: number, duration: number): void {
    const gameState = useGameStore.getState();
    if (!gameState.config?.enableScreenEffects) return;
    
    gameState.addScreenEffect({
      type: 'shake',
      intensity: Math.min(intensity, 1.0),
      duration: Math.min(duration, 500), // Cap duration
      timestamp: Date.now()
    });
  }

  // Clean up inactive entities
  private cleanupInactiveEntities(): void {
    const gameState = useGameStore.getState();
    gameState.cleanupInactiveEntities();
  }

  // Check if entity is within game boundaries  
  private isInBounds(entity: PlayerEntity | EnemyEntity | BulletEntity): boolean {
    const bounds = getEntityCollisionBox(entity);
    return bounds.x + bounds.width > 0 && 
           bounds.x < this.gameWidth &&
           bounds.y + bounds.height > 0 && 
           bounds.y < this.gameHeight;
  }
}

// Singleton instance
export const collisionSystem = new CollisionSystem(800, 600);