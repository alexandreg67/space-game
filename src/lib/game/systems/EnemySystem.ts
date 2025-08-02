import { useGameStore } from '@/lib/stores/gameStore';
import { getEnemyFromPool } from '@/lib/game/utils/objectPool';
import { MathUtils, Vector2 } from '@/lib/game/utils/math';
import type { EnemyEntity } from '@/types/game';

export class EnemySystem {
  private lastSpawnTime: number = 0;
  private spawnInterval: number = 2000; // Base spawn interval in ms
  private gameWidth: number;
  private gameHeight: number;

  constructor(gameWidth: number, gameHeight: number) {
    this.gameWidth = gameWidth;
    this.gameHeight = gameHeight;
  }

  // Update spawn interval based on game level
  updateDifficulty(level: number): void {
    this.spawnInterval = Math.max(500, 2000 - (level * 100));
  }

  // Spawn enemies
  spawnEnemies(currentTime: number, level: number): void {
    if (currentTime - this.lastSpawnTime >= this.spawnInterval) {
      this.createEnemy(level);
      this.lastSpawnTime = currentTime;
    }
  }

  private createEnemy(level: number): void {
    const enemy = getEnemyFromPool();
    
    // Generate enemy ID
    enemy.id = `enemy-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    // Random spawn position along top edge
    enemy.position.x = MathUtils.random(50, this.gameWidth - 50);
    enemy.position.y = -50;
    
    // Determine enemy type based on level
    const enemyTypes: Array<typeof enemy.aiType> = ['straight', 'zigzag', 'seeking', 'circling'];
    const typeIndex = Math.min(Math.floor(level / 2), enemyTypes.length - 1);
    const possibleTypes = enemyTypes.slice(0, typeIndex + 1);
    enemy.aiType = possibleTypes[Math.floor(Math.random() * possibleTypes.length)];
    
    // Set enemy properties based on type
    switch (enemy.aiType) {
      case 'straight':
        enemy.velocity.x = 0;
        enemy.velocity.y = 80 + (level * 10);
        enemy.health = 30;
        enemy.damage = 20;
        enemy.size = { x: 24, y: 24 };
        break;
        
      case 'zigzag':
        enemy.velocity.x = MathUtils.random(-100, 100);
        enemy.velocity.y = 60 + (level * 8);
        enemy.health = 40;
        enemy.damage = 25;
        enemy.size = { x: 28, y: 28 };
        break;
        
      case 'seeking':
        enemy.velocity.x = 0;
        enemy.velocity.y = 70 + (level * 5);
        enemy.health = 60;
        enemy.damage = 35;
        enemy.size = { x: 32, y: 32 };
        break;
        
      case 'circling':
        enemy.velocity.x = MathUtils.random(-80, 80);
        enemy.velocity.y = 50 + (level * 5);
        enemy.health = 80;
        enemy.damage = 40;
        enemy.size = { x: 36, y: 36 };
        break;
    }
    
    enemy.active = true;
    enemy.spawnTime = Date.now();
    
    // Add to game store
    useGameStore.getState().addEnemy(enemy);
  }

  // Update enemy AI and movement
  updateEnemies(enemies: EnemyEntity[], deltaTime: number, playerPosition: { x: number; y: number }): void {
    enemies.forEach(enemy => {
      this.updateEnemyAI(enemy, deltaTime, playerPosition);
      
      // Update position
      enemy.position.x += enemy.velocity.x * deltaTime / 1000;
      enemy.position.y += enemy.velocity.y * deltaTime / 1000;
      
      // Remove enemies that are off-screen
      if (enemy.position.y > this.gameHeight + 100 || 
          enemy.position.x < -100 || 
          enemy.position.x > this.gameWidth + 100) {
        enemy.active = false;
        useGameStore.getState().removeEnemy(enemy.id);
      }
    });
  }

  private updateEnemyAI(enemy: EnemyEntity, deltaTime: number, playerPosition: { x: number; y: number }): void {
    const timeSinceSpawn = Date.now() - enemy.spawnTime;
    
    switch (enemy.aiType) {
      case 'straight':
        // Simple straight-down movement (already set in velocity)
        break;
        
      case 'zigzag':
        // Zigzag pattern
        const zigzagFreq = 0.003;
        const zigzagAmplitude = 100;
        enemy.velocity.x = Math.sin(timeSinceSpawn * zigzagFreq) * zigzagAmplitude;
        break;
        
      case 'seeking':
        // Move towards player
        const directionToPlayer = Vector2.subtract(playerPosition, enemy.position);
        const distance = Vector2.magnitude(directionToPlayer);
        
        if (distance > 0) {
          const normalizedDirection = Vector2.normalize(directionToPlayer);
          const seekingStrength = 0.3; // How strongly to seek player
          const baseVelocity = { x: 0, y: enemy.velocity.y };
          const seekingVelocity = Vector2.multiply(normalizedDirection, 50);
          
          enemy.velocity.x = MathUtils.lerp(
            baseVelocity.x, 
            seekingVelocity.x, 
            seekingStrength
          );
        }
        break;
        
      case 'circling':
        // Circular movement pattern
        const circleFreq = 0.002;
        const circleRadius = 60;
        
        enemy.velocity.x = Math.cos(timeSinceSpawn * circleFreq) * circleRadius * 0.5;
        
        // Oscillate Y velocity slightly
        const baseYVelocity = enemy.velocity.y;
        enemy.velocity.y = baseYVelocity + Math.sin(timeSinceSpawn * circleFreq * 2) * 20;
        break;
    }
    
    // Clamp velocity to reasonable bounds
    enemy.velocity.x = MathUtils.clamp(enemy.velocity.x, -200, 200);
    enemy.velocity.y = MathUtils.clamp(enemy.velocity.y, 20, 300);
  }

  // Enemy shooting logic (for more advanced enemies)
  updateEnemyShooting(enemies: EnemyEntity[], currentTime: number): void {
    enemies.forEach(enemy => {
      // Only certain enemy types shoot
      if (enemy.aiType === 'seeking' || enemy.aiType === 'circling') {
        const timeSinceSpawn = currentTime - enemy.spawnTime;
        const shootInterval = enemy.aiType === 'seeking' ? 2000 : 3000;
        
        if (timeSinceSpawn > 1000 && timeSinceSpawn % shootInterval < 100) {
          this.createEnemyBullet(enemy);
        }
      }
    });
  }

  private createEnemyBullet(enemy: EnemyEntity): void {
    const { addBullet } = useGameStore.getState();
    
    const bullet = {
      id: `enemy-bullet-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      type: 'bullet' as const,
      position: { x: enemy.position.x, y: enemy.position.y + enemy.size.y / 2 },
      velocity: { x: 0, y: 150 },
      size: { x: 6, y: 12 },
      rotation: 0,
      active: true,
      damage: enemy.damage / 2,
      owner: 'enemy' as const,
      lifespan: 4000
    };
    
    addBullet(bullet);
  }
}

// Singleton instance
export const enemySystem = new EnemySystem(800, 600);