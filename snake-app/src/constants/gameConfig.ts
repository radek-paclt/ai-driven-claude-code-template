export const GAME_CONFIG = {
  BOARD_WIDTH: 40,
  BOARD_HEIGHT: 40,
  INITIAL_SPEED: 150,
  SPEED_INCREASE: 10,
  CELL_SIZE: 20,
  TRAP_SPAWN_MIN_INTERVAL: 10000, // 10 seconds
  TRAP_SPAWN_MAX_INTERVAL: 15000, // 15 seconds
  MAX_TRAPS: 8, // More traps for bigger board
  TRAP_WARNING_DURATION: 500, // 500ms warning before trap disappears
  // New obstacle settings
  OBSTACLES_COUNT: 15, // Number of permanent obstacles
  MIN_OBSTACLE_SIZE: 1, // Minimum obstacle size
  MAX_OBSTACLE_SIZE: 3, // Maximum obstacle size
  // Obstacle reshape timer settings
  OBSTACLE_RESHAPE_MIN_TIME: 30000, // 30 seconds
  OBSTACLE_RESHAPE_MAX_TIME: 45000, // 45 seconds
  SAFE_DISTANCE_FROM_SNAKE: 3, // Minimum distance from snake when reshaping
} as const;

export const DIRECTIONS = {
  UP: { x: 0, y: -1 },
  DOWN: { x: 0, y: 1 },
  LEFT: { x: -1, y: 0 },
  RIGHT: { x: 1, y: 0 },
} as const;

export const INITIAL_SNAKE = [
  { x: 20, y: 20 }, // Center of bigger board
  { x: 19, y: 20 },
  { x: 18, y: 20 },
];
