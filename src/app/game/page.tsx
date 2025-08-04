'use client';

import React from 'react';
import dynamic from 'next/dynamic';
import { useGameState } from '@/lib/stores/gameStore';
import GameControls from '@/components/game/GameControls';

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
  const { isRunning, isPaused } = useGameState();
  
  return (
    <div className="min-h-screen bg-black flex flex-col items-center justify-center p-4">
      <h1 className="text-4xl font-bold text-white mb-8 text-center">
        Space Shooter Game
      </h1>
      
      <div className="flex flex-col items-center space-y-4">
        <GameCanvas width={800} height={600} />
        
        {/* External Game Controls - Outside the canvas */}
        <GameControls 
          isGameRunning={isRunning} 
          isPaused={isPaused} 
        />
      </div>
    </div>
  );
}