'use client';

import React from 'react';
import { Group, Rect, Circle } from 'react-konva';
import type { BulletEntity } from '@/types/game';

interface BulletProps {
  bullet: BulletEntity;
}

export default function Bullet({ bullet }: BulletProps) {
  if (!bullet.active) return null;

  // Different bullet visuals based on owner
  const isPlayerBullet = bullet.owner === 'player';
  
  return (
    <Group
      x={bullet.position.x}
      y={bullet.position.y}
      rotation={bullet.rotation}
    >
      {isPlayerBullet ? (
        // Player bullet - blue laser
        <Group>
          <Rect
            x={-2}
            y={-8}
            width={4}
            height={16}
            fill="#00aaff"
            cornerRadius={2}
          />
          <Rect
            x={-1}
            y={-8}
            width={2}
            height={16}
            fill="#ffffff"
            cornerRadius={1}
          />
          {/* Glow effect */}
          <Rect
            x={-3}
            y={-8}
            width={6}
            height={16}
            fill="#00aaff"
            opacity={0.3}
            cornerRadius={3}
          />
        </Group>
      ) : (
        // Enemy bullet - red plasma
        <Group>
          <Circle
            x={0}
            y={0}
            radius={4}
            fill="#ff0000"
          />
          <Circle
            x={0}
            y={0}
            radius={2}
            fill="#ffaa00"
          />
          {/* Glow effect */}
          <Circle
            x={0}
            y={0}
            radius={6}
            fill="#ff0000"
            opacity={0.3}
          />
        </Group>
      )}
    </Group>
  );
}