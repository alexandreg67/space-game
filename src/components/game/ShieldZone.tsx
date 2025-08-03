"use client";

import React, { useEffect, useState } from "react";
import { Line, Rect, Group, Circle } from "react-konva";
import { useGameStore } from "@/lib/stores/gameStore";

// Shield visual constants
const SHIELD_DOWN_BASE_OPACITY = 0.8;
const SHIELD_PULSE_FREQUENCY = 3;
const SHIELD_PULSE_AMPLITUDE = 0.3;
const SHIELD_ACTIVE_BASE_OPACITY = 0.6;
const SHIELD_INACTIVE_OPACITY = 0.2;

interface ShieldZoneProps {
  width: number;
  height: number;
  shieldHeight: number;
}

export default function ShieldZone({ width, height, shieldHeight }: ShieldZoneProps) {
  const player = useGameStore((state) => state.player);
  const [pulsePhase, setPulsePhase] = useState(0);
  const [energyPhase, setEnergyPhase] = useState(0);

  // Animation timers
  useEffect(() => {
    const interval = setInterval(() => {
      setPulsePhase(prev => (prev + 0.08) % (Math.PI * 2));
      setEnergyPhase(prev => (prev + 0.03) % (Math.PI * 2));
    }, 16); // ~60fps

    return () => clearInterval(interval);
  }, []);

  if (!player) return null;

  const shieldY = height - shieldHeight;
  const shieldActive = player.shieldActive && player.shieldHealth > 0;
  const shieldPercentage = player.shieldHealth / player.maxShieldHealth;
  const isShieldDown = player.shieldDown;

  // Shield color based on health and state
  const getShieldColor = () => {
    if (isShieldDown) return "#ff0000"; // Red when shield is down
    if (!shieldActive) return "#666666";
    if (shieldPercentage > 0.6) return "#00ffff";
    if (shieldPercentage > 0.3) return "#ffff00";
    return "#ff4400";
  };

  const shieldColor = getShieldColor();
  
  // Enhanced shield opacity with pulsing effects
  const baseOpacity = isShieldDown 
    ? SHIELD_DOWN_BASE_OPACITY + Math.sin(pulsePhase * SHIELD_PULSE_FREQUENCY) * SHIELD_PULSE_AMPLITUDE // Intense pulsing when down
    : shieldActive 
    ? SHIELD_ACTIVE_BASE_OPACITY + (shieldPercentage * 0.4) 
    : SHIELD_INACTIVE_OPACITY;
  const pulseIntensity = (shieldPercentage < 0.3 && !isShieldDown) ? Math.sin(pulsePhase) * 0.3 : 0;
  const shieldOpacity = Math.max(0.1, baseOpacity + pulseIntensity);

  // Dynamic warning effects
  const isLowShield = shieldPercentage < 0.25 && shieldPercentage > 0;
  const isCritical = shieldPercentage < 0.1 && shieldPercentage > 0;
  const warningOpacity = isShieldDown ? 0.6 + Math.sin(pulsePhase * 4) * 0.4 : // Strong warning when down
                         isLowShield ? 0.3 + Math.sin(pulsePhase * 2) * 0.2 : 0.1;
  
  // Energy flow effects
  const energyFlow = Math.sin(energyPhase) * 0.5 + 0.5; // 0-1 range

  return (
    <Group>
      {/* Shield protection zone background */}
      <Rect
        x={0}
        y={shieldY}
        width={width}
        height={shieldHeight}
        fill={isShieldDown ? "#ff0000" : isLowShield ? "#ff4400" : "#00ffff"}
        opacity={isShieldDown ? warningOpacity : shieldActive ? warningOpacity : 0.05}
      />

      {/* Main shield line with enhanced effects */}
      <Line
        points={[0, shieldY, width, shieldY]}
        stroke={shieldColor}
        strokeWidth={isShieldDown ? 6 + Math.sin(pulsePhase * 2) * 2 : // Thick pulsing line when down
                     shieldActive ? 4 + (energyFlow * 2) : 2}
        opacity={shieldOpacity}
        dash={isShieldDown ? [15, 5] : shieldActive ? undefined : [10, 10]}
        shadowEnabled={shieldActive || isShieldDown}
        shadowColor={shieldColor}
        shadowBlur={isShieldDown ? 12 + Math.sin(pulsePhase) * 8 : // Strong glow when down
                    shieldActive ? 8 + (energyFlow * 6) : 0}
        shadowOpacity={isShieldDown ? 0.8 : 0.3 + (energyFlow * 0.2)}
      />

      {/* Critical warning pulsing line */}
      {isCritical && (
        <Line
          points={[0, shieldY, width, shieldY]}
          stroke="#ff0000"
          strokeWidth={6 + Math.sin(pulsePhase * 3) * 3}
          opacity={0.4 + Math.sin(pulsePhase * 4) * 0.3}
          shadowEnabled={true}
          shadowColor="#ff0000"
          shadowBlur={15}
          shadowOpacity={0.8}
        />
      )}

      {/* Enhanced energy pattern lines */}
      {shieldActive && (
        <Group>
          {Array.from({ length: 8 }, (_, i) => {
            const x = (width / 8) * i + (width / 16);
            const phaseOffset = (i / 8) * Math.PI * 2;
            const currentPhase = energyPhase + phaseOffset;
            const lineHeight = 15 + Math.sin(currentPhase) * 8;
            const lineOpacity = (shieldOpacity * 0.6) + (Math.sin(currentPhase) * 0.3);
            
            return (
              <Line
                key={i}
                points={[x, shieldY, x, shieldY - lineHeight]}
                stroke={shieldColor}
                strokeWidth={2 + Math.sin(currentPhase) * 1}
                opacity={Math.max(0.1, lineOpacity)}
                shadowEnabled={true}
                shadowColor={shieldColor}
                shadowBlur={4 + Math.sin(currentPhase) * 2}
                shadowOpacity={0.4}
              />
            );
          })}
        </Group>
      )}

      {/* Enhanced shield strength indicators */}
      {shieldActive && (
        <Group>
          {Array.from({ length: 10 }, (_, i) => {
            const isActive = i < Math.floor(shieldPercentage * 10);
            const indicator_x = (width / 12) * i + (width / 12);
            const phaseOffset = (i / 10) * Math.PI;
            const indicatorPhase = energyPhase + phaseOffset;
            
            if (!isActive) return null;
            
            return (
              <Group key={i}>
                {/* Main indicator */}
                <Rect
                  x={indicator_x}
                  y={shieldY - 8}
                  width={6}
                  height={6}
                  fill={shieldColor}
                  opacity={0.7 + Math.sin(indicatorPhase) * 0.2}
                  shadowEnabled={true}
                  shadowColor={shieldColor}
                  shadowBlur={3}
                  shadowOpacity={0.5}
                />
                
                {/* Energy pulse effect for indicators */}
                {Math.sin(indicatorPhase) > 0.5 && (
                  <Circle
                    x={indicator_x + 3}
                    y={shieldY - 5}
                    radius={2 + Math.sin(indicatorPhase) * 2}
                    fill={shieldColor}
                    opacity={0.3}
                  />
                )}
              </Group>
            );
          })}
        </Group>
      )}

      {/* Energy surge effects when shield is charging */}
      {shieldActive && shieldPercentage > 0.8 && (
        <Group>
          {Array.from({ length: 3 }, (_, i) => {
            const surgeX = (width / 4) * (i + 1);
            const surgePhase = energyPhase * 2 + (i * Math.PI / 3);
            const surgeOpacity = Math.max(0, Math.sin(surgePhase)) * 0.4;
            
            return (
              <Circle
                key={`surge-${i}`}
                x={surgeX}
                y={shieldY - 5}
                radius={8 + Math.sin(surgePhase) * 4}
                fill={shieldColor}
                opacity={surgeOpacity}
              />
            );
          })}
        </Group>
      )}

      {/* Shield depletion warning - static */}
      {shieldPercentage <= 0 && (
        <Line
          points={[0, shieldY, width, shieldY]}
          stroke="#ff0000"
          strokeWidth={6}
          opacity={0.8}
          dash={[8, 8]}
        />
      )}
    </Group>
  );
}