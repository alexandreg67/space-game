"use client";

import React, { useMemo } from "react";
import { Group, Rect } from "react-konva";
import { useGameStore } from "@/lib/stores/gameStore";

interface ScreenEffectsProps {
  width: number;
  height: number;
}

export default function ScreenEffects({ width, height }: ScreenEffectsProps) {
  const screenEffects = useGameStore((state) => state.screenEffects);
  
  // Calculate screen effects in real-time during render (no state updates)
  const { shakeOffset, activeFlash, currentTime } = useMemo(() => {
    const currentTime = Date.now();
    
    // Calculate camera shake offset
    const activeShake = screenEffects.find(
      (effect) => effect.type === 'shake' && 
      currentTime - effect.timestamp < effect.duration
    );

    let shakeOffset = { x: 0, y: 0 };
    if (activeShake) {
      const progress = (currentTime - activeShake.timestamp) / activeShake.duration;
      const intensity = activeShake.intensity * (1 - progress); // Fade out over time
      const amplitude = intensity * 8; // Max 8px shake

      // Create smooth shake using sine waves at different frequencies
      const time = currentTime * 0.01;
      const shakeX = Math.sin(time * 2.3) * amplitude * 0.7 + Math.sin(time * 4.1) * amplitude * 0.3;
      const shakeY = Math.cos(time * 2.1) * amplitude * 0.8 + Math.cos(time * 3.7) * amplitude * 0.2;

      shakeOffset = { x: shakeX, y: shakeY };
    }

    // Get current flash effect
    const activeFlash = screenEffects.find(
      (effect) => effect.type === 'flash' && 
      currentTime - effect.timestamp < effect.duration
    );

    return { shakeOffset, activeFlash, currentTime };
  }, [screenEffects]);

  return (
    <Group x={shakeOffset.x} y={shakeOffset.y}>
      {/* Render flash effect */}
      {activeFlash && (
        <FlashEffect
          width={width}
          height={height}
          effect={activeFlash}
          currentTime={currentTime}
        />
      )}
    </Group>
  );
}

interface FlashEffectProps {
  width: number;
  height: number;
  effect: any; // ScreenEffect
  currentTime: number;
}

function FlashEffect({ width, height, effect, currentTime }: FlashEffectProps) {
  const progress = (currentTime - effect.timestamp) / effect.duration;
  
  // Flash intensity peaks quickly then fades
  let flashIntensity: number;
  if (progress < 0.2) {
    // Quick rise to peak
    flashIntensity = effect.intensity * (progress / 0.2);
  } else {
    // Exponential decay
    const decayProgress = (progress - 0.2) / 0.8;
    flashIntensity = effect.intensity * Math.pow(1 - decayProgress, 2);
  }

  // Cap opacity for accessibility
  const opacity = Math.min(flashIntensity, 0.6);

  if (opacity <= 0.01) return null;

  return (
    <Rect
      x={0}
      y={0}
      width={width}
      height={height}
      fill={effect.color || '#ffffff'}
      opacity={opacity}
      listening={false}
    />
  );
}