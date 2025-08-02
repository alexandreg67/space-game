"use client";

import React, { useEffect, useState, useMemo } from "react";
import { Group, Rect, Shape, Circle } from "react-konva";
import Konva from "konva";
import type { PlayerEntity } from "@/types/game";

// Constants for visual elements
const SHIELD_RADIUS = 25;
const CORE_BASE_RADIUS = 2;
const CORE_GLOW_MULTIPLIER = 2;

interface PlayerProps {
  player: PlayerEntity;
}

export default function Player({ player }: PlayerProps) {
  // Player movement and shooting are now handled by the main game loop
  // This component only renders the player visual representation

  // Thruster effect animation using a controlled animation instead of gameTime
  const [animationTime, setAnimationTime] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setAnimationTime((prev) => prev + 16); // Update every ~16ms for smooth animation
    }, 16);

    return () => clearInterval(interval);
  }, []);

  // Animation values are memoized to avoid unnecessary recalculation of trigonometric functions
  const animationValues = useMemo(() => ({
    thrusterOffset: Math.sin(animationTime * 0.01) * 2,
    coreGlow: Math.sin(animationTime * 0.008) * 0.3 + 0.7,
    weaponPulse: Math.sin(animationTime * 0.012) * 0.2 + 0.8
  }), [animationTime]);

  // Simple calculation - no memoization overhead needed
  const healthPercent = player.health / player.maxHealth;

  // Calculated radius based on animated glow effect
  const coreRadius = CORE_BASE_RADIUS + animationValues.coreGlow * CORE_GLOW_MULTIPLIER;

  // Modern angular hull shape with Konva's enhanced context
  const hullPath = (context: any, shape: Konva.Shape) => {
    context.beginPath();
    // Main hull outline - sleek angular design
    context.moveTo(0, -18); // Top point
    context.lineTo(8, -10); // Top right
    context.lineTo(12, -2); // Wing right outer
    context.lineTo(15, 5); // Wing tip right
    context.lineTo(8, 8); // Wing right inner
    context.lineTo(6, 15); // Engine mount right
    context.lineTo(3, 18); // Engine right
    context.lineTo(-3, 18); // Engine left
    context.lineTo(-6, 15); // Engine mount left
    context.lineTo(-8, 8); // Wing left inner
    context.lineTo(-15, 5); // Wing tip left
    context.lineTo(-12, -2); // Wing left outer
    context.lineTo(-8, -10); // Top left
    context.closePath();
    context.fillStrokeShape(shape);
  };

  return (
    <Group x={player.position.x} y={player.position.y}>
      {/* Hull glow background */}
      <Shape
        sceneFunc={hullPath}
        fill="rgba(0, 255, 255, 0.1)"
        stroke="#00FFFF"
        strokeWidth={3}
        opacity={0.6}
        shadowColor="#00FFFF"
        shadowBlur={10}
        shadowOpacity={0.8}
      />
      
      {/* Main hull */}
      <Shape
        sceneFunc={hullPath}
        fill="#1a2332"
        stroke="#4a9eff"
        strokeWidth={1.5}
      />

      {/* Hull panel details */}
      <Rect
        x={-6}
        y={-12}
        width={12}
        height={8}
        fill="#2a3342"
        stroke="#6ab7ff"
        strokeWidth={0.5}
        cornerRadius={1}
      />
      
      {/* Cockpit */}
      <Circle
        x={0}
        y={-8}
        radius={3}
        fill="rgba(0, 255, 255, 0.3)"
        stroke="#00FFFF"
        strokeWidth={1}
      />
      <Circle
        x={0}
        y={-8}
        radius={2}
        fill="rgba(255, 255, 255, 0.8)"
      />

      {/* Weapon pods */}
      <Rect
        x={-14}
        y={0}
        width={3}
        height={8}
        fill="#ff6b35"
        stroke="#ff9500"
        strokeWidth={1}
        opacity={animationValues.weaponPulse}
        cornerRadius={1}
      />
      <Rect
        x={11}
        y={0}
        width={3}
        height={8}
        fill="#ff6b35"
        stroke="#ff9500"
        strokeWidth={1}
        opacity={animationValues.weaponPulse}
        cornerRadius={1}
      />

      {/* Engine thrusters - enhanced */}
      <Rect
        x={-5}
        y={12}
        width={3}
        height={8 + animationValues.thrusterOffset}
        fill="#ff4400"
        cornerRadius={1}
      />
      <Rect
        x={2}
        y={12}
        width={3}
        height={8 + animationValues.thrusterOffset}
        fill="#ff4400"
        cornerRadius={1}
      />

      {/* Enhanced engine glow with multiple layers */}
      <Rect
        x={-5}
        y={18}
        width={3}
        height={12 + animationValues.thrusterOffset * 2}
        fill="#ffaa00"
        opacity={0.8}
        cornerRadius={2}
      />
      <Rect
        x={2}
        y={18}
        width={3}
        height={12 + animationValues.thrusterOffset * 2}
        fill="#ffaa00"
        opacity={0.8}
        cornerRadius={2}
      />
      
      {/* Thruster plasma trail */}
      <Rect
        x={-5}
        y={25}
        width={3}
        height={8 + animationValues.thrusterOffset * 3}
        fill="#00ffff"
        opacity={0.5}
        cornerRadius={3}
      />
      <Rect
        x={2}
        y={25}
        width={3}
        height={8 + animationValues.thrusterOffset * 3}
        fill="#00ffff"
        opacity={0.5}
        cornerRadius={3}
      />

      {/* Energy core - pulsing center */}
      <Circle
        x={0}
        y={2}
        radius={coreRadius}
        fill="rgba(0, 255, 255, 0.9)"
        shadowColor="#00FFFF"
        shadowBlur={8}
        shadowOpacity={animationValues.coreGlow}
      />
      <Circle
        x={0}
        y={2}
        radius={1}
        fill="#ffffff"
      />

      {/* Shield effect when damaged */}
      {player.health < player.maxHealth && (
        <Group>
          <Circle
            x={0}
            y={0}
            radius={SHIELD_RADIUS}
            stroke="rgba(0, 255, 255, 0.4)"
            strokeWidth={2}
            dash={[3, 3]}
            opacity={0.7}
          />
          {/* Modern health indicator */}
          <Rect
            x={-18}
            y={-28}
            width={36}
            height={3}
            fill="rgba(26, 35, 50, 0.8)"
            stroke="#00FFFF"
            strokeWidth={1}
            cornerRadius={2}
          />
          <Rect
            x={-17}
            y={-27}
            width={34 * healthPercent}
            height={1}
            fill={
              player.health > 60
                ? "#00ff7f"
                : player.health > 30
                ? "#ffaa00"
                : "#ff4444"
            }
            cornerRadius={1}
          />
        </Group>
      )}
    </Group>
  );
}
