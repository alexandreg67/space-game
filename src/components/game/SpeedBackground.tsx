"use client";

import React from "react";
import { Group, Rect, Line, Circle } from "react-konva";

interface SpeedBackgroundProps {
  width: number;
  height: number;
  offset: number;
}

// Génération d'étoiles lointaines (une seule fois)
const generateDistantStars = (width: number, height: number, count: number = 50) => {
  const stars = [];
  for (let i = 0; i < count; i++) {
    stars.push({
      id: i,
      x: Math.random() * (width + 400), // Zone étendue pour le scrolling
      y: Math.random() * height,
      size: 0.5 + Math.random() * 1.5, // Petites étoiles
      opacity: 0.3 + Math.random() * 0.4, // Opacité fixe
      speed: 0.05 + Math.random() * 0.1 // Très lent
    });
  }
  return stars;
};

// Génération de lignes de vitesse (une seule fois)
const generateSpeedLines = (width: number, height: number, count: number = 30) => {
  const lines = [];
  for (let i = 0; i < count; i++) {
    lines.push({
      id: i,
      y: Math.random() * height,
      length: 20 + Math.random() * 40, // Longueur 20-60px
      opacity: 0.1 + Math.random() * 0.2, // Opacité très subtile
      speed: 2 + Math.random() * 3 // Vitesse modérée
    });
  }
  return lines;
};

const SpeedBackground = React.memo(function SpeedBackground({
  width,
  height,
  offset
}: SpeedBackgroundProps) {
  
  // Éléments générés une seule fois (memoizés)
  const distantStars = React.useMemo(() => 
    generateDistantStars(width, height, 40), 
    [width, height]
  );
  
  const speedLines = React.useMemo(() => 
    generateSpeedLines(width, height, 25), 
    [width, height]
  );

  return (
    <Group>
      {/* 1. Gradient de fond spatial pour la profondeur */}
      <Rect
        x={0}
        y={0}
        width={width}
        height={height}
        fillRadialGradientStartPoint={{ x: width / 2, y: height / 2 }}
        fillRadialGradientEndPoint={{ x: width / 2, y: height / 2 }}
        fillRadialGradientStartRadius={0}
        fillRadialGradientEndRadius={Math.max(width, height) * 0.8}
        fillRadialGradientColorStops={[
          0, '#0a0a15',    // Centre bleu très sombre
          0.4, '#1a1a2e',  // Bleu marine
          0.8, '#0f0f1a',  // Bleu-noir
          1, '#050505'     // Noir profond aux bords
        ]}
      />

      {/* 2. Étoiles lointaines - mouvement très lent pour la profondeur */}
      {distantStars.map((star) => {
        // Mouvement simple sans wrapping complexe
        const x = (star.x - offset * star.speed) % (width + 400);
        const adjustedX = x < -50 ? x + width + 400 : x;
        
        // Ne rendre que les étoiles visibles (avec marge)
        if (adjustedX < -50 || adjustedX > width + 50) return null;
        
        return (
          <Circle
            key={star.id}
            x={adjustedX}
            y={star.y}
            radius={star.size}
            fill="#ffffff"
            opacity={star.opacity}
          />
        );
      })}

      {/* 3. Lignes de vitesse - sensation de progression */}
      {speedLines.map((line) => {
        // Position basée sur l'offset - mouvement fluide
        const startX = ((offset * line.speed) % (width + line.length + 100)) - line.length;
        
        // Ne rendre que les lignes visibles
        if (startX > width + 50) return null;
        
        return (
          <Line
            key={line.id}
            points={[startX, line.y, startX + line.length, line.y]}
            stroke="rgba(255, 255, 255, 0.6)"
            strokeWidth={0.8}
            opacity={line.opacity}
            lineCap="round"
          />
        );
      })}

      {/* 4. Lignes de vitesse rapides pour l'effet de mouvement */}
      {Array.from({ length: 15 }, (_, i) => {
        const y = (i * height) / 15 + (Math.sin(i * 0.5) * 50);
        const speed = 4 + (i % 3);
        const startX = ((offset * speed) % (width + 150));
        const length = 30 + (i % 20);
        
        return (
          <Line
            key={`fast-${i}`}
            points={[startX, y, startX + length, y]}
            stroke="rgba(255, 255, 255, 0.4)"
            strokeWidth={0.5}
            opacity={0.15}
            lineCap="round"
          />
        );
      })}
    </Group>
  );
});

export default SpeedBackground;