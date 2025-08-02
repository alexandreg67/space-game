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
    
    // Create impact effect
    this.createImpactEffect(bullet.position.x, bullet.position.y, '#ffaa00');
    
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
    
    // Damage player
    const newHealth = player.health - bullet.damage;
    gameState.updatePlayerHealth(newHealth);
    
    // Create impact effect
    this.createImpactEffect(bullet.position.x, bullet.position.y, '#ff4400');
    
    // Remove bullet
    bullet.active = false;
    gameState.removeBullet(bullet.id);
    releaseBulletToPool(bullet);
    
    // Check if player is destroyed
    if (newHealth <= 0) {
      this.handlePlayerDestroyed();
    }
  }

  // Handle player colliding with enemy
  private handlePlayerEnemyCollision(player: PlayerEntity, enemy: EnemyEntity): void {
    const gameState = useGameStore.getState();
    
    // Damage both entities
    const playerDamage = enemy.damage;
    const enemyDamage = 50; // Player collision damage to enemy
    
    const newPlayerHealth = player.health - playerDamage;
    gameState.updatePlayerHealth(newPlayerHealth);
    
    enemy.health -= enemyDamage;
    
    // Create large impact effect
    this.createImpactEffect(
      (player.position.x + enemy.position.x) / 2,
      (player.position.y + enemy.position.y) / 2,
      '#ffffff'
    );
    
    // Check if enemy is destroyed
    if (enemy.health <= 0) {
      this.destroyEnemy(enemy);
    }
    
    // Check if player is destroyed
    if (newPlayerHealth <= 0) {
      this.handlePlayerDestroyed();
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
      gameState.endGame();
    } else {
      // Respawn player after delay
      setTimeout(() => {
        if (gameState.player) {
          gameState.updatePlayerHealth(100);
          gameState.updatePlayerPosition({
            x: gameState.config.width / 2,
            y: gameState.config.height - 100
          });
        }
      }, 2000);
    }
  }

  // Create impact particle effect
  private createImpactEffect(x: number, y: number, color: string): void {
    for (let i = 0; i < 8; i++) {
      const particle = getParticleFromPool();
      particle.x = x;
      particle.y = y;
      particle.vx = (Math.random() - 0.5) * 200;
      particle.vy = (Math.random() - 0.5) * 200;
      particle.life = 300;
      particle.maxLife = 300;
      particle.color = color;
      particle.size = Math.random() * 3 + 1;
      particle.alpha = 1;
      particle.decay = 0.01;
    }
  }

  // Create explosion particle effect
  private createExplosionEffect(x: number, y: number, large: boolean = false): void {
    const particleCount = large ? 20 : 12;
    const colors = ['#ff4400', '#ffaa00', '#ff8800', '#ffffff'];
    
    for (let i = 0; i < particleCount; i++) {
      const particle = getParticleFromPool();
      const angle = (Math.PI * 2 * i) / particleCount;
      const speed = large ? 150 : 100;
      
      particle.x = x;
      particle.y = y;
      particle.vx = Math.cos(angle) * speed * (0.5 + Math.random() * 0.5);
      particle.vy = Math.sin(angle) * speed * (0.5 + Math.random() * 0.5);
      particle.life = large ? 800 : 500;
      particle.maxLife = particle.life;
      particle.color = colors[Math.floor(Math.random() * colors.length)];
      particle.size = large ? Math.random() * 6 + 2 : Math.random() * 4 + 1;
      particle.alpha = 1;
      particle.decay = 0.005;
    }
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