'use client';

import React from 'react';
import { Group, Rect, Circle, RegularPolygon } from 'react-konva';
import { useGameTime } from '@/lib/stores/gameStore';
import type { EnemyEntity } from '@/types/game';

interface EnemyProps {
  enemy: EnemyEntity;
}

export default function Enemy({ enemy }: EnemyProps) {
  // Use gameTime for animations instead of Date.now() - must be called before early return
  const gameTime = useGameTime();
  
  if (!enemy.active) return null;

  // Different enemy visuals based on AI type
  const renderEnemyByType = () => {
    switch (enemy.aiType) {
      case 'straight':
        // Basic triangle enemy
        return (
          <Group>
            <RegularPolygon
              x={0}
              y={0}
              sides={3}
              radius={enemy.size.x / 2}
              fill="#ff0000"
              stroke="#ffaa00"
              strokeWidth={1}
              rotation={90} // Point downward
            />
            <Circle
              x={0}
              y={0}
              radius={4}
              fill="#ffffff"
            />
          </Group>
        );
        
      case 'zigzag':
        // Diamond-shaped enemy
        return (
          <Group>
            <RegularPolygon
              x={0}
              y={0}
              sides={4}
              radius={enemy.size.x / 2}
              fill="#ff4400"
              stroke="#ff8800"
              strokeWidth={1}
              rotation={45}
            />
            <Rect
              x={-2}
              y={-2}
              width={4}
              height={4}
              fill="#ffffff"
            />
          </Group>
        );
        
      case 'seeking':
        // Hexagonal enemy
        return (
          <Group>
            <RegularPolygon
              x={0}
              y={0}
              sides={6}
              radius={enemy.size.x / 2}
              fill="#aa0044"
              stroke="#ff0088"
              strokeWidth={1}
            />
            <Circle
              x={0}
              y={0}
              radius={3}
              fill="#ffffff"
            />
            {/* Targeting indicator */}
            <Circle
              x={0}
              y={0}
              radius={enemy.size.x / 2 + 2}
              stroke="#ff0088"
              strokeWidth={1}
              opacity={0.5}
            />
          </Group>
        );
        
      case 'circling':
        // Circular enemy with rotating elements
        return (
          <Group>
            <Circle
              x={0}
              y={0}
              radius={enemy.size.x / 2}
              fill="#8800ff"
              stroke="#aa44ff"
              strokeWidth={1}
            />
            <Circle
              x={0}
              y={0}
              radius={4}
              fill="#ffffff"
            />
            {/* Rotating parts */}
            <Group rotation={(gameTime * 0.1) % 360}>
              <Rect
                x={-1}
                y={-enemy.size.x / 2 - 3}
                width={2}
                height={6}
                fill="#ffffff"
              />
              <Rect
                x={-enemy.size.x / 2 - 3}
                y={-1}
                width={6}
                height={2}
                fill="#ffffff"
              />
            </Group>
          </Group>
        );
        
      default:
        return (
          <Rect
            x={-enemy.size.x / 2}
            y={-enemy.size.y / 2}
            width={enemy.size.x}
            height={enemy.size.y}
            fill="#ff0000"
            stroke="#ffffff"
            strokeWidth={1}
          />
        );
    }
  };

  return (
    <Group
      x={enemy.position.x}
      y={enemy.position.y}
      rotation={enemy.rotation}
    >
      {renderEnemyByType()}
      
      {/* Health indicator for damaged enemies */}
      {enemy.health < 30 && (
        <Group>
          <Rect
            x={-enemy.size.x / 2}
            y={-enemy.size.y / 2 - 8}
            width={enemy.size.x}
            height={3}
            fill="#333333"
            stroke="#ffffff"
            strokeWidth={1}
          />
          <Rect
            x={-enemy.size.x / 2}
            y={-enemy.size.y / 2 - 8}
            width={enemy.size.x * (enemy.health / 30)}
            height={3}
            fill={enemy.health > 20 ? "#ffaa00" : "#ff0000"}
          />
        </Group>
      )}
      
      {/* Damage flash effect */}
      {enemy.health < 30 && (
        <Circle
          x={0}
          y={0}
          radius={enemy.size.x}
          fill="#ffffff"
          opacity={0.3 * Math.sin(gameTime * 0.02)}
        />
      )}
    </Group>
  );
}