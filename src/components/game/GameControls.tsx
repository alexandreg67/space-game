"use client";

import React from 'react';
import { useResetGame } from '@/lib/stores/gameStore';

interface GameControlsProps {
  isGameRunning: boolean;
  isPaused: boolean;
}

export default function GameControls({ isGameRunning, isPaused }: GameControlsProps) {
  const resetGame = useResetGame();

  const handleRestart = () => {
    resetGame();
  };

  return (
    <div className="w-full max-w-4xl mx-auto mt-6 px-4">
      {/* Instructions Section */}
      <div className="bg-gray-900/80 backdrop-blur-sm border border-gray-700 rounded-lg p-6 mb-4">
        <h3 className="text-lg font-bold text-white mb-4 text-center">Game Controls</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-300">
          {/* Movement Controls */}
          <div className="text-center">
            <h4 className="text-white font-semibold mb-2">Movement</h4>
            <div className="space-y-1">
              <div className="flex items-center justify-center gap-2">
                <kbd className="px-2 py-1 bg-gray-800 border border-gray-600 rounded text-xs">W</kbd>
                <kbd className="px-2 py-1 bg-gray-800 border border-gray-600 rounded text-xs">A</kbd>
                <kbd className="px-2 py-1 bg-gray-800 border border-gray-600 rounded text-xs">S</kbd>
                <kbd className="px-2 py-1 bg-gray-800 border border-gray-600 rounded text-xs">D</kbd>
              </div>
              <p>or Arrow Keys</p>
            </div>
          </div>

          {/* Shooting Controls */}
          <div className="text-center">
            <h4 className="text-white font-semibold mb-2">Shooting</h4>
            <div className="space-y-1">
              <kbd className="px-3 py-1 bg-gray-800 border border-gray-600 rounded text-xs">SPACE</kbd>
              <p>Hold to fire continuously</p>
            </div>
          </div>

          {/* Game Controls */}
          <div className="text-center">
            <h4 className="text-white font-semibold mb-2">Game</h4>
            <div className="space-y-1">
              <kbd className="px-2 py-1 bg-gray-800 border border-gray-600 rounded text-xs">ESC</kbd>
              <p>Pause / Resume</p>
            </div>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-wrap justify-center gap-4">
        {/* Restart Button */}
        {(isGameRunning || isPaused) && (
          <button
            onClick={handleRestart}
            className="group relative px-6 py-3 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white font-bold rounded-lg transition-all duration-200 transform hover:scale-105 focus:outline-none focus:ring-4 focus:ring-red-500/50"
            aria-label="Restart the game"
          >
            <span className="flex items-center gap-2">
              <span className="text-lg">🔄</span>
              Restart Game
            </span>
            <div className="absolute inset-0 bg-gradient-to-r from-red-400/20 to-red-500/20 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200"></div>
          </button>
        )}

        {/* Help/Instructions Toggle - for future expansion */}
        <button
          className="group relative px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600 text-white font-bold rounded-lg transition-all duration-200 transform hover:scale-105 focus:outline-none focus:ring-4 focus:ring-blue-500/50"
          aria-label="Show help"
        >
          <span className="flex items-center gap-2">
            <span className="text-lg">❓</span>
            Help
          </span>
          <div className="absolute inset-0 bg-gradient-to-r from-blue-400/20 to-blue-500/20 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200"></div>
        </button>

        {/* Settings Button - for future expansion */}
        <button
          className="group relative px-6 py-3 bg-gradient-to-r from-gray-600 to-gray-700 hover:from-gray-500 hover:to-gray-600 text-white font-bold rounded-lg transition-all duration-200 transform hover:scale-105 focus:outline-none focus:ring-4 focus:ring-gray-500/50"
          aria-label="Game settings"
        >
          <span className="flex items-center gap-2">
            <span className="text-lg">⚙️</span>
            Settings
          </span>
          <div className="absolute inset-0 bg-gradient-to-r from-gray-400/20 to-gray-500/20 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200"></div>
        </button>
      </div>

      {/* Game Status Indicator */}
      <div className="text-center mt-4">
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-gray-800/50 rounded-full text-sm text-gray-300">
          <div className={`w-2 h-2 rounded-full ${
            isGameRunning ? (isPaused ? 'bg-yellow-500' : 'bg-green-500') : 'bg-red-500'
          }`}></div>
          <span>
            {isGameRunning ? (isPaused ? 'Paused' : 'Playing') : 'Ready to Start'}
          </span>
        </div>
      </div>
    </div>
  );
}