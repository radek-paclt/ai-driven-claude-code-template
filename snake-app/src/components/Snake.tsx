import React from 'react';
import type { SnakeSegment } from '../types';
import { useGameConfig } from '../contexts/GameConfigContext';

interface SnakeProps {
  snake: SnakeSegment[];
}

/**
 * Snake component that renders all segments of the snake.
 * The head is visually distinguished from the body segments.
 * Includes smooth movement transitions between grid positions.
 */
export const Snake: React.FC<SnakeProps> = ({ snake }) => {
  const { cellSize } = useGameConfig();
  
  return (
    <>
      {snake.map((segment, index) => {
        const isHead = index === 0;
        const isTail = index === snake.length - 1;
        
        // Calculate animation delay for wave effect
        const animationDelay = index * 0.05;

        const segmentStyle: React.CSSProperties = {
          position: 'absolute',
          left: `${segment.x * cellSize}px`,
          top: `${segment.y * cellSize}px`,
          width: `${cellSize}px`,
          height: `${cellSize}px`,
          backgroundColor: isHead 
            ? 'var(--color-primary)' 
            : isTail 
              ? 'var(--color-primary-light)' 
              : 'var(--color-success)',
          border: `2px solid ${isHead ? 'var(--color-primary-dark)' : 'var(--color-primary)'}`,
          borderRadius: isHead ? 'var(--radius-md)' : 'var(--radius-sm)',
          boxSizing: 'border-box',
          transition: 'all var(--duration-fast) var(--ease-out)',
          zIndex: isHead ? 3 : isTail ? 1 : 2,
          // Enhanced gradients with CSS variables
          background: isHead
            ? 'linear-gradient(135deg, var(--color-primary), var(--color-primary-dark))'
            : isTail
              ? 'linear-gradient(135deg, var(--color-primary-light), var(--color-success))'
              : 'linear-gradient(135deg, var(--color-success), var(--color-primary))',
          // Enhanced shadows
          boxShadow: isHead 
            ? 'var(--shadow-md), 0 0 10px rgba(76, 175, 80, 0.3)' 
            : 'var(--shadow-sm)',
          // Add scale animation for head
          transform: isHead ? 'scale(1.05)' : 'scale(1)',
          // Animation delay for wave effect
          animationDelay: `${animationDelay}s`,
        };

        const eyeStyle: React.CSSProperties = {
          position: 'absolute',
          top: '30%',
          width: '3px',
          height: '3px',
          backgroundColor: 'var(--color-primary-dark)',
          borderRadius: 'var(--radius-full)',
          boxShadow: '0 0 2px rgba(0,0,0,0.3)',
        };

        const leftEyeStyle: React.CSSProperties = {
          ...eyeStyle,
          left: '25%',
        };

        const rightEyeStyle: React.CSSProperties = {
          ...eyeStyle,
          right: '25%',
        };

        // Enhanced head with better eyes and glow effect
        if (isHead) {
          return (
            <div
              key={`snake-${index}`}
              style={segmentStyle}
              data-testid="snake-head"
              className="snake-head animate-pulse"
              role="img"
              aria-label="Snake head"
            >
              {/* Left eye */}
              <div style={leftEyeStyle} />
              {/* Right eye */}
              <div style={rightEyeStyle} />
              {/* Nose/mouth indicator */}
              <div
                style={{
                  position: 'absolute',
                  bottom: '25%',
                  left: '50%',
                  transform: 'translateX(-50%)',
                  width: '2px',
                  height: '1px',
                  backgroundColor: 'var(--color-primary-dark)',
                  borderRadius: 'var(--radius-sm)',
                }}
              />
            </div>
          );
        }

        // Body segments with subtle texture
        return (
          <div
            key={`snake-${index}`}
            style={segmentStyle}
            data-testid="snake-body"
            className={`snake-segment ${isTail ? 'snake-tail' : 'snake-body'}`}
            role="img"
            aria-label={isTail ? 'Snake tail' : 'Snake body'}
          >
            {/* Add a subtle inner highlight for depth */}
            <div
              style={{
                position: 'absolute',
                top: '2px',
                left: '2px',
                right: '2px',
                height: '30%',
                background: 'linear-gradient(to bottom, rgba(255,255,255,0.2), transparent)',
                borderRadius: 'var(--radius-sm) var(--radius-sm) 0 0',
                pointerEvents: 'none',
              }}
            />
          </div>
        );
      })}
      
      {/* CSS for animations */}
      <style>
        {`
          @keyframes snakeMove {
            0% { transform: scale(1); }
            50% { transform: scale(1.02); }
            100% { transform: scale(1); }
          }
          
          .snake-head {
            animation: ${snake.length > 5 ? 'glow 2s ease-in-out infinite' : 'none'};
          }
          
          .snake-segment {
            animation: snakeMove 0.8s ease-in-out infinite;
          }
          
          .snake-tail {
            opacity: 0.9;
          }
          
          @media (prefers-reduced-motion: reduce) {
            .snake-head,
            .snake-segment {
              animation: none !important;
            }
          }
        `}
      </style>
    </>
  );
};
