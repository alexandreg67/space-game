'use client';

import React from 'react';
import dynamic from 'next/dynamic';

// Dynamically import GameCanvas to avoid SSR issues with Konva
const GameCanvas = dynamic(() => import('@/components/game/GameCanvas'), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center min-h-screen bg-black">
      <div className="text-white text-xl">Loading Space Shooter...</div>
    </div>
  )
});

export default function GamePage() {
  return (
    <div className="min-h-screen bg-black flex flex-col items-center justify-center p-4">
      <h1 className="text-4xl font-bold text-white mb-8 text-center">
        Space Shooter Game
      </h1>
      
      <div className="flex flex-col items-center space-y-4">
        <GameCanvas width={800} height={600} />
        
        <div className="text-white text-center max-w-2xl">
          <h2 className="text-xl font-semibold mb-2">Controls</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <h3 className="font-medium text-blue-300">Movement</h3>
              <p>WASD or Arrow Keys</p>
              <p>Touch/Mouse (mobile)</p>
            </div>
            <div>
              <h3 className="font-medium text-blue-300">Shooting</h3>
              <p>SPACE bar</p>
              <p>Mouse Click / Touch</p>
            </div>
          </div>
          
          <div className="mt-4 text-xs text-gray-400">
            <p>Destroy enemies to score points. Avoid enemy fire and collisions!</p>
            <p>Difficulty increases as you progress through levels.</p>
          </div>
        </div>
      </div>
    </div>
  );
}