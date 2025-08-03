# Shield-Life Protection System Resources

This document contains research findings and best practices for implementing a cascading shield-life protection system in React/Konva space games.

## Overview

The goal is to implement a protection system where:
- Shield protects the player when active (shieldHealth > 0)
- When shield is depleted (shieldHealth = 0), shield goes "down"
- Next enemy collision causes life loss instead of immediate game over
- Shield can be regenerated to resume protection

## Game Examples and Patterns

### Classic Implementations
- **StarCraft Protoss Units**: Health bar + slowly regenerating shield (mana shield pattern)
- **Modern Shooters**: Health replenishes when taking cover, multiple protection layers
- **Assassin's Creed**: Partial health block regeneration system
- **Space Shooters**: Temporary shield power-ups with duration-based protection

### JavaScript/React Game Examples
- **MichalGoly/SpaceShooter**: 15-second temporary shield power-up protection
- **JavaScript Space Shooter (2013)**: 3-life system with post-damage invulnerability
- **RaminMammadzada/js-shooter-game**: Phaser.js health/power display patterns

## Best Practice Patterns

### 1. Cascading Damage System

```typescript
interface PlayerState {
  health: number;
  maxHealth: number;
  shield: number;
  maxShield: number;
  lives: number;
  shieldDown: boolean;
  invulnerable: boolean;
  lastDamageTime: number;
}

function takeDamage(damage: number) {
  if (player.invulnerable) return;
  
  if (player.shield > 0) {
    // Shield absorbs damage first
    const shieldDamage = Math.min(damage, player.shield);
    player.shield -= shieldDamage;
    damage -= shieldDamage;
    
    if (player.shield <= 0) {
      player.shieldDown = true;
      onShieldBreak(); // Visual/audio feedback
    }
  }
  
  if (damage > 0 && player.shieldDown) {
    // Remaining damage goes to lives when shield is down
    player.lives -= 1;
    startInvulnerabilityPeriod();
    
    if (player.lives <= 0) {
      onGameOver();
    }
  }
}
```

### 2. Shield Regeneration System

```typescript
const SHIELD_CONFIG = {
  regenDelay: 3000,      // 3 seconds after damage
  regenRate: 10,         // 10 shield points per second
  regenTickRate: 100     // Update every 100ms
};

function updateShieldRegeneration(deltaTime: number) {
  const timeSinceLastDamage = Date.now() - player.lastDamageTime;
  
  if (timeSinceLastDamage >= SHIELD_CONFIG.regenDelay && 
      player.shield < player.maxShield) {
    
    const regenAmount = (SHIELD_CONFIG.regenRate * deltaTime) / 1000;
    player.shield = Math.min(player.maxShield, player.shield + regenAmount);
    
    if (player.shield > 0 && player.shieldDown) {
      player.shieldDown = false; // Shield back online
      onShieldRestored();
    }
  }
}
```

### 3. Visual Feedback System

```typescript
// Shield state enum for clear state management
enum ShieldState {
  ACTIVE = 'active',
  RECHARGING = 'recharging', 
  BROKEN = 'broken',
  REGENERATING = 'regenerating'
}

function getShieldState(): ShieldState {
  if (player.shield <= 0) return ShieldState.BROKEN;
  if (player.shield < player.maxShield && 
      Date.now() - player.lastDamageTime >= SHIELD_CONFIG.regenDelay) {
    return ShieldState.REGENERATING;
  }
  return ShieldState.ACTIVE;
}

// React Konva visual feedback component
const ShieldStatusIndicator = ({ shieldState, position }) => {
  const getShieldColor = () => {
    switch (shieldState) {
      case ShieldState.ACTIVE: return '#00aaff';
      case ShieldState.REGENERATING: return '#ffaa00';
      case ShieldState.BROKEN: return '#ff0000';
      default: return '#888888';
    }
  };
  
  return (
    <Circle
      x={position.x}
      y={position.y}
      radius={30}
      stroke={getShieldColor()}
      strokeWidth={shieldState === ShieldState.BROKEN ? 1 : 2}
      opacity={shieldState === ShieldState.BROKEN ? 0.3 : 0.8}
      dash={shieldState === ShieldState.REGENERATING ? [5, 5] : []}
    />
  );
};
```

### 4. Invulnerability System

```typescript
// Post-damage invulnerability to prevent rapid life loss
function startInvulnerabilityPeriod() {
  player.invulnerable = true;
  player.lastDamageTime = Date.now();
  
  setTimeout(() => {
    player.invulnerable = false;
  }, 2000); // 2 seconds invulnerability
}

// Visual flashing effect during invulnerability
function updateInvulnerabilityEffect() {
  if (!player.invulnerable) return;
  
  // Toggle visibility every 150ms
  if (Date.now() - lastBlinkTime >= 150) {
    player.visible = !player.visible;
    lastBlinkTime = Date.now();
  }
}
```

## Integration with React Konva

### Performance Considerations
- Use object pooling for shield effect particles
- Implement efficient collision detection with spatial partitioning
- Minimize re-renders with React.memo and selective state subscriptions

### State Management with Zustand
```typescript
interface GameState {
  player: PlayerState;
  shieldSystem: {
    lastDamageTime: number;
    regenTimer: number;
    effectsActive: boolean;
  };
}

const useGameStore = create<GameState>((set, get) => ({
  // ... existing state
  
  damageShieldOrPlayer: (damage: number) => {
    set((state) => {
      const newPlayer = { ...state.player };
      
      if (newPlayer.shield > 0) {
        // Shield takes damage
        const shieldDamage = Math.min(damage, newPlayer.shield);
        newPlayer.shield -= shieldDamage;
        
        if (newPlayer.shield <= 0) {
          newPlayer.shieldDown = true;
        }
      } else if (newPlayer.shieldDown && !newPlayer.invulnerable) {
        // Direct life loss when shield is down
        newPlayer.lives -= 1;
        newPlayer.invulnerable = true;
        
        setTimeout(() => {
          set((state) => ({
            player: { ...state.player, invulnerable: false }
          }));
        }, 2000);
      }
      
      newPlayer.lastDamageTime = Date.now();
      return { player: newPlayer };
    });
  }
}));
```

## Implementation Strategy

### Phase 1: Core Logic
1. Add `shieldDown` boolean state to player
2. Modify collision detection to check shield status
3. Implement cascading damage logic (shield → life)

### Phase 2: Visual Feedback
1. Add shield status indicator to UI
2. Implement "shield down" warning visual
3. Add particle effects for shield break/restore

### Phase 3: Game Balance
1. Fine-tune regeneration timing
2. Add power-ups for shield restoration
3. Balance invulnerability duration

### Phase 4: Polish
1. Audio cues for shield state changes
2. Screen effects for critical moments
3. Accessibility considerations

## Code Snippets for Implementation

### Zustand Store Extension
```typescript
// Add to existing gameStore.ts
shieldDown: false,
lastShieldDamageTime: 0,

// New action for enemy boundary collision
handleEnemyBoundaryCollision: (enemy: EnemyEntity) => {
  const state = get();
  
  if (state.player.shield > 0) {
    // Shield absorbs damage
    const damage = enemy.shieldDamage || 10;
    set((state) => ({
      player: {
        ...state.player,
        shield: Math.max(0, state.player.shield - damage),
        shieldDown: state.player.shield - damage <= 0,
        lastShieldDamageTime: Date.now()
      }
    }));
  } else if (state.player.shieldDown && !state.player.invulnerable) {
    // Shield is down, cause life loss
    set((state) => ({
      player: {
        ...state.player,
        lives: state.player.lives - 1,
        invulnerable: true,
        lastDamageTime: Date.now()
      }
    }));
    
    // Check for game over
    if (state.player.lives <= 1) {
      state.endGame();
    }
  }
}
```

### Visual Component Enhancement
```typescript
// Enhanced ShieldBar component
const ShieldBar = () => {
  const { shield, maxShield, shieldDown } = useGameStore(state => state.player);
  
  return (
    <div className="shield-bar">
      <div className={`shield-status ${shieldDown ? 'shield-down' : ''}`}>
        {shieldDown && <span className="warning">SHIELD DOWN</span>}
      </div>
      <div className="bar-container">
        <div 
          className="bar-fill" 
          style={{ 
            width: `${(shield / maxShield) * 100}%`,
            backgroundColor: shieldDown ? '#ff4444' : '#44aaff'
          }} 
        />
      </div>
    </div>
  );
};
```

## References

- **Space Shooter Patterns**: MichalGoly/SpaceShooter GitHub repository
- **Multi-layer Health Systems**: Classic RTS and RPG implementations
- **React Game Development**: Modern patterns for state management and rendering
- **Performance Optimization**: Object pooling and spatial partitioning techniques

## Success Metrics

1. **Gameplay Balance**: Shield provides meaningful protection without being overpowered
2. **Player Feedback**: Clear visual/audio cues for shield status changes
3. **Performance**: No frame drops during shield state transitions
4. **Accessibility**: Color-blind friendly indicators and clear state communication
5. **Code Quality**: Maintainable, well-documented implementation that preserves existing functionality