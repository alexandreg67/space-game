import { useGameStore } from '@/lib/stores/gameStore';
import { releaseEnemyToPool } from '@/lib/game/utils/objectPool';
import type { EnemyEntity, ShieldZone } from '@/types/game';

export class ShieldSystem {
  private gameWidth: number;
  private gameHeight: number;
  private shieldZone: ShieldZone;

  constructor(gameWidth: number, gameHeight: number) {
    this.gameWidth = gameWidth;
    this.gameHeight = gameHeight;
    
    // Initialize shield zone based on game config
    const config = useGameStore.getState().config;
    this.shieldZone = {
      y: gameHeight - config.shieldHeight,
      height: config.shieldHeight,
      active: true,
    };
  }

  // Main shield system update
  update(deltaTime: number): void {
    const gameState = useGameStore.getState();
    const { enemies, player } = gameState;

    if (!player || !this.shieldZone.active) return;

    // Check for enemies breaching the shield zone
    this.checkShieldBreaches(enemies);

    // Handle shield regeneration
    gameState.regenerateShield(deltaTime);

    // Check if shield is completely depleted
    if (player.shieldHealth <= 0 && player.shieldActive) {
      this.handleShieldDepletion();
    }

  }

  // Check if enemies have breached the bottom shield zone
  private checkShieldBreaches(enemies: EnemyEntity[]): void {
    enemies.forEach(enemy => {
      if (!enemy.active) return;

      // Check if enemy has crossed into the shield zone
      // NOTE: Using original calculation that worked - enemy bottom edge
      const enemyBottom = enemy.position.y + enemy.size.y;
      
      if (enemyBottom >= this.shieldZone.y) {
        this.handleShieldBreach(enemy);
      }
    });
  }

  // Handle when an enemy breaches the shield zone
  private handleShieldBreach(enemy: EnemyEntity): void {
    const gameState = useGameStore.getState();

    // Calculate damage based on enemy type and penetration depth
    const enemyBottom = enemy.position.y + enemy.size.y;
    const penetrationDepth = enemyBottom - this.shieldZone.y;
    let damage = enemy.shieldDamage || this.getDefaultShieldDamage(enemy.aiType);
    
    // Increase damage based on how deep the enemy penetrated
    damage += Math.floor(penetrationDepth / 10);

    // Apply shield damage
    gameState.damageShield(damage);



    // Remove the enemy
    this.destroyBreachingEnemy(enemy);

    // Update score (negative points for breach)
    gameState.updateScore(-Math.floor(damage * 2));
  }

  // Get default shield damage for enemy types
  private getDefaultShieldDamage(aiType: string): number {
    switch (aiType) {
      case 'straight': return 8;
      case 'zigzag': return 12;
      case 'seeking': return 15;
      case 'circling': return 18;
      default: return 10;
    }
  }

  // Handle complete shield depletion
  private handleShieldDepletion(): void {
    // Shield is depleted - trigger game over or critical state
    
    // End game when shield is completely destroyed
    useGameStore.getState().endGame();
    
    // Could also just reduce lives instead of immediate game over:
    // const newLives = gameState.lives - 1;
    // gameState.updateLives(newLives);
    // if (newLives <= 0) {
    //   gameState.endGame();
    // } else {
    //   // Reset shield after delay
    //   setTimeout(() => {
    //     gameState.updatePlayerShield(gameState.config.shieldMaxHealth);
    //   }, 3000);
    // }
  }

  // Destroy enemy that breached shield
  private destroyBreachingEnemy(enemy: EnemyEntity): void {
    const gameState = useGameStore.getState();
    
    // Remove enemy
    enemy.active = false;
    gameState.removeEnemy(enemy.id);
    releaseEnemyToPool(enemy);
  }




  // Get shield zone for rendering
  getShieldZone(): ShieldZone {
    return this.shieldZone;
  }


  // Update shield zone configuration
  updateShieldZone(config: { height?: number; active?: boolean }): void {
    if (config.height !== undefined) {
      this.shieldZone.y = this.gameHeight - config.height;
      this.shieldZone.height = config.height;
    }
    if (config.active !== undefined) {
      this.shieldZone.active = config.active;
    }
  }

  // Reset shield system
  reset(): void {
    const config = useGameStore.getState().config;
    this.shieldZone = {
      y: this.gameHeight - config.shieldHeight,
      height: config.shieldHeight,
      active: true,
    };
  }
}

// Singleton instance
export const shieldSystem = new ShieldSystem(800, 600);