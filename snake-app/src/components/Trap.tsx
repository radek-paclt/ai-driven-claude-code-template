import React, { useEffect, useState } from 'react';
import type { Trap as TrapType } from '../types';
import { useGameConfig } from '../contexts/GameConfigContext';

interface TrapProps {
  trap: TrapType;
  isWarning?: boolean;
}

/**
 * Trap component that renders a dangerous obstacle that reduces snake length.
 * Features a distinctive spiky appearance with warning animation when triggered.
 */
export const Trap: React.FC<TrapProps> = ({ trap, isWarning = false }) => {
  const [pulse, setPulse] = useState(false);

  // Create pulsing animation effect
  useEffect(() => {
    const interval = setInterval(() => {
      setPulse(prev => !prev);
    }, 600);

    return () => clearInterval(interval);
  }, []);

  const { cellSize } = useGameConfig();

  const trapStyle: React.CSSProperties = {
    position: 'absolute',
    left: `${trap.x * cellSize}px`,
    top: `${trap.y * cellSize}px`,
    width: `${cellSize}px`,
    height: `${cellSize}px`,
    backgroundColor: isWarning ? '#FF4444' : '#FF6B35',
    border: '2px solid #B33A20',
    borderRadius: '3px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: `${Math.max(10, cellSize * 0.7)}px`,
    fontWeight: 'bold',
    color: '#FFFFFF',
    textShadow: '1px 1px 2px rgba(0,0,0,0.8)',
    boxShadow: isWarning 
      ? '0 0 8px rgba(255, 68, 68, 0.8), inset 0 0 8px rgba(255, 255, 255, 0.3)'
      : `0 0 4px rgba(255, 107, 53, ${pulse ? '0.8' : '0.4'}), inset 0 0 4px rgba(255, 255, 255, 0.2)`,
    transition: 'all 0.15s ease-in-out',
    transform: isWarning ? 'scale(1.1)' : (pulse ? 'scale(1.05)' : 'scale(1)'),
    zIndex: 5,
    animation: isWarning ? 'trapWarning 0.2s ease-in-out infinite' : undefined,
  };

  // Create spiky border effect using CSS pseudo-elements
  const spikeStyle: React.CSSProperties = {
    position: 'relative',
    width: '100%',
    height: '100%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  };

  return (
    <div style={trapStyle} data-testid="trap">
      <div style={spikeStyle}>
        ⚡
      </div>
      <style>
        {`
          @keyframes trapWarning {
            0%, 100% { opacity: 1; }
            50% { opacity: 0.7; }
          }
        `}
      </style>
    </div>
  );
};

interface TrapListProps {
  traps: TrapType[];
  warningPosition?: { x: number; y: number };
}

/**
 * Component that renders all active traps on the game board
 */
export const TrapList: React.FC<TrapListProps> = ({ traps, warningPosition }) => {
  return (
    <>
      {traps.map(trap => (
        <Trap 
          key={trap.id} 
          trap={trap} 
          isWarning={
            warningPosition && 
            trap.x === warningPosition.x && 
            trap.y === warningPosition.y
          }
        />
      ))}
    </>
  );
};