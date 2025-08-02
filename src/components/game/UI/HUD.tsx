"use client";

import React, { useMemo } from "react";
import { Text, Rect, Group } from "react-konva";
import { useGameStore } from "@/lib/stores/gameStore";

interface HUDProps {
  width: number;
  height: number;
}

export default function HUD({ width, height }: HUDProps) {
  // Use individual selectors to avoid unnecessary re-renders
  const score = useGameStore((state) => state.score);
  const lives = useGameStore((state) => state.lives);
  const level = useGameStore((state) => state.level);

  // Memoize the lives indicators array to prevent unnecessary re-renders
  const livesIndicators = useMemo(() => {
    return Array.from({ length: Math.max(0, lives) }, (_, i) => (
      <Rect
        key={i}
        x={width / 2 + 20 + i * 25}
        y={22}
        width={20}
        height={15}
        fill="#00ff00"
        stroke="#ffffff"
        strokeWidth={1}
        cornerRadius={2}
      />
    ));
  }, [lives, width]);

  return (
    <Group>
      {/* HUD Background */}
      <Rect
        x={0}
        y={0}
        width={width}
        height={60}
        fill="rgba(0, 0, 0, 0.7)"
        stroke="#333"
        strokeWidth={1}
      />

      {/* Score */}
      <Text
        x={20}
        y={20}
        text={`Score: ${score.toLocaleString()}`}
        fontSize={18}
        fontFamily="Arial"
        fill="#ffffff"
        fontStyle="bold"
      />

      {/* Lives */}
      <Group>
        <Text
          x={width / 2 - 40}
          y={20}
          text="Lives:"
          fontSize={18}
          fontFamily="Arial"
          fill="#ffffff"
          fontStyle="bold"
        />

        {/* Lives indicators */}
        {livesIndicators}
      </Group>

      {/* Level */}
      <Text
        x={width - 120}
        y={20}
        text={`Level: ${level}`}
        fontSize={18}
        fontFamily="Arial"
        fill="#ffffff"
        fontStyle="bold"
      />

      {/* Health bar for current health display */}
      <Group>
        <Text
          x={20}
          y={height - 40}
          text="Health:"
          fontSize={14}
          fontFamily="Arial"
          fill="#ffffff"
        />

        {/* Health bar background */}
        <Rect
          x={80}
          y={height - 38}
          width={200}
          height={12}
          fill="#333333"
          stroke="#ffffff"
          strokeWidth={1}
          cornerRadius={6}
        />
      </Group>
    </Group>
  );
}
