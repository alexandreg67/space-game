'use client';

import React from 'react';
import { Group, Rect, Circle, RegularPolygon, Shape } from 'react-konva';
import { useGameTime } from '@/lib/stores/gameStore';
import type { EnemyEntity } from '@/types/game';

interface EnemyProps {
  enemy: EnemyEntity;
}

export default function Enemy({ enemy }: EnemyProps) {
  // Use gameTime for animations instead of Date.now() - must be called before early return
  const gameTime = useGameTime();
  
  if (!enemy.active) return null;

  // Enhanced enemy visuals with sophisticated designs and animations
  const renderEnemyByType = () => {
    const baseSize = enemy.size.x / 2;
    const pulse = Math.sin(gameTime * 0.008) * 0.2 + 0.8; // Pulsing effect
    const rotation = (gameTime * 0.05) % 360; // Slow rotation for some elements

    switch (enemy.aiType) {
      case 'straight':
        // Aggressive Interceptor - Angular predator design
        return (
          <Group>
            {/* Outer glow */}
            <RegularPolygon
              x={0}
              y={0}
              sides={3}
              radius={baseSize + 3}
              fill="#ff4444"
              opacity={0.3}
              rotation={180}
              shadowColor="#ff4444"
              shadowBlur={8}
              shadowOpacity={0.6}
            />
            {/* Main hull - aggressive triangle */}
            <Shape
              sceneFunc={(context, shape) => {
                context.beginPath();
                context.moveTo(0, baseSize);
                context.lineTo(-baseSize * 0.8, -baseSize);
                context.lineTo(-baseSize * 0.3, -baseSize * 0.6);
                context.lineTo(0, -baseSize * 0.8);
                context.lineTo(baseSize * 0.3, -baseSize * 0.6);
                context.lineTo(baseSize * 0.8, -baseSize);
                context.closePath();
                context.fillStrokeShape(shape);
              }}
              fill="#cc2222"
              stroke="#ff6666"
              strokeWidth={2}
            />
            {/* Weapon systems */}
            <Circle
              x={0}
              y={-4}
              radius={3}
              fill="#ffaa00"
              opacity={pulse}
            />
            {/* Engine trails */}
            <Group>
              <Rect
                x={-1}
                y={-baseSize + 2}
                width={2}
                height={6}
                fill="#ff8844"
                opacity={0.8}
              />
            </Group>
          </Group>
        );
        
      case 'zigzag':
        // Evasive Fighter - Dynamic diamond with energy wings
        return (
          <Group>
            {/* Energy field */}
            <RegularPolygon
              x={0}
              y={0}
              sides={4}
              radius={baseSize + 4}
              fill="#ff6600"
              opacity={0.2}
              rotation={45 + rotation * 0.3}
              shadowColor="#ff6600"
              shadowBlur={6}
              shadowOpacity={0.4}
            />
            {/* Main diamond body */}
            <RegularPolygon
              x={0}
              y={0}
              sides={4}
              radius={baseSize}
              fill="#dd4400"
              stroke="#ff8800"
              strokeWidth={2}
              rotation={45}
            />
            {/* Energy wings */}
            <Group rotation={rotation * 0.5}>
              <Rect
                x={-baseSize - 3}
                y={-1}
                width={6}
                height={2}
                fill="#ffaa00"
                opacity={pulse}
              />
              <Rect
                x={baseSize - 3}
                y={-1}
                width={6}
                height={2}
                fill="#ffaa00"
                opacity={pulse}
              />
            </Group>
            {/* Core */}
            <Circle
              x={0}
              y={0}
              radius={4}
              fill="#ffffff"
              opacity={0.9}
            />
          </Group>
        );
        
      case 'seeking':
        // Hunter-Killer - Menacing hexagonal predator with scanning array
        return (
          <Group>
            {/* Threat indicator - pulsing outer ring */}
            <Circle
              x={0}
              y={0}
              radius={baseSize + 6}
              stroke="#ff0066"
              strokeWidth={2}
              opacity={pulse * 0.6}
              shadowColor="#ff0066"
              shadowBlur={10}
              shadowOpacity={0.8}
            />
            {/* Scanning array */}
            <Group rotation={rotation * 2}>
              <Shape
                sceneFunc={(context, shape) => {
                  context.beginPath();
                  context.moveTo(0, 0);
                  context.lineTo(0, -baseSize - 8);
                  context.strokeShape(shape);
                }}
                stroke="#ff0088"
                strokeWidth={1}
                opacity={0.7}
              />
            </Group>
            {/* Main hexagonal body */}
            <RegularPolygon
              x={0}
              y={0}
              sides={6}
              radius={baseSize}
              fill="#990033"
              stroke="#ff0066"
              strokeWidth={2}
              shadowColor="#ff0066"
              shadowBlur={4}
              shadowOpacity={0.5}
            />
            {/* Weapon pods */}
            <Group rotation={rotation * 0.3}>
              {Array.from({ length: 6 }).map((_, i) => (
                <Circle
                  key={i}
                  x={Math.cos((i * 60) * Math.PI / 180) * (baseSize - 3)}
                  y={Math.sin((i * 60) * Math.PI / 180) * (baseSize - 3)}
                  radius={2}
                  fill="#ff4488"
                  opacity={pulse}
                />
              ))}
            </Group>
            {/* Central core */}
            <Circle
              x={0}
              y={0}
              radius={5}
              fill="#ffffff"
              opacity={0.9}
            />
          </Group>
        );
        
      case 'circling':
        // Orbital Destroyer - Advanced circular design with rotating defensive systems
        return (
          <Group>
            {/* Orbital field */}
            <Circle
              x={0}
              y={0}
              radius={baseSize + 8}
              stroke="#aa44ff"
              strokeWidth={1}
              opacity={0.3}
              shadowColor="#aa44ff"
              shadowBlur={12}
              shadowOpacity={0.6}
            />
            {/* Main circular hull */}
            <Circle
              x={0}
              y={0}
              radius={baseSize}
              fill="#6600cc"
              stroke="#aa44ff"
              strokeWidth={3}
              shadowColor="#aa44ff"
              shadowBlur={6}
              shadowOpacity={0.7}
            />
            {/* Rotating defense grid */}
            <Group rotation={rotation * 1.5}>
              {Array.from({ length: 4 }).map((_, i) => (
                <Group key={i} rotation={i * 90}>
                  <Rect
                    x={-1}
                    y={-baseSize - 5}
                    width={2}
                    height={8}
                    fill="#ffffff"
                    opacity={0.8}
                  />
                  <Circle
                    x={0}
                    y={-baseSize - 1}
                    radius={2}
                    fill="#ffaa00"
                    opacity={pulse}
                  />
                </Group>
              ))}
            </Group>
            {/* Counter-rotating inner elements */}
            <Group rotation={-rotation * 0.8}>
              {Array.from({ length: 3 }).map((_, i) => (
                <Circle
                  key={i}
                  x={Math.cos((i * 120) * Math.PI / 180) * (baseSize * 0.6)}
                  y={Math.sin((i * 120) * Math.PI / 180) * (baseSize * 0.6)}
                  radius={2}
                  fill="#ff6600"
                  opacity={pulse}
                />
              ))}
            </Group>
            {/* Central command core */}
            <Circle
              x={0}
              y={0}
              radius={6}
              fill="#ffffff"
              opacity={0.9}
            />
          </Group>
        );
        
      default:
        return (
          <Group>
            <Rect
              x={-enemy.size.x / 2}
              y={-enemy.size.y / 2}
              width={enemy.size.x}
              height={enemy.size.y}
              fill="#ff0000"
              stroke="#ffffff"
              strokeWidth={1}
              shadowColor="#ff0000"
              shadowBlur={4}
              shadowOpacity={0.6}
            />
          </Group>
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
      
      {/* Enhanced health indicator for damaged enemies */}
      {enemy.health < 30 && (
        <Group>
          {/* Health bar background with glow */}
          <Rect
            x={-enemy.size.x / 2}
            y={-enemy.size.y / 2 - 10}
            width={enemy.size.x}
            height={4}
            fill="#000000"
            stroke="#ffffff"
            strokeWidth={1}
            shadowColor="#ffffff"
            shadowBlur={2}
            shadowOpacity={0.3}
            opacity={0.8}
          />
          {/* Health bar fill with gradient effect */}
          <Rect
            x={-enemy.size.x / 2}
            y={-enemy.size.y / 2 - 10}
            width={enemy.size.x * (enemy.health / 30)}
            height={4}
            fill={enemy.health > 20 ? "#ffaa00" : enemy.health > 10 ? "#ff6600" : "#ff0000"}
            shadowColor={enemy.health > 20 ? "#ffaa00" : "#ff0000"}
            shadowBlur={3}
            shadowOpacity={0.6}
          />
        </Group>
      )}
      
      {/* Enhanced damage effects */}
      {enemy.health < 30 && (
        <Group>
          {/* Damage flash effect */}
          <Circle
            x={0}
            y={0}
            radius={enemy.size.x}
            fill="#ffffff"
            opacity={0.4 * Math.abs(Math.sin(gameTime * 0.025))}
          />
          {/* Sparks/damage particles */}
          {Array.from({ length: 3 }).map((_, i) => (
            <Circle
              key={i}
              x={Math.cos((i * 120 + gameTime * 0.1) * Math.PI / 180) * (enemy.size.x / 2 + 2)}
              y={Math.sin((i * 120 + gameTime * 0.1) * Math.PI / 180) * (enemy.size.x / 2 + 2)}
              radius={1}
              fill="#ffaa00"
              opacity={0.8 * Math.sin(gameTime * 0.02 + i)}
            />
          ))}
        </Group>
      )}
    </Group>
  );
}