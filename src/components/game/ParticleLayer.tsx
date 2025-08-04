"use client";

import React, { useMemo } from 'react';
import { Group, Circle, Line } from 'react-konva';
import { useGameStore } from '@/lib/stores/gameStore';

interface ParticleLayerProps {
  width: number;
  height: number;
}

const ParticleLayer: React.FC<ParticleLayerProps> = ({ width, height }) => {
  const shieldParticles = useGameStore((state) => state.shieldParticles || []);

  // Filter only active particles within screen bounds for performance (memoized)
  const activeParticles = useMemo(
    () => shieldParticles.filter(particle => 
      particle.life > 0 && 
      particle.x >= -50 && 
      particle.x <= width + 50 &&
      particle.y >= -50 && 
      particle.y <= height + 50
    ),
    [shieldParticles, width, height]
  );

  return (
    <Group>
      {/* Render shield particles */}
      {activeParticles.map((particle) => {
        // Use pre-calculated alpha for better performance
        const alpha = particle.alpha || 1;
        
        // Choose rendering method based on particle type
        switch (particle.type) {
          case 'shield_impact':
            return (
              <Circle
                key={particle.id}
                x={particle.x}
                y={particle.y}
                radius={particle.size}
                fill={particle.color}
                opacity={alpha}
                listening={false}
              />
            );

          case 'shield_spark':
            // Render sparks as small lines for more dynamic effect
            const sparkLength = particle.size * 2;
            const angle = Math.atan2(particle.vy, particle.vx);
            const endX = particle.x + Math.cos(angle) * sparkLength;
            const endY = particle.y + Math.sin(angle) * sparkLength;
            
            return (
              <Line
                key={particle.id}
                points={[particle.x, particle.y, endX, endY]}
                stroke={particle.color}
                strokeWidth={Math.max(1, particle.size * 0.5)}
                opacity={alpha}
                listening={false}
                lineCap="round"
              />
            );

          case 'shield_ripple':
            // Render ripples as expanding circles
            return (
              <Circle
                key={particle.id}
                x={particle.x}
                y={particle.y}
                radius={particle.size}
                stroke={particle.color}
                strokeWidth={2}
                opacity={alpha * 0.6} // Ripples are more subtle
                listening={false}
              />
            );

          default:
            // Default circular particle
            return (
              <Circle
                key={particle.id}
                x={particle.x}
                y={particle.y}
                radius={particle.size}
                fill={particle.color}
                opacity={alpha}
                listening={false}
              />
            );
        }
      })}
    </Group>
  );
};

export default ParticleLayer;