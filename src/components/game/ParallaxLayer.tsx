"use client";

import React, { useMemo, useRef, useEffect } from "react";
import { Group, Rect, Circle } from "react-konva";

export interface StarData {
  x: number;
  y: number;
  size: number;
  opacity: number;
  twinkle?: number;
  color?: string;
}

export interface NebulaData {
  x: number;
  y: number;
  width: number;
  height: number;
  color: string;
  opacity: number;
}

interface ParallaxLayerProps {
  width: number;
  height: number;
  offset: number;
  speed: number;
  starCount: number;
  starSizeRange: [number, number];
  includeNebulae?: boolean;
  nebulaCount?: number;
  layerType: 'deep' | 'mid' | 'near';
}

const generateStars = (
  count: number, 
  width: number, 
  height: number, 
  sizeRange: [number, number],
  layerType: 'deep' | 'mid' | 'near'
): StarData[] => {
  const stars: StarData[] = [];
  const extendedWidth = width + 200; // Extra width for seamless scrolling
  
  for (let i = 0; i < count; i++) {
    const size = Math.random() * (sizeRange[1] - sizeRange[0]) + sizeRange[0];
    
    // Different star properties based on layer
    let opacity: number;
    let color: string;
    
    switch (layerType) {
      case 'deep':
        opacity = Math.random() * 0.3 + 0.1; // Very dim
        color = Math.random() > 0.7 ? '#4169E1' : '#FFFFFF'; // Occasional blue giants
        break;
      case 'mid':
        opacity = Math.random() * 0.5 + 0.3; // Medium brightness
        color = Math.random() > 0.8 ? '#FFD700' : '#FFFFFF'; // Occasional yellow stars
        break;
      case 'near':
        opacity = Math.random() * 0.4 + 0.6; // Bright
        color = '#FFFFFF';
        break;
    }
    
    stars.push({
      x: Math.random() * extendedWidth,
      y: Math.random() * height,
      size,
      opacity,
      twinkle: Math.random() * 2 + 1, // Twinkling speed
      color
    });
  }
  
  return stars;
};

const generateNebulae = (
  count: number, 
  width: number, 
  height: number,
  layerType: 'deep' | 'mid' | 'near'
): NebulaData[] => {
  const nebulae: NebulaData[] = [];
  const extendedWidth = width + 200;
  
  const colors = {
    deep: ['#1e0a2e', '#2d1b69', '#4a0e4e'],
    mid: ['#8b0a50', '#4a3c95', '#2e5984'],
    near: ['#654321', '#2c3e50', '#34495e']
  };
  
  for (let i = 0; i < count; i++) {
    const colorOptions = colors[layerType];
    const color = colorOptions[Math.floor(Math.random() * colorOptions.length)];
    
    nebulae.push({
      x: Math.random() * extendedWidth,
      y: Math.random() * height,
      width: Math.random() * 300 + 100,
      height: Math.random() * 200 + 80,
      color,
      opacity: Math.random() * 0.3 + 0.1
    });
  }
  
  return nebulae;
};

const ParallaxLayer = React.memo(function ParallaxLayer({
  width,
  height,
  offset,
  speed,
  starCount,
  starSizeRange,
  includeNebulae = false,
  nebulaCount = 3,
  layerType
}: ParallaxLayerProps) {
  const twinklePhaseRef = useRef<number>(Math.random() * 1000);
  
  // Update twinkle phase for animation
  useEffect(() => {
    const interval = setInterval(() => {
      twinklePhaseRef.current += 16; // ~60fps
    }, 16);
    
    return () => clearInterval(interval);
  }, []);
  
  const stars = useMemo(() => 
    generateStars(starCount, width, height, starSizeRange, layerType), 
    [starCount, width, height, starSizeRange, layerType]
  );
  
  const nebulae = useMemo(() => 
    includeNebulae ? generateNebulae(nebulaCount, width, height, layerType) : [],
    [includeNebulae, nebulaCount, width, height, layerType]
  );
  
  // Calculate the repeating offset for seamless scrolling
  const extendedWidth = width + 200;
  const scrollOffset = ((offset * speed) % extendedWidth + extendedWidth) % extendedWidth;
  
  return (
    <Group>
      {/* Render nebulae first (background) */}
      {nebulae.map((nebula, index) => {
        const x = nebula.x - scrollOffset;
        const repeatedX = x < -nebula.width ? x + extendedWidth : x;
        const repeatedX2 = x > width ? x - extendedWidth : undefined;
        
        return (
          <React.Fragment key={`nebula-${index}`}>
            <Rect
              x={repeatedX}
              y={nebula.y}
              width={nebula.width}
              height={nebula.height}
              fill={nebula.color}
              opacity={nebula.opacity}
              cornerRadius={50}
            />
            {repeatedX2 !== undefined && (
              <Rect
                x={repeatedX2}
                y={nebula.y}
                width={nebula.width}
                height={nebula.height}
                fill={nebula.color}
                opacity={nebula.opacity}
                cornerRadius={50}
              />
            )}
          </React.Fragment>
        );
      })}
      
      {/* Render stars */}
      {stars.map((star, index) => {
        const x = star.x - scrollOffset;
        const repeatedX = x < -star.size ? x + extendedWidth : x;
        const repeatedX2 = x > width ? x - extendedWidth : undefined;
        
        // Optimized twinkling effect using animation frame time
        const twinkleTime = (twinklePhaseRef.current + index * 100) * 0.001;
        const twinkleOffset = Math.sin(twinkleTime * (star.twinkle || 1)) * 0.2;
        const currentOpacity = Math.max(0.1, (star.opacity || 1) + twinkleOffset);
        
        return (
          <React.Fragment key={`star-${index}`}>
            {star.size > 1.5 ? (
              <Circle
                x={repeatedX + star.size/2}
                y={star.y + star.size/2}
                radius={star.size/2}
                fill={star.color || 'white'}
                opacity={currentOpacity}
              />
            ) : (
              <Rect
                x={repeatedX}
                y={star.y}
                width={star.size}
                height={star.size}
                fill={star.color || 'white'}
                opacity={currentOpacity}
              />
            )}
            
            {/* Render second copy for seamless scrolling */}
            {repeatedX2 !== undefined && (
              <>
                {star.size > 1.5 ? (
                  <Circle
                    x={repeatedX2 + star.size/2}
                    y={star.y + star.size/2}
                    radius={star.size/2}
                    fill={star.color || 'white'}
                    opacity={currentOpacity}
                  />
                ) : (
                  <Rect
                    x={repeatedX2}
                    y={star.y}
                    width={star.size}
                    height={star.size}
                    fill={star.color || 'white'}
                    opacity={currentOpacity}
                  />
                )}
              </>
            )}
          </React.Fragment>
        );
      })}
    </Group>
  );
});

export default ParallaxLayer;