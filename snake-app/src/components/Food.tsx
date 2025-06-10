import React from 'react';
import type { Food as FoodType } from '../types';
import { useGameConfig } from '../contexts/GameConfigContext';
import './Food.css';

interface FoodProps {
  food: FoodType;
}

/**
 * Food component that renders a single food item on the game board.
 * The food appears as a red circle that the snake can consume for points.
 * Enhanced with modern styling, animations, and accessibility features.
 */
export const Food: React.FC<FoodProps> = ({ food }) => {
  const { cellSize } = useGameConfig();
  
  const style: React.CSSProperties = {
    position: 'absolute',
    left: `${food.x * cellSize}px`,
    top: `${food.y * cellSize}px`,
    width: `${cellSize}px`,
    height: `${cellSize}px`,
    background: 'radial-gradient(circle at 30% 30%, var(--color-accent), var(--color-accent-dark))',
    borderRadius: 'var(--radius-full)',
    border: '2px solid var(--color-accent-dark)',
    boxSizing: 'border-box',
    transition: 'all var(--duration-fast) var(--ease-in-out)',
    zIndex: 2,
    boxShadow: `
      var(--shadow-sm),
      0 0 10px rgba(255, 107, 107, 0.4),
      inset 0 2px 4px rgba(255, 255, 255, 0.3)
    `,
    // Add entrance animation
    animation: 'foodAppear 0.3s ease-out, foodPulse 2s ease-in-out infinite 0.3s',
  };

  const coreStyle: React.CSSProperties = {
    position: 'absolute',
    top: '20%',
    left: '20%',
    width: '60%',
    height: '60%',
    background: 'radial-gradient(circle at 40% 40%, rgba(255, 255, 255, 0.6), transparent 70%)',
    borderRadius: 'var(--radius-full)',
    pointerEvents: 'none',
  };

  const sparkleStyle: React.CSSProperties = {
    position: 'absolute',
    top: '15%',
    right: '20%',
    width: '3px',
    height: '3px',
    background: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 'var(--radius-full)',
    boxShadow: '0 0 4px rgba(255, 255, 255, 0.8)',
    animation: 'sparkle 1.5s ease-in-out infinite',
    pointerEvents: 'none',
  };

  return (
    <div 
      style={style} 
      data-testid="food"
      className="food-item"
      role="img"
      aria-label="Food item for snake to eat"
    >
      {/* Inner glow/highlight */}
      <div style={coreStyle} />
      
      {/* Sparkle effect */}
      <div style={sparkleStyle} />
      
      {/* Additional small sparkle */}
      <div 
        style={{
          ...sparkleStyle,
          top: '60%',
          left: '25%',
          width: '2px',
          height: '2px',
          animationDelay: '0.7s',
        }} 
      />
    </div>
  );
};
