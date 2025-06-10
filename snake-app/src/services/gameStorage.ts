/**
 * Game Storage Service
 * Handles persistence of game data to localStorage including game history, 
 * statistics, and saved game states.
 */

import type { GameState, Position } from '../types';

const STORAGE_KEY = 'snake-game-data';
const MAX_HISTORY_SIZE = 50;

/**
 * Interface for a completed game session
 */
export interface GameSession {
  id: string;
  timestamp: number;
  score: number;
  duration: number; // in milliseconds
  snakeLength: number;
  trapsEncountered: number;
  gameEvents: GameEvent[];
  endReason: 'self-collision' | 'user-quit' | 'obstacle-collision';
}

/**
 * Interface for game events during a session
 */
export interface GameEvent {
  type: 'food-eaten' | 'trap-hit' | 'speed-increase' | 'wall-passthrough';
  timestamp: number;
  position: Position;
  data?: any; // Additional event-specific data
}

/**
 * Interface for aggregated game statistics
 */
export interface GameStatistics {
  totalGamesPlayed: number;
  bestScore: number;
  averageScore: number;
  totalPlaytime: number; // in milliseconds
  totalFoodEaten: number;
  totalTrapsHit: number;
  totalWallPassthroughs: number;
  gamesThisSession: number;
  lastPlayed: number;
}

/**
 * Interface for saved game state
 */
export interface SavedGameState {
  gameState: GameState;
  gameSpeed: number;
  sessionStartTime: number;
  events: GameEvent[];
  trapsEncountered: number;
}

/**
 * Main storage data structure
 */
export interface GameStorageData {
  version: number;
  history: GameSession[];
  statistics: GameStatistics;
  savedGame?: SavedGameState;
  settings: {
    autoSave: boolean;
    maxHistorySize: number;
  };
}

/**
 * Default storage data
 */
const DEFAULT_STORAGE_DATA: GameStorageData = {
  version: 1,
  history: [],
  statistics: {
    totalGamesPlayed: 0,
    bestScore: 0,
    averageScore: 0,
    totalPlaytime: 0,
    totalFoodEaten: 0,
    totalTrapsHit: 0,
    totalWallPassthroughs: 0,
    gamesThisSession: 0,
    lastPlayed: 0,
  },
  settings: {
    autoSave: true,
    maxHistorySize: MAX_HISTORY_SIZE,
  },
};

/**
 * Game Storage Service Class
 */
export class GameStorageService {
  private data: GameStorageData;
  private sessionStartTime: number = 0;
  private currentGameEvents: GameEvent[] = [];
  private trapsEncountered: number = 0;

  constructor() {
    this.data = this.loadData();
  }

  /**
   * Load data from localStorage with error handling
   */
  private loadData(): GameStorageData {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (!stored) {
        return { ...DEFAULT_STORAGE_DATA };
      }

      const parsed = JSON.parse(stored);
      
      // Validate and migrate if necessary
      if (!this.isValidStorageData(parsed)) {
        console.warn('Invalid storage data, resetting to defaults');
        return { ...DEFAULT_STORAGE_DATA };
      }

      // Migrate data if version is outdated
      return this.migrateData(parsed);
    } catch (error) {
      console.error('Failed to load game data from localStorage:', error);
      return { ...DEFAULT_STORAGE_DATA };
    }
  }

  /**
   * Save data to localStorage with error handling
   */
  private saveData(): boolean {
    try {
      // Ensure history doesn't exceed max size
      if (this.data.history.length > this.data.settings.maxHistorySize) {
        this.data.history = this.data.history
          .slice(-this.data.settings.maxHistorySize);
      }

      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.data));
      return true;
    } catch (error) {
      console.error('Failed to save game data to localStorage:', error);
      
      // If quota exceeded, try to free space by removing oldest games
      if (error instanceof DOMException && error.name === 'QuotaExceededError') {
        this.clearOldestGames(10);
        try {
          localStorage.setItem(STORAGE_KEY, JSON.stringify(this.data));
          return true;
        } catch (retryError) {
          console.error('Failed to save even after clearing space:', retryError);
        }
      }
      return false;
    }
  }

  /**
   * Validate storage data structure
   */
  private isValidStorageData(data: any): data is GameStorageData {
    return (
      data &&
      typeof data.version === 'number' &&
      Array.isArray(data.history) &&
      data.statistics &&
      typeof data.statistics.totalGamesPlayed === 'number' &&
      data.settings &&
      typeof data.settings.autoSave === 'boolean'
    );
  }

  /**
   * Migrate data between versions
   */
  private migrateData(data: any): GameStorageData {
    // Currently version 1, no migration needed
    // Future versions will handle migration here
    return data;
  }

  /**
   * Clear oldest games to free space
   */
  private clearOldestGames(count: number): void {
    this.data.history = this.data.history.slice(count);
  }

  /**
   * Start a new game session
   */
  public startGameSession(): void {
    this.sessionStartTime = Date.now();
    this.currentGameEvents = [];
    this.trapsEncountered = 0;
    this.data.statistics.gamesThisSession++;
  }

  /**
   * Record a game event
   */
  public recordEvent(event: Omit<GameEvent, 'timestamp'>): void {
    const gameEvent: GameEvent = {
      ...event,
      timestamp: Date.now(),
    };
    
    this.currentGameEvents.push(gameEvent);

    // Track specific event types in statistics
    switch (event.type) {
      case 'food-eaten':
        this.data.statistics.totalFoodEaten++;
        break;
      case 'trap-hit':
        this.data.statistics.totalTrapsHit++;
        this.trapsEncountered++;
        break;
      case 'wall-passthrough':
        this.data.statistics.totalWallPassthroughs++;
        break;
    }
  }

  /**
   * End current game session and save to history
   */
  public endGameSession(
    finalScore: number,
    snakeLength: number,
    endReason: 'self-collision' | 'user-quit' | 'obstacle-collision'
  ): boolean {
    if (this.sessionStartTime === 0) {
      return false; // No active session
    }

    const duration = Date.now() - this.sessionStartTime;
    
    const gameSession: GameSession = {
      id: `game_${this.sessionStartTime}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: this.sessionStartTime,
      score: finalScore,
      duration,
      snakeLength,
      trapsEncountered: this.trapsEncountered,
      gameEvents: [...this.currentGameEvents],
      endReason,
    };

    // Add to history
    this.data.history.push(gameSession);

    // Update statistics
    this.data.statistics.totalGamesPlayed++;
    this.data.statistics.totalPlaytime += duration;
    this.data.statistics.lastPlayed = Date.now();
    
    if (finalScore > this.data.statistics.bestScore) {
      this.data.statistics.bestScore = finalScore;
    }

    // Recalculate average score
    const totalScore = this.data.history.reduce((sum, game) => sum + game.score, 0);
    this.data.statistics.averageScore = totalScore / this.data.statistics.totalGamesPlayed;

    // Clear saved game on session end
    this.data.savedGame = undefined;

    // Reset session tracking
    this.sessionStartTime = 0;
    this.currentGameEvents = [];
    this.trapsEncountered = 0;

    return this.saveData();
  }

  /**
   * Save current game state for resuming later
   */
  public saveGameState(gameState: GameState, gameSpeed: number): boolean {
    if (this.sessionStartTime === 0) {
      return false; // No active session
    }

    this.data.savedGame = {
      gameState: { ...gameState },
      gameSpeed,
      sessionStartTime: this.sessionStartTime,
      events: [...this.currentGameEvents],
      trapsEncountered: this.trapsEncountered,
    };

    return this.saveData();
  }

  /**
   * Load saved game state
   */
  public loadSavedGame(): SavedGameState | null {
    return this.data.savedGame || null;
  }

  /**
   * Resume from saved game
   */
  public resumeSavedGame(): boolean {
    const saved = this.data.savedGame;
    if (!saved) {
      return false;
    }

    this.sessionStartTime = saved.sessionStartTime;
    this.currentGameEvents = [...saved.events];
    this.trapsEncountered = saved.trapsEncountered;

    return true;
  }

  /**
   * Clear saved game
   */
  public clearSavedGame(): boolean {
    this.data.savedGame = undefined;
    return this.saveData();
  }

  /**
   * Get game history
   */
  public getGameHistory(): GameSession[] {
    return [...this.data.history].reverse(); // Most recent first
  }

  /**
   * Get game statistics
   */
  public getStatistics(): GameStatistics {
    return { ...this.data.statistics };
  }

  /**
   * Clear all game history
   */
  public clearHistory(): boolean {
    this.data.history = [];
    this.data.statistics = {
      ...DEFAULT_STORAGE_DATA.statistics,
      gamesThisSession: this.data.statistics.gamesThisSession,
    };
    return this.saveData();
  }

  /**
   * Export all game data as JSON
   */
  public exportData(): string {
    return JSON.stringify(this.data, null, 2);
  }

  /**
   * Import game data from JSON
   */
  public importData(jsonData: string): boolean {
    try {
      const imported = JSON.parse(jsonData);
      if (this.isValidStorageData(imported)) {
        this.data = this.migrateData(imported);
        return this.saveData();
      }
      return false;
    } catch (error) {
      console.error('Failed to import data:', error);
      return false;
    }
  }

  /**
   * Get storage usage info
   */
  public getStorageInfo(): {
    used: number;
    available: number;
    historyCount: number;
    hasSavedGame: boolean;
  } {
    const dataString = JSON.stringify(this.data);
    const used = new Blob([dataString]).size;
    
    // Rough estimate of available localStorage space
    const available = 5 * 1024 * 1024 - used; // 5MB typical limit minus used
    
    return {
      used,
      available: Math.max(0, available),
      historyCount: this.data.history.length,
      hasSavedGame: !!this.data.savedGame,
    };
  }

  /**
   * Check if localStorage is available
   */
  public static isStorageAvailable(): boolean {
    try {
      const test = '__localStorage_test__';
      localStorage.setItem(test, 'test');
      localStorage.removeItem(test);
      return true;
    } catch {
      return false;
    }
  }
}

// Export singleton instance
export const gameStorage = new GameStorageService();