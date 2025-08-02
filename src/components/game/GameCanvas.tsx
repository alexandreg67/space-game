"use client";

import React, { useRef, useEffect, useCallback, useState } from "react";
import { Stage, Layer } from "react-konva";
import Konva from "konva";
import { useGameStore } from "@/lib/stores/gameStore";
import { initializePools } from "@/lib/game/utils/objectPool";
import { enemySystem } from "@/lib/game/systems/EnemySystem";
import { collisionSystem } from "@/lib/game/systems/CollisionSystem";
import { Vector2, MathUtils } from "@/lib/game/utils/math";
import { getBulletFromPool } from "@/lib/game/utils/objectPool";
import Player from "./Player";
import Enemy from "./Enemy";
import Bullet from "./Bullet";
import SpaceDustLayer from "./SpaceDustLayer";
import SpeedBackground from "./SpeedBackground";
import HUD from "./UI/HUD";

interface GameCanvasProps {
  width?: number;
  height?: number;
}

export default function GameCanvas({
  width = 800,
  height = 600,
}: GameCanvasProps) {
  const stageRef = useRef<Konva.Stage>(null);
  const animationRef = useRef<number>(0);
  const lastTimeRef = useRef<number>(0);
  const lastShotTimeRef = useRef<number>(0);
  const shootCooldown = 150; // milliseconds between shots

  const { isRunning, isPaused, player, enemies, bullets, input, level, backgroundOffset } =
    useGameStore();
  
  // Track pool initialization state to prevent timing issues
  const [poolsInitialized, setPoolsInitialized] = useState(false);

  // Initialize game when component mounts (stable reference to avoid re-renders)
  useEffect(() => {
    initializePools();
    setPoolsInitialized(true);
    useGameStore.getState().initializeGame();
  }, []); // Empty dependency array to run only once

  // Input handlers
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    e.preventDefault();
    useGameStore.getState().addKey(e.code);
  }, []);

  const handleKeyUp = useCallback((e: KeyboardEvent) => {
    e.preventDefault();
    useGameStore.getState().removeKey(e.code);
  }, []);

  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      const rect = (e.target as HTMLElement).getBoundingClientRect();
      useGameStore
        .getState()
        .updateMouse(
          e.clientX - rect.left,
          e.clientY - rect.top,
          input.mouse.pressed
        );
    },
    [input.mouse.pressed]
  );

  const handleMouseDown = useCallback((e: MouseEvent) => {
    const rect = (e.target as HTMLElement).getBoundingClientRect();
    useGameStore
      .getState()
      .updateMouse(e.clientX - rect.left, e.clientY - rect.top, true);
  }, []);

  const handleMouseUp = useCallback((e: MouseEvent) => {
    const rect = (e.target as HTMLElement).getBoundingClientRect();
    useGameStore
      .getState()
      .updateMouse(e.clientX - rect.left, e.clientY - rect.top, false);
  }, []);

  const handleTouchStart = useCallback((e: TouchEvent) => {
    e.preventDefault();
    if (e.touches.length > 0) {
      const touch = e.touches[0];
      const rect = (e.target as HTMLElement).getBoundingClientRect();
      useGameStore
        .getState()
        .updateTouch(touch.clientX - rect.left, touch.clientY - rect.top, true);
    }
  }, []);

  const handleTouchMove = useCallback((e: TouchEvent) => {
    e.preventDefault();
    if (e.touches.length > 0) {
      const touch = e.touches[0];
      const rect = (e.target as HTMLElement).getBoundingClientRect();
      useGameStore
        .getState()
        .updateTouch(touch.clientX - rect.left, touch.clientY - rect.top, true);
    }
  }, []);

  const handleTouchEnd = useCallback((e: TouchEvent) => {
    e.preventDefault();
    useGameStore.getState().updateTouch(0, 0, false);
  }, []);

  // Set up event listeners
  useEffect(() => {
    const canvas = stageRef.current;
    if (!canvas) return;

    // Keyboard events
    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);

    // Mouse events
    const canvasElement = (canvas as Konva.Stage).getStage().container();
    canvasElement.addEventListener("mousemove", handleMouseMove);
    canvasElement.addEventListener("mousedown", handleMouseDown);
    canvasElement.addEventListener("mouseup", handleMouseUp);

    // Touch events
    canvasElement.addEventListener("touchstart", handleTouchStart, {
      passive: false,
    });
    canvasElement.addEventListener("touchmove", handleTouchMove, {
      passive: false,
    });
    canvasElement.addEventListener("touchend", handleTouchEnd, {
      passive: false,
    });

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
      canvasElement.removeEventListener("mousemove", handleMouseMove);
      canvasElement.removeEventListener("mousedown", handleMouseDown);
      canvasElement.removeEventListener("mouseup", handleMouseUp);
      canvasElement.removeEventListener("touchstart", handleTouchStart);
      canvasElement.removeEventListener("touchmove", handleTouchMove);
      canvasElement.removeEventListener("touchend", handleTouchEnd);
    };
  }, [
    handleKeyDown,
    handleKeyUp,
    handleMouseMove,
    handleMouseDown,
    handleMouseUp,
    handleTouchStart,
    handleTouchMove,
    handleTouchEnd,
  ]);

  // Handle starting the game
  const handleStartGame = useCallback(() => {
    if (!isRunning) {
      useGameStore.getState().startGame();
    }
  }, [isRunning]);

  // Listen for space key to start game
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.code === "Space" && !isRunning) {
        e.preventDefault();
        handleStartGame();
      }
    };

    window.addEventListener("keydown", handleKeyPress);
    return () => window.removeEventListener("keydown", handleKeyPress);
  }, [isRunning, handleStartGame]);

  // Player control functions
  const generateBulletId = useCallback(() => {
    return `bullet-${Date.now()}-${Math.random().toString(36).substring(2, 11)}`;
  }, []);

  const createPlayerBullet = useCallback(
    (x: number, y: number) => {
      try {
        const bullet = getBulletFromPool();
        bullet.id = generateBulletId();
        bullet.position.x = x;
        bullet.position.y = y;
        bullet.velocity.x = 0;
        bullet.velocity.y = -500; // bullet speed
        bullet.active = true;
        bullet.owner = "player";
        bullet.damage = 25;
        bullet.lifespan = 3000;
        return bullet;
      } catch (error) {
        console.error("Failed to create bullet from pool:", error);
        // Fallback bullet creation
        return {
          id: generateBulletId(),
          type: "bullet" as const,
          position: { x, y },
          velocity: { x: 0, y: -500 },
          size: { x: 8, y: 16 },
          rotation: 0,
          active: true,
          damage: 25,
          owner: "player" as const,
          lifespan: 3000,
        };
      }
    },
    [generateBulletId]
  );

  const updatePlayer = useCallback(
    (deltaTime: number) => {
      if (!player || !isRunning || isPaused) return;

      const updatePlayerPosition = useGameStore.getState().updatePlayerPosition;
      const addBullet = useGameStore.getState().addBullet;
      let movement = Vector2.create(0, 0);

      // Keyboard movement
      if (input.keys.has("ArrowLeft") || input.keys.has("KeyA")) {
        movement.x -= 1;
      }
      if (input.keys.has("ArrowRight") || input.keys.has("KeyD")) {
        movement.x += 1;
      }
      if (input.keys.has("ArrowUp") || input.keys.has("KeyW")) {
        movement.y -= 1;
      }
      if (input.keys.has("ArrowDown") || input.keys.has("KeyS")) {
        movement.y += 1;
      }

      // Touch/mouse movement
      if (input.touch.active || input.mouse.pressed) {
        const targetX = input.touch.active ? input.touch.x : input.mouse.x;
        const targetY = input.touch.active ? input.touch.y : input.mouse.y;

        const direction = Vector2.subtract(
          { x: targetX, y: targetY },
          player.position
        );

        const distance = Vector2.magnitude(direction);
        if (distance > 5) {
          movement = Vector2.normalize(direction);
        }
      }

      // Normalize diagonal movement
      if (movement.x !== 0 && movement.y !== 0) {
        movement = Vector2.normalize(movement);
      }

      // Apply movement
      if (movement.x !== 0 || movement.y !== 0) {
        const speed = 300 * (deltaTime / 1000); // player speed
        const newPosition = Vector2.add(
          player.position,
          Vector2.multiply(movement, speed)
        );

        // Clamp to screen boundaries
        const halfWidth = player.size.x / 2;
        const halfHeight = player.size.y / 2;

        newPosition.x = MathUtils.clamp(
          newPosition.x,
          halfWidth,
          width - halfWidth
        );
        newPosition.y = MathUtils.clamp(
          newPosition.y,
          halfHeight,
          height - halfHeight
        );

        updatePlayerPosition(newPosition);
      }

      // Handle shooting
      const currentTime = Date.now();
      const canShoot = currentTime - lastShotTimeRef.current >= shootCooldown;

      if (
        (input.keys.has("Space") ||
          input.mouse.pressed ||
          input.touch.active) &&
        canShoot
      ) {
        const bullet = createPlayerBullet(
          player.position.x,
          player.position.y - player.size.y / 2
        );
        addBullet(bullet);
        lastShotTimeRef.current = currentTime;
      }
    },
    [player, isRunning, isPaused, input, width, height, createPlayerBullet]
  );

  // Game loop
  const gameLoop = useCallback(
    (currentTime: number) => {
      if (!isRunning || isPaused) {
        animationRef.current = requestAnimationFrame(gameLoop);
        return;
      }

      const deltaTime = currentTime - lastTimeRef.current;
      lastTimeRef.current = currentTime;

      // Update game state
      useGameStore.getState().updateGameTime(deltaTime);
      useGameStore.getState().updateEntities(deltaTime);

      // Update background scrolling
      const scrollSpeed = 50; // pixels per second
      const newBackgroundOffset = backgroundOffset + (scrollSpeed * deltaTime) / 1000;
      useGameStore.getState().updateBackgroundOffset(newBackgroundOffset);

      // Update player controls and movement
      updatePlayer(deltaTime);

      // Update difficulty
      enemySystem.updateDifficulty(level);

      // Spawn enemies
      enemySystem.spawnEnemies(currentTime, level);

      // Update enemy AI
      if (player) {
        enemySystem.updateEnemies(enemies, deltaTime, player.position);
        enemySystem.updateEnemyShooting(enemies, currentTime);
      }

      // Check collisions
      collisionSystem.update();

      // Continue the loop
      animationRef.current = requestAnimationFrame(gameLoop);
    },
    [isRunning, isPaused, updatePlayer, level, enemies, player, backgroundOffset]
  );

  // Start game loop
  useEffect(() => {
    animationRef.current = requestAnimationFrame(gameLoop);

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [gameLoop]);

  return (
    <div
      className="game-canvas-container relative"
      style={{
        width: `${width}px`,
        height: `${height}px`,
        border: "2px solid #333",
        backgroundColor: "#000",
      }}
    >
      <Stage
        ref={stageRef}
        width={width}
        height={height}
        style={{ display: "block" }}
      >
        {/* Background Layer - Speed & Progression Background */}
        <Layer name="background" listening={false}>
          <SpeedBackground 
            width={width} 
            height={height} 
            offset={backgroundOffset}
          />
        </Layer>

        {/* Foreground Effects Layer - Minimal particles for depth */}
        {poolsInitialized && (
          <Layer name="foreground-effects" listening={false}>
            <SpaceDustLayer 
              width={width} 
              height={height} 
              offset={backgroundOffset}
              particleCount={8}
              speed={1.5}
            />
          </Layer>
        )}

        {/* Entities Layer */}
        <Layer>
          {/* Player */}
          {player && player.active && <Player player={player} />}

          {/* Enemies */}
          {enemies
            .filter((enemy) => enemy.active)
            .map((enemy) => (
              <Enemy key={enemy.id} enemy={enemy} />
            ))}

          {/* Bullets */}
          {bullets
            .filter((bullet) => bullet.active)
            .map((bullet) => (
              <Bullet key={bullet.id} bullet={bullet} />
            ))}
        </Layer>

        {/* UI Layer */}
        <Layer>
          <HUD width={width} height={height} />
        </Layer>
      </Stage>

      {/* Game state overlay */}
      {!isRunning && (
        <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-75">
          <div className="text-white text-center">
            <h2 className="text-4xl font-bold mb-4">Space Shooter</h2>
            <p className="text-lg mb-4">Press SPACE to start</p>
            <p className="text-sm text-gray-300">
              Use WASD or Arrow keys to move, SPACE to shoot
            </p>
          </div>
        </div>
      )}

      {isPaused && (
        <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-75">
          <div className="text-white text-center">
            <h2 className="text-4xl font-bold mb-4">PAUSED</h2>
            <p className="text-lg">Press ESC to resume</p>
          </div>
        </div>
      )}
    </div>
  );
}
