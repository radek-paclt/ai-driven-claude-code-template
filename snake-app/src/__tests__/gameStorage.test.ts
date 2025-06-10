import { vi } from 'vitest';
import { GameStorageService } from '../services/gameStorage';
import type { GameState } from '../types';

// Mock localStorage
let store: Record<string, string> = {};

const localStorageMock = {
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

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
  writable: true,
});

describe('GameStorageService', () => {
  let gameStorage: GameStorageService;

  beforeEach(() => {
    // Clear the store completely
    store = {};
    localStorageMock.clear();
    
    // Ensure the specific storage key is removed
    localStorageMock.removeItem('snake-game-data');
    
    // Create a fresh instance for each test
    gameStorage = new GameStorageService();
  });

  describe('Game Session Management', () => {
    test('should start and end a game session', () => {
      // Start session
      gameStorage.startGameSession();

      // Record some events
      gameStorage.recordEvent({
        type: 'food-eaten',
        position: { x: 5, y: 5 },
      });

      gameStorage.recordEvent({
        type: 'trap-hit',
        position: { x: 10, y: 10 },
      });

      // End session
      const success = gameStorage.endGameSession(15, 8, 'self-collision');
      expect(success).toBe(true);

      // Check history
      const history = gameStorage.getGameHistory();
      expect(history).toHaveLength(1);
      expect(history[0].score).toBe(15);
      expect(history[0].snakeLength).toBe(8);
      expect(history[0].endReason).toBe('self-collision');
      expect(history[0].trapsEncountered).toBe(1);
      expect(history[0].gameEvents).toHaveLength(2);
    });

    test('should update statistics correctly', () => {
      // Play first game
      gameStorage.startGameSession();
      gameStorage.recordEvent({
        type: 'food-eaten',
        position: { x: 1, y: 1 },
      });
      gameStorage.endGameSession(5, 6, 'self-collision');

      // Play second game
      gameStorage.startGameSession();
      gameStorage.recordEvent({
        type: 'food-eaten',
        position: { x: 2, y: 2 },
      });
      gameStorage.recordEvent({
        type: 'food-eaten',
        position: { x: 3, y: 3 },
      });
      gameStorage.endGameSession(10, 8, 'user-quit');

      const stats = gameStorage.getStatistics();
      expect(stats.totalGamesPlayed).toBe(2);
      expect(stats.bestScore).toBe(10);
      expect(stats.averageScore).toBe(7.5);
      expect(stats.totalFoodEaten).toBe(3);
    });
  });

  describe('Game State Persistence', () => {
    test('should save and load game state', () => {
      const mockGameState: GameState = {
        snake: [{ x: 5, y: 5 }, { x: 4, y: 5 }],
        food: { x: 10, y: 10 },
        traps: [],
        direction: 'RIGHT',
        score: 3,
        isGameOver: false,
        isPlaying: true,
      };

      gameStorage.startGameSession();
      const saveSuccess = gameStorage.saveGameState(mockGameState, 150);
      expect(saveSuccess).toBe(true);

      const savedGame = gameStorage.loadSavedGame();
      expect(savedGame).not.toBeNull();
      expect(savedGame!.gameState.score).toBe(3);
      expect(savedGame!.gameSpeed).toBe(150);
      expect(savedGame!.gameState.snake).toHaveLength(2);
    });

    test('should clear saved game', () => {
      const mockGameState: GameState = {
        snake: [{ x: 5, y: 5 }],
        food: { x: 10, y: 10 },
        traps: [],
        direction: 'RIGHT',
        score: 1,
        isGameOver: false,
        isPlaying: true,
      };

      gameStorage.startGameSession();
      gameStorage.saveGameState(mockGameState, 200);
      
      const clearSuccess = gameStorage.clearSavedGame();
      expect(clearSuccess).toBe(true);

      const savedGame = gameStorage.loadSavedGame();
      expect(savedGame).toBeNull();
    });
  });

  describe('Data Management', () => {
    test('should export and import data', () => {
      // Create some data
      gameStorage.startGameSession();
      gameStorage.recordEvent({
        type: 'food-eaten',
        position: { x: 1, y: 1 },
      });
      gameStorage.endGameSession(5, 6, 'self-collision');

      // Export data
      const exportedData = gameStorage.exportData();
      expect(typeof exportedData).toBe('string');

      // Clear and import
      gameStorage.clearHistory();
      const importSuccess = gameStorage.importData(exportedData);
      expect(importSuccess).toBe(true);

      // Verify data was restored
      const history = gameStorage.getGameHistory();
      expect(history).toHaveLength(1);
      expect(history[0].score).toBe(5);
    });

    test('should handle invalid import data', () => {
      const invalidData = '{"invalid": "data"}';
      const importSuccess = gameStorage.importData(invalidData);
      expect(importSuccess).toBe(false);
    });

    test('should clear history', () => {
      // Add some games
      gameStorage.startGameSession();
      gameStorage.endGameSession(5, 6, 'self-collision');
      gameStorage.startGameSession();
      gameStorage.endGameSession(10, 8, 'user-quit');

      expect(gameStorage.getGameHistory()).toHaveLength(2);

      // Clear history
      const clearSuccess = gameStorage.clearHistory();
      expect(clearSuccess).toBe(true);
      expect(gameStorage.getGameHistory()).toHaveLength(0);

      // Statistics should be reset but preserve session count
      const stats = gameStorage.getStatistics();
      expect(stats.totalGamesPlayed).toBe(0);
      expect(stats.bestScore).toBe(0);
    });
  });

  describe('Event Recording', () => {
    beforeEach(() => {
      gameStorage.startGameSession();
    });

    test('should record food eaten events', () => {
      gameStorage.recordEvent({
        type: 'food-eaten',
        position: { x: 5, y: 5 },
      });

      const stats = gameStorage.getStatistics();
      expect(stats.totalFoodEaten).toBe(1);
    });

    test('should record trap hit events', () => {
      gameStorage.recordEvent({
        type: 'trap-hit',
        position: { x: 5, y: 5 },
      });

      const stats = gameStorage.getStatistics();
      expect(stats.totalTrapsHit).toBe(1);
    });

    test('should record wall passthrough events', () => {
      gameStorage.recordEvent({
        type: 'wall-passthrough',
        position: { x: 0, y: 5 },
      });

      const stats = gameStorage.getStatistics();
      expect(stats.totalWallPassthroughs).toBe(1);
    });
  });

  describe('Storage Information', () => {
    test('should provide storage info', () => {
      const info = gameStorage.getStorageInfo();
      expect(typeof info.used).toBe('number');
      expect(typeof info.available).toBe('number');
      expect(typeof info.historyCount).toBe('number');
      expect(typeof info.hasSavedGame).toBe('boolean');
    });
  });

  describe('Static Methods', () => {
    test('should check localStorage availability', () => {
      const isAvailable = GameStorageService.isStorageAvailable();
      expect(isAvailable).toBe(true);
    });
  });

  describe('Error Handling', () => {
    test('should handle localStorage errors gracefully', () => {
      // Mock localStorage to throw error
      const originalSetItem = localStorage.setItem;
      localStorage.setItem = vi.fn(() => {
        throw new DOMException('QuotaExceededError');
      });

      gameStorage.startGameSession();
      const success = gameStorage.endGameSession(5, 6, 'self-collision');
      
      // Should handle error gracefully
      expect(success).toBe(false);

      // Restore original method
      localStorage.setItem = originalSetItem;
    });

    test('should not save game state without active session', () => {
      const mockGameState: GameState = {
        snake: [{ x: 5, y: 5 }],
        food: { x: 10, y: 10 },
        traps: [],
        direction: 'RIGHT',
        score: 1,
        isGameOver: false,
        isPlaying: true,
      };

      const success = gameStorage.saveGameState(mockGameState, 200);
      expect(success).toBe(false);
    });

    test('should not end session without active session', () => {
      const success = gameStorage.endGameSession(5, 6, 'self-collision');
      expect(success).toBe(false);
    });
  });
});