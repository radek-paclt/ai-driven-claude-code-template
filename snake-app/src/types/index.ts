export interface Position {
  x: number;
  y: number;
}

export type SnakeSegment = Position;

export type Food = Position;

export interface Trap extends Position {
  id: string;
  spawnTime: number;
  isTriggered: boolean;
}

export interface Obstacle extends Position {
  id: string;
  width: number;
  height: number;
}

export type Direction = 'UP' | 'DOWN' | 'LEFT' | 'RIGHT';

export interface GameState {
  snake: SnakeSegment[];
  food: Food;
  traps: Trap[];
  obstacles: Obstacle[];
  direction: Direction;
  score: number;
  isGameOver: boolean;
  isPlaying: boolean;
  currentSpeed?: number;
  trapWarning?: Position;
  obstacleReshapeCountdown: number; // Countdown in seconds until obstacles reshape
}

export interface GameSettings {
  boardWidth: number;
  boardHeight: number;
  gameSpeed: number;
}

// Re-export storage types for convenience
export type {
  GameSession,
  GameEvent,
  GameStatistics,
  SavedGameState,
  GameStorageData,
} from '../services/gameStorage';

// Re-export performance evaluation types for convenience
export type {
  SkillLevel,
  TrendDirection,
  PerformanceMetrics,
  TrendAnalysis,
  PerformanceInsights,
} from '../services/performanceEvaluator';
