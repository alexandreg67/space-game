"use client";

import React from "react";
import { Group, Rect } from "react-konva";
import ParallaxLayer from "./ParallaxLayer";

interface EnhancedBackgroundProps {
  width: number;
  height: number;
  offset: number;
  enableEnhanced?: boolean;
}

const EnhancedBackground = React.memo(function EnhancedBackground({ 
  width, 
  height, 
  offset,
  enableEnhanced = true 
}: EnhancedBackgroundProps) {
  
  if (!enableEnhanced) {
    // Fall back to simple background for performance testing
    return (
      <Group>
        <Rect x={0} y={0} width={width} height={height} fill="black" />
      </Group>
    );
  }

  return (
    <Group>
      {/* Base space background */}
      <Rect x={0} y={0} width={width} height={height} fill="#000005" />
      
      {/* Deep Space Layer - Slowest movement (0.1x) */}
      <ParallaxLayer
        width={width}
        height={height}
        offset={offset}
        speed={0.1}
        starCount={50}
        starSizeRange={[0.5, 2]}
        includeNebulae={true}
        nebulaCount={2}
        layerType="deep"
      />
      
      {/* Mid Space Layer - Slow movement (0.3x) */}
      <ParallaxLayer
        width={width}
        height={height}
        offset={offset}
        speed={0.3}
        starCount={80}
        starSizeRange={[1, 2.5]}
        includeNebulae={true}
        nebulaCount={3}
        layerType="mid"
      />
      
      {/* Near Space Layer - Medium movement (0.7x) */}
      <ParallaxLayer
        width={width}
        height={height}
        offset={offset}
        speed={0.7}
        starCount={120}
        starSizeRange={[1.5, 3]}
        includeNebulae={false}
        layerType="near"
      />
      
      {/* Close Stars Layer - Fast movement (1.2x) */}
      <ParallaxLayer
        width={width}
        height={height}
        offset={offset}
        speed={1.2}
        starCount={60}
        starSizeRange={[2, 4]}
        includeNebulae={false}
        layerType="near"
      />
    </Group>
  );
});

export default EnhancedBackground;