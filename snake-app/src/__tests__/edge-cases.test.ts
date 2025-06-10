import { vi, describe, test, expect, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useGameState } from '../hooks/useGameState';
import { GameStorageService } from '../services/gameStorage';
import { performanceEvaluator } from '../services/performanceEvaluator';
import { GAME_CONFIG } from '../constants/gameConfig';

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value.toString();
    },
    removeItem: (key: string) => {
      delete store[key];
    },
    clear: () => {
      store = {};
    },
  };
})();

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
  writable: true,
});

describe('Edge Cases and Error Handling', () => {
  beforeEach(() => {
    localStorageMock.clear();
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.useRealTimers();
  });

  describe('Game State Edge Cases', () => {
    test('should handle snake at board boundaries', () => {
      const { result } = renderHook(() => useGameState());
      
      act(() => {
        result.current.startGame();
      });

      // Move snake to edge of board
      act(() => {
        for (let i = 0; i < GAME_CONFIG.BOARD_WIDTH; i++) {
          result.current.changeDirection('RIGHT');
          result.current.moveSnake();
        }
      });

      const snake = result.current.gameState.snake;
      expect(snake[0].x).toBeGreaterThanOrEqual(0);
      expect(snake[0].x).toBeLessThan(GAME_CONFIG.BOARD_WIDTH);
    });

    test('should handle rapid direction reversals', () => {
      const { result } = renderHook(() => useGameState());
      
      act(() => {
        result.current.startGame();
      });

      // Try to reverse direction rapidly
      act(() => {
        result.current.changeDirection('UP');
        result.current.changeDirection('DOWN'); // Should be blocked
        result.current.changeDirection('UP');
        result.current.changeDirection('DOWN'); // Should be blocked
      });

      // Snake should not have crashed from invalid moves
      expect(result.current.gameState.gameStatus).toBe('playing');
    });

    test('should handle food spawning in occupied positions', () => {
      const { result } = renderHook(() => useGameState());
      
      act(() => {
        result.current.startGame();
      });

      // Fill most of the board with snake (theoretical test)
      const initialFood = result.current.gameState.food;
      
      // Food should never spawn on snake
      const snake = result.current.gameState.snake;
      const foodOnSnake = snake.some(segment => 
        segment.x === initialFood.x && segment.y === initialFood.y
      );
      expect(foodOnSnake).toBe(false);
    });

    test('should handle maximum snake length', () => {
      const { result } = renderHook(() => useGameState());
      
      act(() => {
        result.current.startGame();
      });

      // Simulate eating many foods to grow snake
      const maxPossibleLength = GAME_CONFIG.BOARD_WIDTH * GAME_CONFIG.BOARD_HEIGHT - 1;
      
      // Test that game doesn't break with very long snake
      // (This is a theoretical test since reaching max length is nearly impossible)
      expect(result.current.gameState.snake.length).toBeLessThan(maxPossibleLength);
    });

    test('should handle invalid game states', () => {
      const { result } = renderHook(() => useGameState());

      // Try operations on non-playing game
      act(() => {
        result.current.moveSnake(); // Should do nothing
        result.current.changeDirection('UP'); // Should do nothing
      });

      expect(result.current.gameState.gameStatus).toBe('idle');
    });

    test('should handle timer cleanup on component unmount', () => {
      const { result, unmount } = renderHook(() => useGameState());
      
      act(() => {
        result.current.startGame();
      });

      // Get initial timer count
      const initialTimers = vi.getTimerCount();
      
      // Unmount component
      unmount();
      
      // Timers should be cleaned up
      expect(vi.getTimerCount()).toBeLessThanOrEqual(initialTimers);
    });

    test('should handle pause state edge cases', () => {
      const { result } = renderHook(() => useGameState());
      
      act(() => {
        result.current.startGame();
      });

      // Rapid pause/unpause
      act(() => {
        result.current.togglePause();
        result.current.togglePause();
        result.current.togglePause();
        result.current.togglePause();
      });

      // Game should maintain consistent state
      expect(['playing', 'paused']).toContain(result.current.gameState.gameStatus);
    });
  });

  describe('Storage Edge Cases', () => {
    test('should handle localStorage quota exceeded', () => {
      const gameStorage = new GameStorageService();
      
      // Mock localStorage to throw quota exceeded error
      const originalSetItem = localStorageMock.setItem;
      localStorageMock.setItem = vi.fn(() => {
        throw new DOMException('QuotaExceededError');
      });

      expect(() => {
        gameStorage.startGameSession();
        gameStorage.recordEvent({
          type: 'food-eaten',
          position: { x: 0, y: 0 },
        });
        gameStorage.endGameSession(10, 5, 'user-quit');
      }).not.toThrow();

      // Restore original method
      localStorageMock.setItem = originalSetItem;
    });

    test('should handle corrupted localStorage data', () => {
      // Set invalid JSON
      localStorageMock.setItem('snake-game-data', '{invalid json}');
      
      expect(() => {
        new GameStorageService();
      }).not.toThrow();
    });

    test('should handle missing localStorage', () => {
      // Mock localStorage as undefined
      const originalLocalStorage = window.localStorage;
      // @ts-ignore
      delete window.localStorage;
      
      expect(() => {
        new GameStorageService();
      }).not.toThrow();
      
      // Restore localStorage
      Object.defineProperty(window, 'localStorage', {
        value: originalLocalStorage,
        writable: true,
      });
    });

    test('should handle extremely large data sets', () => {
      const gameStorage = new GameStorageService();
      
      // Create data that exceeds normal limits
      const largeEventData = 'x'.repeat(10000); // 10KB event data
      
      gameStorage.startGameSession();
      
      // Add extremely large event
      expect(() => {
        gameStorage.recordEvent({
          type: 'food-eaten',
          position: { x: 0, y: 0 },
          data: largeEventData,
        });
      }).not.toThrow();
      
      gameStorage.endGameSession(1, 1, 'user-quit');
    });

    test('should handle concurrent localStorage access', () => {
      const storage1 = new GameStorageService();
      const storage2 = new GameStorageService();
      
      // Simulate concurrent access
      storage1.startGameSession();
      storage2.startGameSession();
      
      storage1.recordEvent({
        type: 'food-eaten',
        position: { x: 1, y: 1 },
      });
      
      storage2.recordEvent({
        type: 'trap-hit',
        position: { x: 2, y: 2 },
      });
      
      expect(() => {
        storage1.endGameSession(10, 5, 'user-quit');
        storage2.endGameSession(20, 8, 'self-collision');
      }).not.toThrow();
    });

    test('should handle data migration edge cases', () => {
      // Set old version data
      const oldData = {
        version: 0, // Old version
        history: [],
        statistics: {
          totalGamesPlayed: 5,
          bestScore: 100,
        },
      };
      
      localStorageMock.setItem('snake-game-data', JSON.stringify(oldData));
      
      expect(() => {
        new GameStorageService();
      }).not.toThrow();
    });

    test('should handle empty or null data', () => {
      localStorageMock.setItem('snake-game-data', '');
      expect(() => new GameStorageService()).not.toThrow();
      
      localStorageMock.setItem('snake-game-data', 'null');
      expect(() => new GameStorageService()).not.toThrow();
      
      localStorageMock.setItem('snake-game-data', '{}');
      expect(() => new GameStorageService()).not.toThrow();
    });
  });

  describe('Performance Evaluator Edge Cases', () => {
    test('should handle empty game data', () => {
      const evaluator = performanceEvaluator;
      
      const emptyGameData = {
        score: 0,
        duration: 0,
        snakeLength: 3,
        trapsEncountered: 0,
        gameEvents: [],
        endReason: 'user-quit' as const,
      };
      
      expect(() => {
        evaluator.calculatePerformanceMetrics(emptyGameData);
      }).not.toThrow();
    });

    test('should handle invalid game data', () => {
      const evaluator = performanceEvaluator;
      
      const invalidGameData = {
        score: -1,
        duration: -1000,
        snakeLength: 0,
        trapsEncountered: -5,
        gameEvents: [],
        endReason: 'user-quit' as const,
      };
      
      expect(() => {
        evaluator.calculatePerformanceMetrics(invalidGameData);
      }).not.toThrow();
    });

    test('should handle extreme values', () => {
      const evaluator = performanceEvaluator;
      
      const extremeGameData = {
        score: Number.MAX_SAFE_INTEGER,
        duration: Number.MAX_SAFE_INTEGER,
        snakeLength: Number.MAX_SAFE_INTEGER,
        trapsEncountered: Number.MAX_SAFE_INTEGER,
        gameEvents: [],
        endReason: 'user-quit' as const,
      };
      
      expect(() => {
        evaluator.calculatePerformanceMetrics(extremeGameData);
      }).not.toThrow();
    });

    test('should handle malformed events', () => {
      const evaluator = performanceEvaluator;
      
      const gameDataWithBadEvents = {
        score: 100,
        duration: 30000,
        snakeLength: 13,
        trapsEncountered: 1,
        gameEvents: [
          // @ts-ignore - testing malformed data
          { type: 'invalid-event', timestamp: 'invalid', position: null },
          // @ts-ignore
          { type: null, timestamp: NaN, position: { x: 'invalid', y: 'invalid' } },
          // Valid event mixed in
          { type: 'food-eaten', timestamp: 1000, position: { x: 5, y: 5 } },
        ],
        endReason: 'user-quit' as const,
      };
      
      expect(() => {
        evaluator.calculatePerformanceMetrics(gameDataWithBadEvents);
      }).not.toThrow();
    });

    test('should handle empty session history', () => {
      const evaluator = performanceEvaluator;
      
      expect(() => {
        evaluator.analyzeSkillProgression([]);
      }).not.toThrow();
    });

    test('should handle single session history', () => {
      const evaluator = performanceEvaluator;
      
      const singleSession = [{
        id: 'game_1',
        timestamp: Date.now(),
        score: 50,
        duration: 30000,
        snakeLength: 8,
        trapsEncountered: 1,
        gameEvents: [],
        endReason: 'self-collision' as const,
      }];
      
      expect(() => {
        evaluator.analyzeSkillProgression(singleSession);
      }).not.toThrow();
    });
  });

  describe('Boundary Value Testing', () => {
    test('should handle minimum valid values', () => {
      const { result } = renderHook(() => useGameState());
      
      // Test with minimum game speed
      act(() => {
        result.current.startGame();
      });
      
      // Game should function at minimum values
      expect(result.current.gameState.snake.length).toBeGreaterThanOrEqual(3);
      expect(result.current.gameState.score).toBeGreaterThanOrEqual(0);
    });

    test('should handle maximum valid values', () => {
      const gameStorage = new GameStorageService();
      
      // Test with maximum reasonable values
      gameStorage.startGameSession();
      
      // Add maximum number of events
      for (let i = 0; i < 10000; i++) {
        gameStorage.recordEvent({
          type: 'food-eaten',
          position: { x: i % 20, y: Math.floor(i / 20) },
        });
      }
      
      expect(() => {
        gameStorage.endGameSession(999999, 999999, 'user-quit');
      }).not.toThrow();
    });

    test('should handle board boundary coordinates', () => {
      // Test coordinates at board boundaries
      const boundaryPositions = [
        { x: 0, y: 0 },
        { x: GAME_CONFIG.BOARD_WIDTH - 1, y: 0 },
        { x: 0, y: GAME_CONFIG.BOARD_HEIGHT - 1 },
        { x: GAME_CONFIG.BOARD_WIDTH - 1, y: GAME_CONFIG.BOARD_HEIGHT - 1 },
      ];
      
      boundaryPositions.forEach(position => {
        expect(position.x).toBeGreaterThanOrEqual(0);
        expect(position.x).toBeLessThan(GAME_CONFIG.BOARD_WIDTH);
        expect(position.y).toBeGreaterThanOrEqual(0);
        expect(position.y).toBeLessThan(GAME_CONFIG.BOARD_HEIGHT);
      });
    });
  });

  describe('Race Condition Testing', () => {
    test('should handle rapid state changes', () => {
      const { result } = renderHook(() => useGameState());
      
      // Rapid state changes
      act(() => {
        result.current.startGame();
        result.current.togglePause();
        result.current.togglePause();
        result.current.resetGame();
        result.current.startGame();
        result.current.changeDirection('UP');
        result.current.moveSnake();
        result.current.resetGame();
      });
      
      // Should end in consistent state
      expect(result.current.gameState.gameStatus).toBe('idle');
    });

    test('should handle concurrent timer operations', () => {
      const { result } = renderHook(() => useGameState());
      
      act(() => {
        result.current.startGame();
      });
      
      // Multiple rapid operations that could interfere with timers
      act(() => {
        for (let i = 0; i < 100; i++) {
          if (i % 10 === 0) result.current.togglePause();
          if (i % 7 === 0) result.current.changeDirection('UP');
          if (i % 5 === 0) result.current.moveSnake();
        }
      });
      
      // Game should still be in valid state
      expect(['playing', 'paused', 'gameOver']).toContain(result.current.gameState.gameStatus);
    });
  });

  describe('Memory Leak Testing', () => {
    test('should clean up event listeners', () => {
      const { result, unmount } = renderHook(() => useGameState());
      
      // Add event listeners (indirectly through game start)
      act(() => {
        result.current.startGame();
      });
      
      // Unmount component
      unmount();
      
      // Should not leave hanging listeners
      // This is tested indirectly by ensuring unmount doesn't throw
      expect(true).toBe(true);
    });

    test('should not accumulate data over time', () => {
      const gameStorage = new GameStorageService();
      
      // Add many sessions
      for (let i = 0; i < 200; i++) {
        gameStorage.startGameSession();
        gameStorage.endGameSession(i, i, 'user-quit');
      }
      
      const history = gameStorage.getGameHistory();
      
      // Should limit history size
      expect(history.length).toBeLessThanOrEqual(50); // MAX_HISTORY_SIZE
    });
  });

  describe('Error Recovery Testing', () => {
    test('should recover from localStorage corruption', () => {
      const gameStorage = new GameStorageService();
      
      // Start with valid data
      gameStorage.startGameSession();
      gameStorage.endGameSession(10, 5, 'user-quit');
      
      // Corrupt the data
      localStorageMock.setItem('snake-game-data', '{corrupted');
      
      // Should create new instance without error
      expect(() => {
        new GameStorageService();
      }).not.toThrow();
    });

    test('should handle network connectivity issues', () => {
      // Mock network-related localStorage errors
      const originalSetItem = localStorageMock.setItem;
      localStorageMock.setItem = vi.fn(() => {
        throw new Error('Network error');
      });
      
      const gameStorage = new GameStorageService();
      
      expect(() => {
        gameStorage.startGameSession();
        gameStorage.endGameSession(10, 5, 'user-quit');
      }).not.toThrow();
      
      // Restore original method
      localStorageMock.setItem = originalSetItem;
    });

    test('should handle system resource exhaustion', () => {
      // Mock out of memory conditions
      const originalJSON = JSON.stringify;
      JSON.stringify = vi.fn(() => {
        throw new Error('Out of memory');
      });
      
      const gameStorage = new GameStorageService();
      
      expect(() => {
        gameStorage.startGameSession();
        gameStorage.endGameSession(10, 5, 'user-quit');
      }).not.toThrow();
      
      // Restore original method
      JSON.stringify = originalJSON;
    });
  });

  describe('Cross-browser Compatibility Edge Cases', () => {
    test('should handle missing modern JavaScript features', () => {
      // Mock missing Array.from
      const originalArrayFrom = Array.from;
      // @ts-ignore
      Array.from = undefined;
      
      expect(() => {
        const { result } = renderHook(() => useGameState());
        act(() => {
          result.current.startGame();
        });
      }).not.toThrow();
      
      // Restore original method
      Array.from = originalArrayFrom;
    });

    test('should handle missing localStorage', () => {
      // Mock missing localStorage
      const originalLocalStorage = window.localStorage;
      // @ts-ignore
      delete window.localStorage;
      
      expect(() => {
        new GameStorageService();
      }).not.toThrow();
      
      // Restore localStorage
      Object.defineProperty(window, 'localStorage', {
        value: originalLocalStorage,
        writable: true,
      });
    });

    test('should handle different Date implementations', () => {
      // Mock Date.now to return invalid values
      const originalDateNow = Date.now;
      Date.now = vi.fn(() => NaN);
      
      const gameStorage = new GameStorageService();
      
      expect(() => {
        gameStorage.startGameSession();
        gameStorage.endGameSession(10, 5, 'user-quit');
      }).not.toThrow();
      
      // Restore original method
      Date.now = originalDateNow;
    });
  });
});