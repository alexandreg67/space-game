'use client';

import React, { useMemo } from 'react';
import { Rect, Group } from 'react-konva';
import { useGameStore } from '@/lib/stores/gameStore';

interface BackgroundProps {
  width: number;
  height: number;
}

interface Star {
  x: number;
  y: number;
  size: number;
  opacity: number;
}

export default function Background({ width, height }: BackgroundProps) {
  const { backgroundOffset } = useGameStore();

  // Generate stars once and memoize them for performance
  const stars = useMemo((): Star[] => {
    const starArray: Star[] = [];
    for (let i = 0; i < 200; i++) {
      starArray.push({
        x: Math.random() * width,
        y: Math.random() * height * 2, // Double height for scrolling
        size: Math.random() * 2 + 1,
        opacity: Math.random() * 0.8 + 0.2,
      });
    }
    return starArray;
  }, [width, height]);

  return (
    <Group>
      {/* Space background - black with gradient */}
      <Rect
        x={0}
        y={0}
        width={width}
        height={height}
        fill="black"
      />
      
      {/* Stars */}
      {stars.map((star, index) => (
        <Rect
          key={`star-${index}`}
          x={star.x}
          y={(star.y - backgroundOffset) % (height * 2) - height}
          width={star.size}
          height={star.size}
          fill="white"
          opacity={star.opacity}
        />
      ))}
      
      {/* Optional nebula effect */}
      <Rect
        x={0}
        y={0}
        width={width}
        height={height}
        fill="radial-gradient(circle, rgba(25,25,112,0.3) 0%, rgba(0,0,0,0) 70%)"
        opacity={0.5}
      />
    </Group>
  );
}