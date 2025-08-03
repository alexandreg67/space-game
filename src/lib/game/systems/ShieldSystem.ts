import { useGameStore } from '@/lib/stores/gameStore';
import { releaseEnemyToPool, getParticleFromPool } from '@/lib/game/utils/objectPool';
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

    // Calculate impact point and angle
    const impactX = enemy.position.x;
    const impactY = this.shieldZone.y;
    const impactAngle = Math.atan2(enemy.velocity.y, enemy.velocity.x);
    const severity = Math.min(damage / 20, 1.0); // Normalize to 0-1

    // Create enhanced shield breach effects
    this.createShieldBreachEffect(impactX, impactY, impactAngle, severity);
    this.createShieldRippleEffect(impactX, impactY, severity);

    // Create screen effects for visual feedback
    this.createShieldImpactFeedback(severity);

    // Cascading protection logic: Shield protects if not down, otherwise direct life loss
    // Use shieldDown as single source of truth for protection status
    if (gameState.player && !gameState.player.shieldDown) {
      // Shield is active - absorb damage as before
      gameState.damageShield(damage);
    } else {
      // Shield is down - enemy breach causes direct life loss
      const newLives = gameState.lives - 1;
      gameState.updateLives(newLives);
      
      // Check for game over
      if (newLives <= 0) {
        gameState.endGame();
      }
    }

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
    // Shield is depleted - set shield down state instead of immediate game over
    const gameState = useGameStore.getState();
    
    // Set shield to "down" state - protection is disabled but game continues
    gameState.setShieldDown(true);
  }

  // Destroy enemy that breached shield
  private destroyBreachingEnemy(enemy: EnemyEntity): void {
    const gameState = useGameStore.getState();
    
    // Remove enemy
    enemy.active = false;
    gameState.removeEnemy(enemy.id);
    releaseEnemyToPool(enemy);
  }

  // Create enhanced shield breach particle effect
  private createShieldBreachEffect(x: number, y: number, angle: number, severity: number): void {
    const particleCount = Math.floor(12 + severity * 8); // 12-20 particles based on severity
    const colors = severity > 0.7 ? 
      ['#ff0000', '#ff4400', '#ffaa00', '#ffffff'] : // High damage - fire colors
      ['#00ffff', '#44aaff', '#88ccff', '#aaccff']; // Normal damage - shield colors

    const particles = [];

    for (let i = 0; i < particleCount; i++) {
      const particle = getParticleFromPool();
      
      // Create directional spread based on impact angle
      const spreadAngle = (Math.PI / 3) * (Math.random() - 0.5); // 60-degree spread
      const particleAngle = angle + spreadAngle;
      const speed = 80 + severity * 120 + Math.random() * 60; // Variable speed
      
      particle.id = `shield_impact_${Date.now()}_${i}`;
      particle.x = x + (Math.random() - 0.5) * 20; // Small spread at impact point
      particle.y = y + (Math.random() - 0.5) * 10;
      particle.vx = Math.cos(particleAngle) * speed;
      particle.vy = Math.sin(particleAngle) * speed;
      
      // Particle properties
      particle.life = 400 + severity * 400; // Longer life for severe impacts
      particle.maxLife = particle.life;
      particle.color = colors[Math.floor(Math.random() * colors.length)];
      particle.size = 2 + severity * 3 + Math.random() * 2;
      particle.alpha = 1;
      particle.decay = 0.006 + Math.random() * 0.004; // Variable decay
      particle.type = severity > 0.5 ? 'shield_spark' : 'shield_impact'; // Different types based on severity
      
      particles.push(particle);
    }

    // Add all particles to the game store for rendering
    useGameStore.getState().addShieldParticles(particles);
  }

  // Create shield ripple effect (visual-only particles)
  private createShieldRippleEffect(x: number, y: number, severity: number): void {
    const ringCount = Math.floor(2 + severity * 2); // 2-4 concentric rings
    const particles = [];
    
    for (let ring = 0; ring < ringCount; ring++) {
      const delayOffset = ring * 100; // Stagger timing via initial delay
      const particlesPerRing = 16 + ring * 4; // More particles for outer rings
      
      for (let i = 0; i < particlesPerRing; i++) {
        const particle = getParticleFromPool();
        const angle = (Math.PI * 2 * i) / particlesPerRing;
        const speed = 40 + ring * 20; // Faster for outer rings
        
        particle.id = `shield_ripple_${Date.now()}_${ring}_${i}`;
        particle.x = x;
        particle.y = y;
        particle.vx = Math.cos(angle) * speed;
        particle.vy = Math.sin(angle) * speed * 0.3; // Flatten vertically for shield effect
        
        // Ring-specific properties with staggered start
        particle.life = 600 - ring * 100 + delayOffset; // Delay start of ripple ring
        particle.maxLife = particle.life;
        particle.color = severity > 0.5 ? '#ff4400' : '#00ffff';
        particle.size = 1 + Math.random();
        particle.alpha = 0.8 - ring * 0.15; // Fade outer rings
        particle.decay = 0.003 + ring * 0.002;
        particle.type = 'shield_ripple';
        
        particles.push(particle);
      }
    }

    // Add all ripple particles to the game store
    useGameStore.getState().addShieldParticles(particles);
  }

  // Create visual and haptic feedback for shield impacts
  private createShieldImpactFeedback(severity: number): void {
    const gameState = useGameStore.getState();

    // Screen flash effect - intensity based on severity
    const flashIntensity = Math.min(0.8, severity * 1.2); // Cap at 0.8 for accessibility
    const flashColor = severity > 0.7 ? '#ff4400' : '#00aaff'; // Orange for heavy hits, blue for normal
    const flashDuration = Math.floor(100 + severity * 150); // 100-250ms duration

    gameState.addScreenEffect({
      id: `shield_flash_${Date.now()}`,
      type: 'flash',
      color: flashColor,
      intensity: flashIntensity,
      duration: flashDuration,
      timestamp: Date.now()
    });

    // Screen shake effect - more intense for severe impacts
    const shakeIntensity = Math.min(8, severity * 12); // Max 8px shake
    const shakeDuration = Math.floor(80 + severity * 120); // 80-200ms duration

    gameState.addScreenEffect({
      id: `shield_shake_${Date.now()}`,
      type: 'shake',
      intensity: shakeIntensity,
      duration: shakeDuration,
      timestamp: Date.now()
    });

    // Haptic feedback with user consent and improved permission handling
    if (gameState.config.enableHapticFeedback && 
        typeof navigator !== 'undefined' && 'vibrate' in navigator) {
      const vibrationPattern = severity > 0.7 ? [50, 50, 100] : [30]; // Long pattern for severe hits
      
      // Modern browsers may require user gesture for vibration API
      try {
        const result = navigator.vibrate(vibrationPattern);
        // Some browsers return false if vibration failed
        if (!result && process.env.NODE_ENV === 'development') {
          console.debug('Haptic feedback may require user gesture or permission');
        }
      } catch (error) {
        // Silently fail if haptic feedback is not available or blocked
        if (process.env.NODE_ENV === 'development') {
          console.debug('Haptic feedback failed:', error);
        }
      }
    }
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

// Singleton instance with dynamic dimensions from game config
const { width, height } = useGameStore.getState().config;
export const shieldSystem = new ShieldSystem(width, height);