'use client';

import React from 'react';
import { Group, Rect, RegularPolygon } from 'react-konva';
import { useGameTime } from '@/lib/stores/gameStore';
import type { PlayerEntity } from '@/types/game';

interface PlayerProps {
  player: PlayerEntity;
}

export default function Player({ player }: PlayerProps) {
  // Player movement and shooting are now handled by the main game loop
  // This component only renders the player visual representation

  // Thruster effect animation using gameTime instead of Date.now()
  const gameTime = useGameTime();
  const thrusterOffset = Math.sin(gameTime * 0.01) * 2;

  return (
    <Group
      x={player.position.x}
      y={player.position.y}
    >
      {/* Main ship body */}
      <RegularPolygon
        x={0}
        y={0}
        sides={3}
        radius={player.size.x / 2}
        fill="#00aaff"
        stroke="#ffffff"
        strokeWidth={1}
        rotation={-90} // Point upward
      />
      
      {/* Ship core */}
      <Rect
        x={-4}
        y={-6}
        width={8}
        height={12}
        fill="#ffffff"
        cornerRadius={2}
      />
      
      {/* Engine thrusters */}
      <Rect
        x={-8}
        y={8}
        width={4}
        height={6 + thrusterOffset}
        fill="#ff4400"
        cornerRadius={2}
      />
      <Rect
        x={4}
        y={8}
        width={4}
        height={6 + thrusterOffset}
        fill="#ff4400"
        cornerRadius={2}
      />
      
      {/* Engine glow effect */}
      <Rect
        x={-8}
        y={14}
        width={4}
        height={8 + thrusterOffset * 2}
        fill="#ffaa00"
        opacity={0.7}
        cornerRadius={4}
      />
      <Rect
        x={4}
        y={14}
        width={4}
        height={8 + thrusterOffset * 2}
        fill="#ffaa00"
        opacity={0.7}
        cornerRadius={4}
      />

      {/* Health indicator */}
      {player.health < player.maxHealth && (
        <Group>
          {/* Health bar background */}
          <Rect
            x={-15}
            y={-25}
            width={30}
            height={4}
            fill="#333333"
            stroke="#ffffff"
            strokeWidth={1}
            cornerRadius={2}
          />
          {/* Health bar fill */}
          <Rect
            x={-15}
            y={-25}
            width={30 * (player.health / player.maxHealth)}
            height={4}
            fill={player.health > 60 ? "#00ff00" : player.health > 30 ? "#ffaa00" : "#ff0000"}
            cornerRadius={2}
          />
        </Group>
      )}
    </Group>
  );
}