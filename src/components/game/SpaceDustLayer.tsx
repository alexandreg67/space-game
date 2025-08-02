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
        x: Math.random() * (width + 200), // Extended width for seamless scrolling
        y: Math.random() * height,
        vx: -50 - Math.random() * 100, // Base leftward movement
        vy: (Math.random() - 0.5) * 20, // Slight vertical movement
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
  }, [particleCount, width, height]);

  // Update particles based on offset change
  const updateParticles = useCallback((deltaOffset: number) => {
    const updatedParticles = particlesRef.current.map(particle => {
      if (!particle.active) return particle;
      
      // Calculate movement based on offset change and particle speed
      const movementX = deltaOffset * speed * particle.speedMultiplier;
      
      // Update position
      let newX = particle.x - movementX;
      const newY = particle.y + particle.vy * 0.016; // Assume ~60fps
      
      // Handle horizontal wrapping for seamless scrolling
      const extendedWidth = width + 200;
      if (newX < -50) {
        newX = extendedWidth;
      } else if (newX > extendedWidth) {
        newX = -50;
      }
      
      // Handle vertical wrapping
      let wrappedY = newY;
      if (newY < -10) {
        wrappedY = height + 10;
      } else if (newY > height + 10) {
        wrappedY = -10;
      }
      
      // Update particle life and alpha
      const newLife = particle.life - 16; // Assume ~60fps
      const newAlpha = particle.alpha * (1 - particle.decay);
      
      // Reset particle if life is depleted
      if (newLife <= 0 || newAlpha < 0.1) {
        return {
          ...particle,
          x: width + Math.random() * 100,
          y: Math.random() * height,
          life: particle.maxLife,
          alpha: particle.type === 'dust' ? Math.random() * 0.4 + 0.2 : 
                 particle.type === 'streak' ? Math.random() * 0.6 + 0.3 : 
                 Math.random() * 0.8 + 0.2
        };
      }
      
      return {
        ...particle,
        x: newX,
        y: wrappedY,
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
        if (!particle.active || particle.x < -50 || particle.x > width + 50) {
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
                  particle.x - particle.size * 8, particle.y
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