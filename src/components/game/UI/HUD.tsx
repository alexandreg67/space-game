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
  const player = useGameStore((state) => state.player);

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

      {/* Shield Bar (using the original health bar position) */}
      {player && (
        <Group>
          <Text
            x={20}
            y={height - 40}
            text="Shield:"
            fontSize={14}
            fontFamily="Arial"
            fill="#00ffff"
          />

          {/* Shield bar background */}
          <Rect
            x={80}
            y={height - 38}
            width={200}
            height={12}
            fill="#333333"
            stroke="#00ffff"
            strokeWidth={1}
            cornerRadius={6}
          />

          {/* Shield bar fill */}
          <Rect
            x={81}
            y={height - 37}
            width={Math.max(0, (player.shieldHealth / player.maxShieldHealth) * 198)}
            height={10}
            fill={
              player.shieldHealth > player.maxShieldHealth * 0.6
                ? "#00ffff"
                : player.shieldHealth > player.maxShieldHealth * 0.3
                ? "#ffff00"
                : "#ff4400"
            }
            cornerRadius={5}
          />

          {/* Shield percentage text */}
          <Text
            x={290}
            y={height - 40}
            text={`${Math.round((player.shieldHealth / player.maxShieldHealth) * 100)}%`}
            fontSize={12}
            fontFamily="Arial"
            fill="#00ffff"
          />

          {/* Shield status indicator with enhanced warning for shield down */}
          {player.shieldDown && (
            <Text
              x={360}
              y={height - 40}
              text="⚠ SHIELD DOWN! ⚠"
              fontSize={14}
              fontFamily="Arial"
              fill="#ff0000"
              fontStyle="bold"
            />
          )}
          
          {/* Shield regenerating indicator */}
          {!player.shieldDown && player.shieldHealth < player.maxShieldHealth && player.shieldHealth > 0 && (
            <Text
              x={360}
              y={height - 40}
              text="RECHARGING..."
              fontSize={10}
              fontFamily="Arial"
              fill="#ffff00"
              fontStyle="italic"
            />
          )}
        </Group>
      )}
    </Group>
  );
}
