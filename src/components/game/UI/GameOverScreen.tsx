"use client";

import React, { useEffect, useRef, useCallback, useState } from "react";
import { useGameState, useResetGame } from "@/lib/stores/gameStore";

interface GameOverScreenProps {
  width: number;
  height: number;
}

export default function GameOverScreen({ width: _width, height: _height }: GameOverScreenProps) {
  const { score, highScore, isGameOver } = useGameState();
  const resetGame = useResetGame();
  const restartButtonRef = useRef<HTMLButtonElement>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [buttonHovered, setButtonHovered] = useState(false);

  // Show animation when game over becomes true
  useEffect(() => {
    if (isGameOver) {
      const timer = setTimeout(() => setIsVisible(true), 300);
      return () => clearTimeout(timer);
    } else {
      setIsVisible(false);
    }
  }, [isGameOver]);

  // Auto-focus restart button for accessibility
  useEffect(() => {
    if (isVisible && restartButtonRef.current) {
      restartButtonRef.current.focus();
    }
  }, [isVisible]);

  const handleRestart = useCallback(() => {
    setIsVisible(false);
    // Small delay for smooth transition
    setTimeout(() => {
      resetGame();
    }, 200);
  }, [resetGame]);

  const handleKeyDown = useCallback((event: React.KeyboardEvent) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      handleRestart();
    }
    if (event.key === 'Escape') {
      event.preventDefault();
      // Could add menu/back functionality here
    }
  }, [handleRestart]);

  // Don't render if game is not over
  if (!isGameOver) return null;

  const isNewHighScore = score > 0 && score >= highScore;

  return (
    <div 
      className={`absolute inset-0 flex items-center justify-center transition-all duration-500 ${
        isVisible ? 'opacity-100' : 'opacity-0'
      }`}
      style={{
        background: 'radial-gradient(circle at center, rgba(15, 23, 42, 0.95) 0%, rgba(0, 0, 0, 0.98) 70%)',
        backdropFilter: 'blur(4px)',
      }}
      role="dialog"
      aria-modal="true"
      aria-labelledby="game-over-title"
    >
      {/* Background stars animation */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {Array.from({ length: 20 }, (_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 bg-white rounded-full animate-pulse"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 3}s`,
              animationDuration: `${2 + Math.random() * 2}s`,
            }}
          />
        ))}
      </div>

      {/* Main Game Over Panel */}
      <div 
        className={`bg-gradient-to-b from-slate-800 to-slate-900 p-8 rounded-lg shadow-2xl text-center max-w-md mx-4 transform transition-all duration-700 ${
          isVisible ? 'scale-100 translate-y-0' : 'scale-95 translate-y-4'
        }`}
        style={{
          border: '2px solid #1e40af',
          boxShadow: '0 0 30px rgba(30, 64, 175, 0.5), inset 0 1px 0 rgba(255, 255, 255, 0.1)',
        }}
      >
        {/* Game Over Title */}
        <h1 
          id="game-over-title"
          className="text-4xl font-bold text-red-400 mb-2 tracking-wider"
        >
          GAME OVER
        </h1>

        {/* New High Score Badge */}
        {isNewHighScore && (
          <div className="mb-4 inline-block">
            <div className="bg-gradient-to-r from-yellow-400 to-orange-500 text-black px-4 py-2 rounded-full text-sm font-bold animate-bounce">
              🏆 NEW HIGH SCORE! 🏆
            </div>
          </div>
        )}

        {/* Scores */}
        <div className="mb-6 space-y-2">
          <div className="text-2xl text-white">
            <span className="text-cyan-400">Score: </span>
            <span className="font-bold text-yellow-400">
              {score.toLocaleString()}
            </span>
          </div>
          
          {highScore > 0 && (
            <div className="text-lg text-gray-300">
              <span className="text-cyan-400">Best: </span>
              <span className="font-bold">
                {highScore.toLocaleString()}
              </span>
            </div>
          )}
        </div>

        {/* Restart Button */}
        <button
          ref={restartButtonRef}
          onClick={handleRestart}
          onKeyDown={handleKeyDown}
          onMouseEnter={() => setButtonHovered(true)}
          onMouseLeave={() => setButtonHovered(false)}
          className={`
            w-full py-4 px-8 text-xl font-bold rounded-lg
            transition-all duration-300 transform
            focus:outline-none focus:ring-4 focus:ring-blue-500 focus:ring-opacity-50
            ${buttonHovered 
              ? 'scale-105 shadow-2xl' 
              : 'scale-100 shadow-xl'
            }
          `}
          style={{
            background: buttonHovered 
              ? 'linear-gradient(135deg, #22d3ee 0%, #3b82f6 50%, #6366f1 100%)'
              : 'linear-gradient(135deg, #0891b2 0%, #1d4ed8 50%, #4338ca 100%)',
            color: 'white',
            textShadow: '0 2px 4px rgba(0, 0, 0, 0.5)',
            border: buttonHovered ? '2px solid #22d3ee' : '2px solid #0891b2',
          }}
          aria-label="Restart the game"
        >
          🚀 PLAY AGAIN 🚀
        </button>

        {/* Keyboard Instructions */}
        <div className="mt-4 text-sm text-gray-400">
          <p>Press <kbd className="px-2 py-1 bg-gray-700 rounded text-xs">ENTER</kbd> or <kbd className="px-2 py-1 bg-gray-700 rounded text-xs">SPACE</kbd> to restart</p>
        </div>

        {/* Game Stats (Optional) */}
        <div className="mt-6 pt-4 border-t border-gray-600">
          <div className="text-xs text-gray-400 space-y-1">
            <div>Thanks for playing!</div>
            {score > 0 && (
              <div className="text-cyan-400">
                Score this session: {score.toLocaleString()} points
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Floating UI Elements */}
      <div className="absolute top-4 right-4 text-right text-sm text-gray-400">
        <div>ESC for Menu</div>
      </div>

      {/* Animated background effects */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div 
          className="absolute w-96 h-96 rounded-full opacity-10 animate-ping"
          style={{
            background: 'radial-gradient(circle, #3b82f6 0%, transparent 70%)',
            left: '20%',
            top: '10%',
            animationDuration: '4s',
          }}
        />
        <div 
          className="absolute w-64 h-64 rounded-full opacity-10 animate-ping"
          style={{
            background: 'radial-gradient(circle, #22d3ee 0%, transparent 70%)',
            right: '15%',
            bottom: '15%',
            animationDuration: '6s',
            animationDelay: '2s',
          }}
        />
      </div>
    </div>
  );
}