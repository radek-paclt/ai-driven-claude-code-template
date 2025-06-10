import { renderHook } from '@testing-library/react';
import { act } from 'react';
import { vi, describe, test, expect, beforeEach, afterEach } from 'vitest';
import { useKeyboard } from '../hooks/useKeyboard';
import type { Direction } from '../types';

describe('useKeyboard', () => {
  let onDirectionChange: ReturnType<typeof vi.fn>;
  let mockGetTime: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    onDirectionChange = vi.fn();
    mockGetTime = vi.fn();
    
    // Mock Date.now for timing tests
    vi.spyOn(Date, 'now').mockImplementation(mockGetTime);
    mockGetTime.mockReturnValue(0);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('Basic Key Handling', () => {
    test('should handle arrow key presses', () => {
      renderHook(() => useKeyboard(onDirectionChange));

      // Test all arrow keys
      act(() => {
        window.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowUp' }));
      });
      expect(onDirectionChange).toHaveBeenCalledWith('UP');

      act(() => {
        window.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowDown' }));
      });
      expect(onDirectionChange).toHaveBeenCalledWith('DOWN');

      act(() => {
        window.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowLeft' }));
      });
      expect(onDirectionChange).toHaveBeenCalledWith('LEFT');

      act(() => {
        window.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight' }));
      });
      expect(onDirectionChange).toHaveBeenCalledWith('RIGHT');
    });

    test('should handle WASD key presses', () => {
      renderHook(() => useKeyboard(onDirectionChange));

      act(() => {
        window.dispatchEvent(new KeyboardEvent('keydown', { key: 'w' }));
      });
      expect(onDirectionChange).toHaveBeenCalledWith('UP');

      act(() => {
        window.dispatchEvent(new KeyboardEvent('keydown', { key: 's' }));
      });
      expect(onDirectionChange).toHaveBeenCalledWith('DOWN');

      act(() => {
        window.dispatchEvent(new KeyboardEvent('keydown', { key: 'a' }));
      });
      expect(onDirectionChange).toHaveBeenCalledWith('LEFT');

      act(() => {
        window.dispatchEvent(new KeyboardEvent('keydown', { key: 'd' }));
      });
      expect(onDirectionChange).toHaveBeenCalledWith('RIGHT');
    });

    test('should handle uppercase WASD keys', () => {
      renderHook(() => useKeyboard(onDirectionChange));

      act(() => {
        window.dispatchEvent(new KeyboardEvent('keydown', { key: 'W' }));
      });
      expect(onDirectionChange).toHaveBeenCalledWith('UP');

      act(() => {
        window.dispatchEvent(new KeyboardEvent('keydown', { key: 'S' }));
      });
      expect(onDirectionChange).toHaveBeenCalledWith('DOWN');
    });

    test('should ignore invalid key presses', () => {
      renderHook(() => useKeyboard(onDirectionChange));

      act(() => {
        window.dispatchEvent(new KeyboardEvent('keydown', { key: 'x' }));
      });
      expect(onDirectionChange).not.toHaveBeenCalled();

      act(() => {
        window.dispatchEvent(new KeyboardEvent('keydown', { key: 'Space' }));
      });
      expect(onDirectionChange).not.toHaveBeenCalled();

      act(() => {
        window.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter' }));
      });
      expect(onDirectionChange).not.toHaveBeenCalled();
    });
  });

  describe('Direction Reversal Prevention', () => {
    test('should prevent snake from reversing into itself', () => {
      const { result } = renderHook(() => useKeyboard(onDirectionChange));

      // Set initial direction to RIGHT
      act(() => {
        result.current.updateLastDirection('RIGHT');
      });

      // Try to go LEFT (opposite of RIGHT) - should be blocked
      act(() => {
        window.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowLeft' }));
      });
      expect(onDirectionChange).not.toHaveBeenCalled();

      // Going UP should work
      act(() => {
        window.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowUp' }));
      });
      expect(onDirectionChange).toHaveBeenCalledWith('UP');
    });

    test('should handle all opposite direction pairs', () => {
      const { result } = renderHook(() => useKeyboard(onDirectionChange));

      // Test UP -> DOWN blocking
      act(() => {
        result.current.updateLastDirection('UP');
      });
      act(() => {
        window.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowDown' }));
      });
      expect(onDirectionChange).not.toHaveBeenCalled();

      // Test DOWN -> UP blocking
      act(() => {
        result.current.updateLastDirection('DOWN');
      });
      act(() => {
        window.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowUp' }));
      });
      expect(onDirectionChange).not.toHaveBeenCalled();

      // Test LEFT -> RIGHT blocking
      act(() => {
        result.current.updateLastDirection('LEFT');
      });
      act(() => {
        window.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight' }));
      });
      expect(onDirectionChange).not.toHaveBeenCalled();
    });

    test('should allow same direction', () => {
      const { result } = renderHook(() => useKeyboard(onDirectionChange));

      act(() => {
        result.current.updateLastDirection('RIGHT');
      });

      // Same direction should be allowed
      act(() => {
        window.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight' }));
      });
      expect(onDirectionChange).toHaveBeenCalledWith('RIGHT');
    });
  });

  describe('Debouncing', () => {
    test('should debounce rapid key presses', () => {
      renderHook(() => useKeyboard(onDirectionChange));

      mockGetTime.mockReturnValue(0);
      act(() => {
        window.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowUp' }));
      });
      expect(onDirectionChange).toHaveBeenCalledTimes(1);

      // Rapid press within 50ms should be ignored
      mockGetTime.mockReturnValue(30);
      act(() => {
        window.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowDown' }));
      });
      expect(onDirectionChange).toHaveBeenCalledTimes(1);

      // Press after 50ms should work
      mockGetTime.mockReturnValue(60);
      act(() => {
        window.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowDown' }));
      });
      expect(onDirectionChange).toHaveBeenCalledTimes(2);
      expect(onDirectionChange).toHaveBeenLastCalledWith('DOWN');
    });

    test('should allow key presses after debounce period', () => {
      renderHook(() => useKeyboard(onDirectionChange));

      mockGetTime.mockReturnValue(0);
      act(() => {
        window.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight' }));
      });

      mockGetTime.mockReturnValue(100);
      act(() => {
        window.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowUp' }));
      });

      expect(onDirectionChange).toHaveBeenCalledTimes(2);
    });
  });

  describe('Event Prevention', () => {
    test('should prevent default on valid key presses', () => {
      renderHook(() => useKeyboard(onDirectionChange));

      const event = new KeyboardEvent('keydown', { key: 'ArrowUp' });
      const preventDefaultSpy = vi.spyOn(event, 'preventDefault');

      act(() => {
        window.dispatchEvent(event);
      });

      expect(preventDefaultSpy).toHaveBeenCalled();
    });

    test('should not prevent default on invalid keys', () => {
      renderHook(() => useKeyboard(onDirectionChange));

      const event = new KeyboardEvent('keydown', { key: 'x' });
      const preventDefaultSpy = vi.spyOn(event, 'preventDefault');

      act(() => {
        window.dispatchEvent(event);
      });

      expect(preventDefaultSpy).not.toHaveBeenCalled();
    });

    test('should not prevent default when direction is blocked', () => {
      const { result } = renderHook(() => useKeyboard(onDirectionChange));

      act(() => {
        result.current.updateLastDirection('RIGHT');
      });

      const event = new KeyboardEvent('keydown', { key: 'ArrowLeft' });
      const preventDefaultSpy = vi.spyOn(event, 'preventDefault');

      act(() => {
        window.dispatchEvent(event);
      });

      expect(preventDefaultSpy).not.toHaveBeenCalled();
    });
  });

  describe('Cleanup', () => {
    test('should remove event listener on unmount', () => {
      const removeEventListenerSpy = vi.spyOn(window, 'removeEventListener');
      
      const { unmount } = renderHook(() => useKeyboard(onDirectionChange));
      
      unmount();
      
      expect(removeEventListenerSpy).toHaveBeenCalledWith('keydown', expect.any(Function));
    });

    test('should not respond to events after unmount', () => {
      const { unmount } = renderHook(() => useKeyboard(onDirectionChange));
      
      unmount();
      
      act(() => {
        window.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowUp' }));
      });
      
      expect(onDirectionChange).not.toHaveBeenCalled();
    });
  });

  describe('UpdateLastDirection', () => {
    test('should update last direction reference', () => {
      const { result } = renderHook(() => useKeyboard(onDirectionChange));

      // Initially, should be able to go LEFT (default is RIGHT)
      act(() => {
        window.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowLeft' }));
      });
      expect(onDirectionChange).not.toHaveBeenCalled(); // Blocked because default is RIGHT

      // Update to UP
      act(() => {
        result.current.updateLastDirection('UP');
      });

      // Now LEFT should work
      act(() => {
        window.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowLeft' }));
      });
      expect(onDirectionChange).toHaveBeenCalledWith('LEFT');
    });

    test('should properly track direction changes', () => {
      const { result } = renderHook(() => useKeyboard(onDirectionChange));

      const directions: Direction[] = ['UP', 'RIGHT', 'DOWN', 'LEFT'];
      
      directions.forEach((direction) => {
        act(() => {
          result.current.updateLastDirection(direction);
        });

        // Test that opposite direction is blocked
        const opposites = { UP: 'DOWN', DOWN: 'UP', LEFT: 'RIGHT', RIGHT: 'LEFT' };
        const oppositeKey = opposites[direction] === 'UP' ? 'ArrowUp' : 
                           opposites[direction] === 'DOWN' ? 'ArrowDown' :
                           opposites[direction] === 'LEFT' ? 'ArrowLeft' : 'ArrowRight';
        
        onDirectionChange.mockClear();
        act(() => {
          window.dispatchEvent(new KeyboardEvent('keydown', { key: oppositeKey }));
        });
        expect(onDirectionChange).not.toHaveBeenCalled();
      });
    });
  });

  describe('Edge Cases', () => {
    test('should handle callback changes', () => {
      const newCallback = vi.fn();
      
      const { rerender } = renderHook(
        ({ callback }) => useKeyboard(callback),
        { initialProps: { callback: onDirectionChange } }
      );

      act(() => {
        window.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowUp' }));
      });
      expect(onDirectionChange).toHaveBeenCalledWith('UP');

      // Change callback
      rerender({ callback: newCallback });

      act(() => {
        window.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowDown' }));
      });
      expect(newCallback).toHaveBeenCalledWith('DOWN');
      expect(onDirectionChange).toHaveBeenCalledTimes(1); // Should not be called again
    });

    test('should handle multiple hook instances', () => {
      const callback1 = vi.fn();
      const callback2 = vi.fn();

      renderHook(() => useKeyboard(callback1));
      renderHook(() => useKeyboard(callback2));

      act(() => {
        window.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowUp' }));
      });

      // Both callbacks should be called
      expect(callback1).toHaveBeenCalledWith('UP');
      expect(callback2).toHaveBeenCalledWith('UP');
    });
  });

  describe('Performance', () => {
    test('should not create new handlers on re-renders', () => {
      const addEventListenerSpy = vi.spyOn(window, 'addEventListener');
      
      const { rerender } = renderHook(() => useKeyboard(onDirectionChange));
      
      const initialCallCount = addEventListenerSpy.mock.calls.length;
      
      // Re-render several times
      rerender();
      rerender();
      rerender();
      
      // Should not add more event listeners
      expect(addEventListenerSpy).toHaveBeenCalledTimes(initialCallCount);
    });
  });
});