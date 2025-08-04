"use client";

import React, { useCallback } from "react";
import { Circle, Text, Group } from "react-konva";
import { useGameAudio } from "@/hooks/useGameAudio";

interface AudioControlsProps {
  x: number;
  y: number;
  size?: number;
}

export default function AudioControls({ x, y, size = 24 }: AudioControlsProps) {
  const { isMuted, isAudioEnabled, toggleMute, initializeAudio, playUIClickSound } = useGameAudio();

  const handleToggleMute = useCallback(async () => {
    console.log('Audio button clicked:', { isAudioEnabled, isMuted });
    
    // Initialize audio if not enabled and user is trying to unmute
    if (!isAudioEnabled) {
      console.log('Initializing audio system...');
      const success = await initializeAudio();
      console.log('Audio initialization result:', success);
      
      // Test audio after initialization
      if (success) {
        console.log('Running audio test...');
        // Import audioManager for testing
        import('@/lib/audio/AudioManager').then(({ audioManager }) => {
          audioManager.testAudio();
          // Visual confirmation in development only
          if (process.env.NODE_ENV === 'development') {
            console.log('Audio test completed! Check console for detailed logs.');
          }
        });
      }
    }
    
    const newMuteState = toggleMute();
    console.log('New mute state:', newMuteState);
    
    // Play UI click sound if audio is enabled and not muted
    if (isAudioEnabled && !newMuteState) {
      console.log('Playing UI click sound...');
      playUIClickSound({ volume: 0.5 });
    }
  }, [isAudioEnabled, isMuted, initializeAudio, toggleMute, playUIClickSound]);

  const getAudioIcon = () => {
    if (!isAudioEnabled || isMuted) {
      return "🔇"; // Muted/disabled icon
    }
    return "🔊"; // Sound on icon
  };

  const getAudioColor = () => {
    if (!isAudioEnabled || isMuted) {
      return "#666666"; // Grayed out
    }
    return "#00ff00"; // Active green
  };

  const getHoverColor = () => {
    return "#ffffff"; // Hover effect
  };

  return (
    <Group>
      {/* Audio control button background */}
      <Circle
        x={x}
        y={y}
        radius={size / 2}
        fill="rgba(0, 0, 0, 0.7)"
        stroke={getAudioColor()}
        strokeWidth={2}
        // Interactive properties for click handling
        onClick={handleToggleMute}
        onTap={handleToggleMute} // For touch devices
        // Hover effects
        onMouseEnter={(e) => {
          const node = e.target as any;
          if (node.stroke) {
            node.stroke(getHoverColor());
          }
          document.body.style.cursor = 'pointer';
        }}
        onMouseLeave={(e) => {
          const node = e.target as any;
          if (node.stroke) {
            node.stroke(getAudioColor());
          }
          document.body.style.cursor = 'default';
        }}
      />

      {/* Audio icon */}
      <Text
        x={x}
        y={y}
        text={getAudioIcon()}
        fontSize={size * 0.6}
        fontFamily="Arial"
        fill={getAudioColor()}
        align="center"
        verticalAlign="middle"
        offsetX={size * 0.3}
        offsetY={size * 0.3}
        // Make the text also clickable
        onClick={handleToggleMute}
        onTap={handleToggleMute}
        // Add hover effect to text as well
        onMouseEnter={() => {
          document.body.style.cursor = 'pointer';
        }}
        onMouseLeave={() => {
          document.body.style.cursor = 'default';
        }}
      />

      {/* Status indicator for audio initialization */}
      {!isAudioEnabled && (
        <Text
          x={x + size / 2 + 5}
          y={y - size / 4}
          text="Click to enable"
          fontSize={10}
          fontFamily="Arial"
          fill="#ffff00"
          fontStyle="italic"
        />
      )}
    </Group>
  );
}