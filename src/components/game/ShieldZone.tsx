"use client";

import React from "react";
import { Line, Rect, Group } from "react-konva";
import { useGameStore } from "@/lib/stores/gameStore";

interface ShieldZoneProps {
  width: number;
  height: number;
  shieldHeight: number;
}

export default function ShieldZone({ width, height, shieldHeight }: ShieldZoneProps) {
  const player = useGameStore((state) => state.player);

  if (!player) return null;

  const shieldY = height - shieldHeight;
  const shieldActive = player.shieldActive && player.shieldHealth > 0;
  const shieldPercentage = player.shieldHealth / player.maxShieldHealth;

  // Shield color based on health
  const getShieldColor = () => {
    if (!shieldActive) return "#666666";
    if (shieldPercentage > 0.6) return "#00ffff";
    if (shieldPercentage > 0.3) return "#ffff00";
    return "#ff4400";
  };

  const shieldColor = getShieldColor();
  const shieldOpacity = shieldActive ? 0.6 + (shieldPercentage * 0.4) : 0.2;

  // Static warning opacity when shield is low
  const isLowShield = shieldPercentage < 0.25 && shieldPercentage > 0;
  const warningOpacity = isLowShield ? 0.3 : 0.1;

  return (
    <Group>
      {/* Shield protection zone background */}
      <Rect
        x={0}
        y={shieldY}
        width={width}
        height={shieldHeight}
        fill={isLowShield ? "#ff4400" : "#00ffff"}
        opacity={shieldActive ? warningOpacity : 0.05}
      />

      {/* Main shield line */}
      <Line
        points={[0, shieldY, width, shieldY]}
        stroke={shieldColor}
        strokeWidth={shieldActive ? 4 : 2}
        opacity={shieldOpacity}
        dash={shieldActive ? undefined : [10, 10]}
        shadowEnabled={shieldActive}
        shadowColor={shieldColor}
        shadowBlur={shieldActive ? 8 : 0}
        shadowOpacity={0.3}
      />

      {/* Shield energy pattern lines - simplified */}
      {shieldActive && (
        <Group>
          {Array.from({ length: 6 }, (_, i) => (
            <Line
              key={i}
              points={[
                (width / 6) * i + (width / 12),
                shieldY,
                (width / 6) * i + (width / 12),
                shieldY - 15
              ]}
              stroke={shieldColor}
              strokeWidth={2}
              opacity={shieldOpacity * 0.5}
            />
          ))}
        </Group>
      )}

      {/* Shield strength indicators - simplified */}
      {shieldActive && (
        <Group>
          {Array.from({ length: Math.floor(shieldPercentage * 10) }, (_, i) => (
            <Rect
              key={i}
              x={(width / 10) * i + 10}
              y={shieldY - 8}
              width={4}
              height={4}
              fill={shieldColor}
              opacity={0.7}
            />
          ))}
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