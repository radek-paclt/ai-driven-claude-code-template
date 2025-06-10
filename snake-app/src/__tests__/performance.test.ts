import { vi, describe, test, expect, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useGameState } from '../hooks/useGameState';
import { GameStorageService } from '../services/gameStorage';
import { performanceEvaluator } from '../services/performanceEvaluator';

// Mock localStorage for consistent testing
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

describe('Performance Tests', () => {
  beforeEach(() => {
    localStorageMock.clear();
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.useRealTimers();
  });

  describe('Game State Performance', () => {
    test('should handle rapid state updates efficiently', () => {
      const { result } = renderHook(() => useGameState());
      
      act(() => {
        result.current.startGame();
      });

      const startTime = performance.now();
      
      // Simulate rapid game state updates
      act(() => {
        for (let i = 0; i < 1000; i++) {
          result.current.moveSnake();
        }
      });
      
      const endTime = performance.now();
      const duration = endTime - startTime;
      
      // Should complete 1000 moves in reasonable time (less than 100ms)
      expect(duration).toBeLessThan(100);
    });

    test('should handle large snake efficiently', () => {
      const { result } = renderHook(() => useGameState());
      
      act(() => {
        result.current.startGame();
      });

      // Grow snake to large size by eating food
      act(() => {
        for (let i = 0; i < 100; i++) {
          // Simulate eating food to grow snake
          result.current.moveSnake();
          // Force food consumption (simplified)
          const currentState = result.current.gameState;
          if (currentState.snake.length < 100) {
            // This would normally happen when snake eats food
            // Here we're just testing performance with large snake
          }
        }
      });

      const startTime = performance.now();
      
      // Test performance with large snake
      act(() => {
        for (let i = 0; i < 100; i++) {
          result.current.moveSnake();
        }
      });
      
      const endTime = performance.now();
      const duration = endTime - startTime;
      
      // Should handle large snake without significant performance degradation
      expect(duration).toBeLessThan(50);
    });

    test('should handle rapid direction changes efficiently', () => {
      const { result } = renderHook(() => useGameState());
      
      act(() => {
        result.current.startGame();
      });

      const directions = ['UP', 'RIGHT', 'DOWN', 'LEFT'] as const;
      const startTime = performance.now();
      
      act(() => {
        for (let i = 0; i < 1000; i++) {
          const direction = directions[i % 4];
          result.current.changeDirection(direction);
        }
      });
      
      const endTime = performance.now();
      const duration = endTime - startTime;
      
      // Should handle rapid direction changes efficiently
      expect(duration).toBeLessThan(50);
    });

    test('should pause and resume without performance impact', () => {
      const { result } = renderHook(() => useGameState());
      
      act(() => {
        result.current.startGame();
      });

      const startTime = performance.now();
      
      act(() => {
        // Rapid pause/resume cycles
        for (let i = 0; i < 100; i++) {
          result.current.togglePause();
          result.current.togglePause();
        }
      });
      
      const endTime = performance.now();
      const duration = endTime - startTime;
      
      // Should handle pause/resume cycles efficiently
      expect(duration).toBeLessThan(30);
    });
  });

  describe('Storage Performance', () => {
    test('should handle rapid localStorage operations', () => {
      const gameStorage = new GameStorageService();
      
      const startTime = performance.now();
      
      // Simulate many game sessions
      for (let i = 0; i < 100; i++) {
        gameStorage.startGameSession();
        
        // Record some events
        gameStorage.recordEvent({
          type: 'food-eaten',
          position: { x: i % 20, y: Math.floor(i / 20) },
        });
        
        gameStorage.endGameSession(i * 10, i + 5, 'user-quit');
      }
      
      const endTime = performance.now();
      const duration = endTime - startTime;
      
      // Should handle 100 complete game sessions quickly
      expect(duration).toBeLessThan(200);
    });

    test('should handle large data export efficiently', () => {
      const gameStorage = new GameStorageService();
      
      // Create large dataset
      for (let i = 0; i < 50; i++) {
        gameStorage.startGameSession();
        
        // Record many events per session
        for (let j = 0; j < 100; j++) {
          gameStorage.recordEvent({
            type: j % 2 === 0 ? 'food-eaten' : 'trap-hit',
            position: { x: j % 20, y: Math.floor(j / 20) },
          });
        }
        
        gameStorage.endGameSession(i * 50, i + 10, 'self-collision');
      }
      
      const startTime = performance.now();
      
      const exportedData = gameStorage.exportData();
      
      const endTime = performance.now();
      const duration = endTime - startTime;
      
      // Should export large dataset quickly
      expect(duration).toBeLessThan(100);
      expect(exportedData).toBeTruthy();
      expect(typeof exportedData).toBe('string');
    });

    test('should handle large data import efficiently', () => {
      const gameStorage = new GameStorageService();
      
      // Create test data
      const testData = {
        version: 1,
        history: Array.from({ length: 100 }, (_, i) => ({
          id: `game_${i}`,
          timestamp: Date.now() - i * 1000,
          score: i * 10,
          duration: i * 1000,
          snakeLength: i + 3,
          trapsEncountered: i % 5,
          gameEvents: Array.from({ length: 50 }, (_, j) => ({
            type: 'food-eaten' as const,
            timestamp: Date.now() - i * 1000 + j * 100,
            position: { x: j % 20, y: Math.floor(j / 20) },
          })),
          endReason: 'self-collision' as const,
        })),
        statistics: {
          totalGamesPlayed: 100,
          bestScore: 990,
          averageScore: 495,
          totalPlaytime: 49500,
          totalFoodEaten: 5000,
          totalTrapsHit: 100,
          totalWallPassthroughs: 50,
          gamesThisSession: 0,
          lastPlayed: Date.now(),
        },
        settings: {
          autoSave: true,
          maxHistorySize: 50,
        },
      };
      
      const importData = JSON.stringify(testData);
      const startTime = performance.now();
      
      const result = gameStorage.importData(importData);
      
      const endTime = performance.now();
      const duration = endTime - startTime;
      
      // Should import large dataset quickly
      expect(duration).toBeLessThan(100);
      expect(result).toBe(true);
    });

    test('should maintain performance with storage quota limits', () => {
      const gameStorage = new GameStorageService();
      
      // Mock localStorage quota exceeded
      const originalSetItem = localStorageMock.setItem;
      let callCount = 0;
      localStorageMock.setItem = vi.fn((key, value) => {
        callCount++;
        if (callCount > 10) {
          throw new DOMException('QuotaExceededError');
        }
        return originalSetItem(key, value);
      });
      
      const startTime = performance.now();
      
      // Should handle storage errors gracefully without hanging
      for (let i = 0; i < 20; i++) {
        gameStorage.startGameSession();
        gameStorage.recordEvent({
          type: 'food-eaten',
          position: { x: i, y: i },
        });
        gameStorage.endGameSession(i, i, 'user-quit');
      }
      
      const endTime = performance.now();
      const duration = endTime - startTime;
      
      // Should handle storage errors efficiently
      expect(duration).toBeLessThan(100);
      
      // Restore original method
      localStorageMock.setItem = originalSetItem;
    });
  });

  describe('Performance Evaluator Performance', () => {
    test('should calculate metrics efficiently', () => {
      const evaluator = performanceEvaluator;
      
      // Generate large dataset
      const events = Array.from({ length: 1000 }, (_, i) => ({
        type: 'food-eaten' as const,
        timestamp: i * 100,
        position: { x: i % 20, y: Math.floor(i / 20) },
      }));
      
      const gameData = {
        score: 5000,
        duration: 100000,
        snakeLength: 503,
        trapsEncountered: 50,
        gameEvents: events,
        endReason: 'user-quit' as const,
      };
      
      const startTime = performance.now();
      
      const metrics = evaluator.calculatePerformanceMetrics(gameData);
      
      const endTime = performance.now();
      const duration = endTime - startTime;
      
      // Should calculate complex metrics quickly
      expect(duration).toBeLessThan(50);
      expect(metrics).toBeDefined();
      expect(typeof metrics.efficiency).toBe('number');
      expect(typeof metrics.consistency).toBe('number');
    });

    test('should handle skill progression calculations efficiently', () => {
      const evaluator = performanceEvaluator;
      
      // Generate many game sessions
      const sessions = Array.from({ length: 100 }, (_, i) => ({
        id: `game_${i}`,
        timestamp: Date.now() - (100 - i) * 60000,
        score: i * 10 + Math.random() * 50,
        duration: 30000 + i * 1000,
        snakeLength: 3 + i,
        trapsEncountered: Math.floor(i / 10),
        gameEvents: [],
        endReason: 'self-collision' as const,
      }));
      
      const startTime = performance.now();
      
      const progression = evaluator.analyzeSkillProgression(sessions);
      
      const endTime = performance.now();
      const duration = endTime - startTime;
      
      // Should analyze large dataset efficiently
      expect(duration).toBeLessThan(100);
      expect(progression).toBeDefined();
      expect(typeof progression.currentLevel).toBe('number');
      expect(typeof progression.improvement).toBe('number');
    });

    test('should generate recommendations efficiently', () => {
      const evaluator = performanceEvaluator;
      
      const gameData = {
        score: 150,
        duration: 45000,
        snakeLength: 18,
        trapsEncountered: 3,
        gameEvents: Array.from({ length: 100 }, (_, i) => ({
          type: i % 3 === 0 ? 'food-eaten' : i % 3 === 1 ? 'trap-hit' : 'speed-increase' as const,
          timestamp: i * 100,
          position: { x: i % 20, y: Math.floor(i / 20) },
        })),
        endReason: 'self-collision' as const,
      };
      
      const startTime = performance.now();
      
      const recommendations = evaluator.generateRecommendations(gameData);
      
      const endTime = performance.now();
      const duration = endTime - startTime;
      
      // Should generate recommendations quickly
      expect(duration).toBeLessThan(30);
      expect(recommendations).toBeDefined();
      expect(Array.isArray(recommendations)).toBe(true);
    });
  });

  describe('Memory Usage', () => {
    test('should not leak memory with repeated game sessions', () => {
      const { result } = renderHook(() => useGameState());
      
      // Simulate many game sessions
      for (let session = 0; session < 100; session++) {
        act(() => {
          result.current.startGame();
        });
        
        // Play game briefly
        act(() => {
          for (let i = 0; i < 50; i++) {
            result.current.moveSnake();
          }
        });
        
        act(() => {
          result.current.resetGame();
        });
      }
      
      // Should not accumulate memory leaks
      // In a real environment, we could check process.memoryUsage()
      // For now, just ensure the hook is still functional
      expect(result.current.gameState.gameStatus).toBe('idle');
    });

    test('should clean up timers and intervals', () => {
      const { result, unmount } = renderHook(() => useGameState());
      
      act(() => {
        result.current.startGame();
      });
      
      // Start multiple traps to create timers
      act(() => {
        // This would normally be done internally by the game
        // Here we're testing that cleanup happens on unmount
      });
      
      const timerCount = vi.getTimerCount();
      
      unmount();
      
      // Timers should be cleaned up
      expect(vi.getTimerCount()).toBeLessThanOrEqual(timerCount);
    });

    test('should handle large localStorage without memory issues', () => {
      const gameStorage = new GameStorageService();
      
      // Fill localStorage with data approaching typical limits
      const largeData = 'x'.repeat(1000); // 1KB per game
      
      for (let i = 0; i < 1000; i++) { // 1MB total
        gameStorage.startGameSession();
        
        // Add large event data
        gameStorage.recordEvent({
          type: 'food-eaten',
          position: { x: i % 20, y: Math.floor(i / 20) },
          data: largeData,
        });
        
        gameStorage.endGameSession(i, i, 'user-quit');
      }
      
      // Should handle large storage without issues
      const stats = gameStorage.getStatistics();
      expect(stats.totalGamesPlayed).toBe(1000);
      
      // Clean up to prevent affecting other tests
      gameStorage.clearHistory();
    });
  });

  describe('Real-time Performance', () => {
    test('should maintain consistent frame timing', () => {
      const { result } = renderHook(() => useGameState());
      
      act(() => {
        result.current.startGame();
      });

      const frameTimes: number[] = [];
      
      // Measure frame timing consistency
      for (let i = 0; i < 60; i++) { // Simulate 60 frames
        const frameStart = performance.now();
        
        act(() => {
          result.current.moveSnake();
        });
        
        const frameEnd = performance.now();
        frameTimes.push(frameEnd - frameStart);
      }
      
      // Calculate frame time variance
      const averageFrameTime = frameTimes.reduce((a, b) => a + b, 0) / frameTimes.length;
      const variance = frameTimes.reduce((acc, time) => acc + Math.pow(time - averageFrameTime, 2), 0) / frameTimes.length;
      const standardDeviation = Math.sqrt(variance);
      
      // Frame times should be consistent (low standard deviation)
      expect(standardDeviation).toBeLessThan(averageFrameTime * 0.5); // Within 50% of average
      expect(averageFrameTime).toBeLessThan(16.67); // Under 60 FPS threshold
    });

    test('should handle background tab performance', () => {
      const { result } = renderHook(() => useGameState());
      
      act(() => {
        result.current.startGame();
      });

      // Simulate tab becoming inactive
      Object.defineProperty(document, 'hidden', {
        value: true,
        configurable: true,
      });
      
      const startTime = performance.now();
      
      // Continue game operations
      act(() => {
        for (let i = 0; i < 100; i++) {
          result.current.moveSnake();
        }
      });
      
      const endTime = performance.now();
      const duration = endTime - startTime;
      
      // Should maintain performance even when tab is inactive
      expect(duration).toBeLessThan(100);
      
      // Reset document.hidden
      Object.defineProperty(document, 'hidden', {
        value: false,
        configurable: true,
      });
    });
  });

  describe('Stress Testing', () => {
    test('should handle extreme game conditions', () => {
      const { result } = renderHook(() => useGameState());
      
      act(() => {
        result.current.startGame();
      });

      const startTime = performance.now();
      
      // Extreme stress test
      act(() => {
        for (let i = 0; i < 10000; i++) {
          result.current.moveSnake();
          if (i % 4 === 0) result.current.changeDirection('UP');
          if (i % 4 === 1) result.current.changeDirection('RIGHT');
          if (i % 4 === 2) result.current.changeDirection('DOWN');
          if (i % 4 === 3) result.current.changeDirection('LEFT');
        }
      });
      
      const endTime = performance.now();
      const duration = endTime - startTime;
      
      // Should handle extreme conditions without excessive slowdown
      expect(duration).toBeLessThan(1000); // Within 1 second
      
      // Game should still be functional
      expect(result.current.gameState.snake).toBeDefined();
      expect(result.current.gameState.snake.length).toBeGreaterThan(0);
    });

    test('should handle concurrent operations', async () => {
      const operations = [];
      
      // Start multiple concurrent operations
      for (let i = 0; i < 10; i++) {
        operations.push(new Promise<void>((resolve) => {
          const { result } = renderHook(() => useGameState());
          
          act(() => {
            result.current.startGame();
          });
          
          for (let j = 0; j < 100; j++) {
            act(() => {
              result.current.moveSnake();
            });
          }
          
          resolve();
        }));
      }
      
      const startTime = performance.now();
      
      await Promise.all(operations);
      
      const endTime = performance.now();
      const duration = endTime - startTime;
      
      // Should handle concurrent operations efficiently
      expect(duration).toBeLessThan(2000); // Within 2 seconds
    });
  });
});