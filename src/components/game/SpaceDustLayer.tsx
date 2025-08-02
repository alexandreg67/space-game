"use client";

import React, { useRef, useEffect, useState, useCallback } from "react";
import { Group, Circle, Line } from "react-konva";
import { getParticleFromPool, releaseParticleToPool, type Particle } from "@/lib/game/utils/objectPool";

interface SpaceDustParticle extends Particle {
  id: string;
  active: boolean;
  type: 'dust' | 'streak' | 'spark';
  speedMultiplier: number;
}

interface SpaceDustLayerProps {
  width: number;
  height: number;
  offset: number;
  particleCount?: number;
  speed?: number;
}

const SpaceDustLayer = React.memo(function SpaceDustLayer({
  width,
  height,
  offset,
  particleCount = 100,
  speed = 1.5
}: SpaceDustLayerProps) {
  const [particles, setParticles] = useState<SpaceDustParticle[]>([]);
  const lastOffsetRef = useRef<number>(offset);
  const particlesRef = useRef<SpaceDustParticle[]>([]);

  // Initialize particles
  const initializeParticles = useCallback(() => {
    const newParticles: SpaceDustParticle[] = [];
    
    for (let i = 0; i < particleCount; i++) {
      const baseParticle = getParticleFromPool();
      const type = Math.random() < 0.7 ? 'dust' : (Math.random() < 0.8 ? 'streak' : 'spark');
      
      const particle: SpaceDustParticle = {
        ...baseParticle,
        id: `space-dust-${i}`,
        active: true,
        type,
        x: Math.random() * width, // Spawn across the width
        y: -Math.random() * 200 - 50, // Spawn above the screen
        vx: (Math.random() - 0.5) * 10, // Slight horizontal drift
        vy: 50 + Math.random() * 100, // Base downward movement
        size: type === 'dust' ? Math.random() * 1.5 + 0.5 : 
              type === 'streak' ? Math.random() * 2 + 1 : 
              Math.random() * 3 + 1,
        color: type === 'dust' ? '#ffffff' : 
               type === 'streak' ? '#cccccc' : 
               '#ffff88',
        alpha: type === 'dust' ? Math.random() * 0.4 + 0.2 : 
               type === 'streak' ? Math.random() * 0.6 + 0.3 : 
               Math.random() * 0.8 + 0.2,
        life: 1000,
        maxLife: 1000,
        decay: 0.001,
        speedMultiplier: Math.random() * 0.5 + 0.8
      };
      
      newParticles.push(particle);
    }
    
    particlesRef.current = newParticles;
    setParticles([...newParticles]);
  }, [particleCount, width]);

  // Update particles based on offset change
  const updateParticles = useCallback((_deltaOffset: number) => {
    const updatedParticles = particlesRef.current.map(particle => {
      if (!particle.active) return particle;
      
      // Calculate movement for space travel effect (top to bottom)
      const movementSpeed = speed * particle.speedMultiplier;
      
      // Update position - vertical movement with slight horizontal drift
      let newX = particle.x + particle.vx * 0.016; // Horizontal drift
      let newY = particle.y + particle.vy * movementSpeed * 0.016; // Downward movement
      
      // Handle horizontal boundaries (keep particles within screen width)
      if (newX < 0) {
        newX = width;
      } else if (newX > width) {
        newX = 0;
      }
      
      // Handle vertical wrapping (respawn at top when reaching bottom)
      if (newY > height + 50) {
        newY = -Math.random() * 200 - 50; // Respawn above screen
        newX = Math.random() * width; // Random horizontal position
      }
      
      // Update particle life and alpha
      const newLife = particle.life - 16; // Assume ~60fps
      const newAlpha = particle.alpha * (1 - particle.decay);
      
      // Reset particle if life is depleted
      if (newLife <= 0 || newAlpha < 0.1) {
        return {
          ...particle,
          x: Math.random() * width,
          y: -Math.random() * 200 - 50, // Respawn above screen
          life: particle.maxLife,
          alpha: particle.type === 'dust' ? Math.random() * 0.4 + 0.2 : 
                 particle.type === 'streak' ? Math.random() * 0.6 + 0.3 : 
                 Math.random() * 0.8 + 0.2
        };
      }
      
      return {
        ...particle,
        x: newX,
        y: newY,
        life: newLife,
        alpha: Math.max(0.1, newAlpha)
      };
    });
    
    particlesRef.current = updatedParticles;
    setParticles([...updatedParticles]);
  }, [width, height, speed]);

  // Initialize particles on mount
  useEffect(() => {
    initializeParticles();
    
    // Cleanup function to release particles back to pool
    return () => {
      particlesRef.current.forEach(particle => {
        releaseParticleToPool(particle);
      });
    };
  }, [initializeParticles]);

  // Update particles when offset changes
  useEffect(() => {
    const deltaOffset = offset - lastOffsetRef.current;
    if (Math.abs(deltaOffset) > 0.1) { // Only update if significant change
      updateParticles(deltaOffset);
      lastOffsetRef.current = offset;
    }
  }, [offset, updateParticles]);

  return (
    <Group>
      {particles.map((particle) => {
        if (!particle.active || particle.y > height + 100 || particle.y < -200) {
          return null;
        }
        
        switch (particle.type) {
          case 'dust':
            return (
              <Circle
                key={particle.id}
                x={particle.x}
                y={particle.y}
                radius={particle.size}
                fill={particle.color}
                opacity={particle.alpha}
              />
            );
            
          case 'streak':
            return (
              <Line
                key={particle.id}
                points={[
                  particle.x, particle.y,
                  particle.x, particle.y - particle.size * 8
                ]}
                stroke={particle.color}
                strokeWidth={particle.size * 0.5}
                opacity={particle.alpha}
                lineCap="round"
              />
            );
            
          case 'spark':
            return (
              <Circle
                key={particle.id}
                x={particle.x}
                y={particle.y}
                radius={particle.size}
                fill={particle.color}
                opacity={particle.alpha}
                shadowColor={particle.color}
                shadowBlur={particle.size * 2}
              />
            );
            
          default:
            return null;
        }
      })}
    </Group>
  );
});

export default SpaceDustLayer;