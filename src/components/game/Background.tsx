"use client";

import React from "react";
import { Rect, Group } from "react-konva";

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

// Generate static stars to avoid re-renders
const generateStars = (count: number): Star[] => {
  const starArray: Star[] = [];
  for (let i = 0; i < count; i++) {
    starArray.push({
      x: Math.random() * 800, // Fixed width
      y: Math.random() * 600, // Fixed height
      size: Math.random() * 2 + 1,
      opacity: Math.random() * 0.8 + 0.2,
    });
  }
  return starArray;
};

const STATIC_STARS = generateStars(200);

export default function Background({ width, height }: BackgroundProps) {
  // Static background for now to avoid re-renders

  return (
    <Group>
      {/* Space background - black with gradient */}
      <Rect x={0} y={0} width={width} height={height} fill="black" />

      {/* Stars */}
      {STATIC_STARS.map((star, index) => (
        <Rect
          key={`star-${index}`}
          x={star.x}
          y={star.y}
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
