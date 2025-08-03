# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a 2D space shoot 'em up game built with React 19, Next.js 15, TypeScript, and React Konva. The game features top-down space combat with enemy AI, collision detection, progressive difficulty, and performance optimizations including object pooling and spatial partitioning.

## Commands

### Development
```bash
npm run dev         # Start development server with Turbopack (usually port 3000 or 3002)
npm run build       # Build for production 
npm run start       # Start production server
npm run lint        # Run ESLint with Next.js TypeScript configuration
```

### Game Testing
- Main game: `http://localhost:3000/game`
- Landing page: `http://localhost:3000`

## Architecture Overview

### Core Technologies
- **React Konva**: 2D canvas rendering with React declarative components
- **Zustand**: Lightweight state management optimized for games
- **TypeScript**: Full type safety with comprehensive game entity definitions
- **Entity-Component-System (ECS)**: Modular architecture for game entities and behaviors

### Game Loop Architecture
The game uses a single centralized game loop in `GameCanvas.tsx` that handles:
- Player input and movement
- Enemy AI and spawning 
- Bullet physics and lifecycle
- Background scrolling
- Collision detection
- State updates

**Critical**: Avoid multiple `requestAnimationFrame` loops. All game logic should be centralized in the main game loop to prevent performance issues and timing conflicts.

### State Management (Zustand)
The game store (`src/lib/stores/gameStore.ts`) manages:
- Game state (running, paused, score, lives, level)
- All entities (player, enemies, bullets, powerups)
- Input state (keyboard, mouse, touch)
- Game configuration and timing

Use selector hooks for performance:
```typescript
const player = useGameStore(state => state.player);
const { score, lives } = useGameState();
```

### Performance Optimizations

#### Object Pooling
Located in `src/lib/game/utils/objectPool.ts`. Pre-allocates bullets, enemies, and particles to avoid garbage collection:
```typescript
const bullet = getBulletFromPool();
// Use bullet...
releaseBulletToPool(bullet);
```

#### Spatial Partitioning
QuadTree implementation in `src/lib/game/utils/collision.ts` optimizes collision detection from O(n²) to O(n log n).

#### Memory Management
- Entities use `active` flags instead of array splicing
- Cleanup happens in batches
- Background stars are memoized to prevent re-generation

### Component Structure

#### Game Components (`src/components/game/`)
- **GameCanvas**: Main game container with centralized game loop
- **Player**: Pure rendering component (movement handled in game loop)
- **Enemy**: Renders different enemy types based on AI behavior
- **Bullet**: Renders player and enemy projectiles
- **Background**: Memoized star field with scrolling
- **UI/HUD**: Game interface (score, lives, health)

#### Game Systems (`src/lib/game/systems/`)
- **EnemySystem**: AI behaviors (straight, zigzag, seeking, circling) and spawning
- **CollisionSystem**: AABB collision detection with QuadTree optimization

### Entity Types
All entities inherit from `EntityType` with required fields:
- `id`, `type`, `position`, `velocity`, `size`, `rotation`, `active`
- Specialized entities add specific properties (health, damage, AI type)

### Input Handling
Multi-platform input system supports:
- WASD/Arrow keys for movement
- Space bar for shooting
- Mouse click/drag for movement and shooting
- Touch controls for mobile

### Rendering Pipeline
1. **Background Layer**: Scrolling starfield
2. **Entities Layer**: Player, enemies, bullets (filtered by `active` status)
3. **UI Layer**: HUD and game state overlays

## Special Configurations

### Next.js Canvas Setup
The `next.config.ts` includes webpack configuration to handle Konva/Canvas dependencies:
- Excludes canvas from client-side bundles
- Prevents SSR issues with React Konva

### ESLint Configuration
Custom rules allow `any` types and ignore unused parameters prefixed with `_` for game development flexibility.

### Dynamic Imports
GameCanvas uses dynamic import with `ssr: false` to prevent server-side rendering issues with canvas elements.

## Game Development Patterns

### Adding New Enemy Types
1. Define AI behavior in `EnemySystem.updateEnemyAI()`
2. Add visual representation in `Enemy.tsx`
3. Update enemy creation in `EnemySystem.createEnemy()`

### Performance Considerations
- Use object pools for frequently created/destroyed entities
- Filter entities by `active` status before rendering
- Centralize game logic in main loop to avoid timing conflicts
- Memoize expensive calculations (star generation, AI pathfinding)

### Collision Detection
- Use QuadTree for broad phase collision detection
- AABB collision for rectangular entities
- Circle collision for performance-critical checks
- Entity collision boxes calculated from position and size

## Resource Files

### GAME_RESOURCES.json
Comprehensive development resources including:
- Library recommendations and benchmarks
- GitHub repositories with similar implementations
- Architecture patterns and best practices
- Development phases and implementation guidance

This file serves as a knowledge base for game development decisions and library choices.

