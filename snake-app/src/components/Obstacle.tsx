import React from 'react';
import type { Obstacle as ObstacleType } from '../types';
import { useGameConfig } from '../contexts/GameConfigContext';

interface ObstacleProps {
  obstacle: ObstacleType;
}

/**
 * Obstacle component that renders static obstacles on the game board.
 * These create permanent barriers that the snake must avoid.
 */
export const Obstacle: React.FC<ObstacleProps> = ({ obstacle }) => {
  const { cellSize } = useGameConfig();
  
  const style: React.CSSProperties = {
    position: 'absolute',
    left: `${obstacle.x * cellSize}px`,
    top: `${obstacle.y * cellSize}px`,
    width: `${obstacle.width * cellSize}px`,
    height: `${obstacle.height * cellSize}px`,
    backgroundColor: '#8B4513',
    border: '2px solid #654321',
    borderRadius: '4px',
    boxSizing: 'border-box',
    boxShadow: `
      inset 0 1px 0 rgba(255, 255, 255, 0.2),
      inset 0 -1px 0 rgba(0, 0, 0, 0.3),
      0 2px 4px rgba(0, 0, 0, 0.3)
    `,
    background: `
      linear-gradient(45deg, #8B4513 25%, #A0522D 25%),
      linear-gradient(-45deg, #8B4513 25%, #A0522D 25%),
      linear-gradient(45deg, #A0522D 75%, #8B4513 75%),
      linear-gradient(-45deg, #A0522D 75%, #8B4513 75%)
    `,
    backgroundSize: `${Math.max(4, cellSize / 3)}px ${Math.max(4, cellSize / 3)}px`,
    backgroundPosition: '0 0, 0 2px, 2px -2px, -2px 0px',
    zIndex: 1,
  };

  return (
    <div 
      style={style}
      data-testid="obstacle"
      className="obstacle"
      role="img"
      aria-label="Game obstacle"
    />
  );
};

interface ObstacleListProps {
  obstacles: ObstacleType[];
}

/**
 * Component that renders all obstacles on the game board
 */
export const ObstacleList: React.FC<ObstacleListProps> = ({ obstacles }) => {
  return (
    <>
      {obstacles.map((obstacle) => (
        <Obstacle key={obstacle.id} obstacle={obstacle} />
      ))}
    </>
  );
};