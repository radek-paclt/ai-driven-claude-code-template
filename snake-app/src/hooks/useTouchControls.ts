import { useCallback, useRef, useEffect } from 'react';
import type { Direction } from '../types';

interface TouchStartEvent {
  startX: number;
  startY: number;
  timestamp: number;
}

/**
 * Hook for handling touch controls on mobile devices
 * Supports swipe gestures to control snake direction
 */
export const useTouchControls = (
  changeDirection: (direction: Direction) => void,
  isGamePlaying: boolean
) => {
  const touchStartRef = useRef<TouchStartEvent | null>(null);
  const lastDirectionChangeRef = useRef<number>(0);

  const handleTouchStart = useCallback((event: TouchEvent) => {
    if (!isGamePlaying || event.touches.length !== 1) return;
    
    event.preventDefault();
    const touch = event.touches[0];
    touchStartRef.current = {
      startX: touch.clientX,
      startY: touch.clientY,
      timestamp: Date.now(),
    };
  }, [isGamePlaying]);

  const handleTouchEnd = useCallback((event: TouchEvent) => {
    if (!isGamePlaying || !touchStartRef.current || event.changedTouches.length !== 1) return;
    
    event.preventDefault();
    const touch = event.changedTouches[0];
    const { startX, startY, timestamp } = touchStartRef.current;
    
    const deltaX = touch.clientX - startX;
    const deltaY = touch.clientY - startY;
    const deltaTime = Date.now() - timestamp;
    
    // Minimum swipe distance and maximum time for valid swipe
    const minSwipeDistance = 30;
    const maxSwipeTime = 300;
    
    // Prevent rapid direction changes
    if (deltaTime > maxSwipeTime || Date.now() - lastDirectionChangeRef.current < 100) {
      touchStartRef.current = null;
      return;
    }
    
    const absX = Math.abs(deltaX);
    const absY = Math.abs(deltaY);
    
    // Determine swipe direction
    if (Math.max(absX, absY) < minSwipeDistance) {
      touchStartRef.current = null;
      return;
    }
    
    let newDirection: Direction | null = null;
    
    if (absX > absY) {
      // Horizontal swipe
      newDirection = deltaX > 0 ? 'RIGHT' : 'LEFT';
    } else {
      // Vertical swipe
      newDirection = deltaY > 0 ? 'DOWN' : 'UP';
    }
    
    if (newDirection) {
      changeDirection(newDirection);
      lastDirectionChangeRef.current = Date.now();
    }
    
    touchStartRef.current = null;
  }, [changeDirection, isGamePlaying]);

  const handleTouchMove = useCallback((event: TouchEvent) => {
    if (!isGamePlaying) return;
    // Prevent scrolling when touching the game area
    event.preventDefault();
  }, [isGamePlaying]);

  useEffect(() => {
    const gameBoard = document.querySelector('[data-testid="game-board"]') as HTMLElement;
    if (!gameBoard) return;

    // Add touch event listeners with passive: false to allow preventDefault
    gameBoard.addEventListener('touchstart', handleTouchStart, { passive: false });
    gameBoard.addEventListener('touchend', handleTouchEnd, { passive: false });
    gameBoard.addEventListener('touchmove', handleTouchMove, { passive: false });

    return () => {
      gameBoard.removeEventListener('touchstart', handleTouchStart);
      gameBoard.removeEventListener('touchend', handleTouchEnd);
      gameBoard.removeEventListener('touchmove', handleTouchMove);
    };
  }, [handleTouchStart, handleTouchEnd, handleTouchMove]);

  return {
    // Return touch handlers for manual attachment if needed
    handleTouchStart,
    handleTouchEnd,
    handleTouchMove,
  };
};