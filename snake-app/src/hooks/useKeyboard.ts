import { useEffect, useRef } from 'react';
import type { Direction } from '../types';

type KeyboardHandler = (direction: Direction) => void;

/**
 * Custom hook for handling keyboard input for snake game controls.
 * Supports both arrow keys and WASD keys for movement.
 * Prevents rapid direction changes that could cause the snake to reverse into itself.
 */
export const useKeyboard = (onDirectionChange: KeyboardHandler) => {
  const lastDirectionRef = useRef<Direction>('RIGHT');
  const lastKeyTimeRef = useRef<number>(0);

  useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      // Prevent too rapid key presses (debounce)
      const now = Date.now();
      if (now - lastKeyTimeRef.current < 50) {
        return;
      }
      lastKeyTimeRef.current = now;

      let newDirection: Direction | null = null;

      // Handle arrow keys and WASD
      switch (event.key.toLowerCase()) {
        case 'arrowup':
        case 'w':
          newDirection = 'UP';
          break;
        case 'arrowdown':
        case 's':
          newDirection = 'DOWN';
          break;
        case 'arrowleft':
        case 'a':
          newDirection = 'LEFT';
          break;
        case 'arrowright':
        case 'd':
          newDirection = 'RIGHT';
          break;
        default:
          return;
      }

      // Prevent reversing direction (snake can't go back into itself)
      const oppositeDirections: Record<Direction, Direction> = {
        UP: 'DOWN',
        DOWN: 'UP',
        LEFT: 'RIGHT',
        RIGHT: 'LEFT',
      };

      if (
        newDirection &&
        newDirection !== oppositeDirections[lastDirectionRef.current]
      ) {
        lastDirectionRef.current = newDirection;
        onDirectionChange(newDirection);
        event.preventDefault();
      }
    };

    window.addEventListener('keydown', handleKeyPress);

    return () => {
      window.removeEventListener('keydown', handleKeyPress);
    };
  }, [onDirectionChange]);

  // Update the last direction reference when direction changes externally
  const updateLastDirection = (direction: Direction) => {
    lastDirectionRef.current = direction;
  };

  return { updateLastDirection };
};
