import { describe, test, expect } from 'vitest';
import { GAME_CONFIG, DIRECTIONS, INITIAL_SNAKE } from '../constants/gameConfig';

describe('Game Configuration', () => {
  describe('GAME_CONFIG', () => {
    test('should have correct board dimensions', () => {
      expect(GAME_CONFIG.BOARD_WIDTH).toBe(20);
      expect(GAME_CONFIG.BOARD_HEIGHT).toBe(20);
    });

    test('should have valid game speed settings', () => {
      expect(GAME_CONFIG.INITIAL_SPEED).toBe(150);
      expect(GAME_CONFIG.SPEED_INCREASE).toBe(10);
      expect(GAME_CONFIG.INITIAL_SPEED).toBeGreaterThan(0);
      expect(GAME_CONFIG.SPEED_INCREASE).toBeGreaterThan(0);
    });

    test('should have correct cell size', () => {
      expect(GAME_CONFIG.CELL_SIZE).toBe(20);
      expect(GAME_CONFIG.CELL_SIZE).toBeGreaterThan(0);
    });

    test('should have valid trap configuration', () => {
      expect(GAME_CONFIG.TRAP_SPAWN_MIN_INTERVAL).toBe(10000);
      expect(GAME_CONFIG.TRAP_SPAWN_MAX_INTERVAL).toBe(15000);
      expect(GAME_CONFIG.MAX_TRAPS).toBe(3);
      expect(GAME_CONFIG.TRAP_WARNING_DURATION).toBe(500);
      
      // Validate intervals make sense
      expect(GAME_CONFIG.TRAP_SPAWN_MIN_INTERVAL).toBeLessThan(GAME_CONFIG.TRAP_SPAWN_MAX_INTERVAL);
      expect(GAME_CONFIG.MAX_TRAPS).toBeGreaterThan(0);
      expect(GAME_CONFIG.TRAP_WARNING_DURATION).toBeGreaterThan(0);
    });

    test('should be immutable (readonly)', () => {
      expect(() => {
        // @ts-expect-error - testing readonly behavior
        GAME_CONFIG.BOARD_WIDTH = 30;
      }).toThrow();
    });
  });

  describe('DIRECTIONS', () => {
    test('should have all four directions', () => {
      expect(DIRECTIONS.UP).toEqual({ x: 0, y: -1 });
      expect(DIRECTIONS.DOWN).toEqual({ x: 0, y: 1 });
      expect(DIRECTIONS.LEFT).toEqual({ x: -1, y: 0 });
      expect(DIRECTIONS.RIGHT).toEqual({ x: 1, y: 0 });
    });

    test('should have opposite directions', () => {
      // UP and DOWN should be opposites
      expect(DIRECTIONS.UP.y).toBe(-DIRECTIONS.DOWN.y);
      expect(DIRECTIONS.UP.x).toBe(DIRECTIONS.DOWN.x);
      
      // LEFT and RIGHT should be opposites
      expect(DIRECTIONS.LEFT.x).toBe(-DIRECTIONS.RIGHT.x);
      expect(DIRECTIONS.LEFT.y).toBe(DIRECTIONS.RIGHT.y);
    });

    test('should have unit vectors', () => {
      Object.values(DIRECTIONS).forEach(direction => {
        const magnitude = Math.sqrt(direction.x * direction.x + direction.y * direction.y);
        expect(magnitude).toBe(1);
      });
    });

    test('should be immutable (readonly)', () => {
      expect(() => {
        // @ts-expect-error - testing readonly behavior
        DIRECTIONS.UP.x = 1;
      }).toThrow();
    });
  });

  describe('INITIAL_SNAKE', () => {
    test('should have correct initial position', () => {
      expect(INITIAL_SNAKE).toHaveLength(3);
      expect(INITIAL_SNAKE[0]).toEqual({ x: 10, y: 10 }); // head
      expect(INITIAL_SNAKE[1]).toEqual({ x: 9, y: 10 });  // body
      expect(INITIAL_SNAKE[2]).toEqual({ x: 8, y: 10 });  // tail
    });

    test('should form a horizontal line', () => {
      // All segments should be on the same row
      const yPositions = INITIAL_SNAKE.map(segment => segment.y);
      expect(new Set(yPositions).size).toBe(1);
      
      // X positions should decrease by 1 each segment
      for (let i = 1; i < INITIAL_SNAKE.length; i++) {
        expect(INITIAL_SNAKE[i].x).toBe(INITIAL_SNAKE[i - 1].x - 1);
      }
    });

    test('should be within board boundaries', () => {
      INITIAL_SNAKE.forEach(segment => {
        expect(segment.x).toBeGreaterThanOrEqual(0);
        expect(segment.x).toBeLessThan(GAME_CONFIG.BOARD_WIDTH);
        expect(segment.y).toBeGreaterThanOrEqual(0);
        expect(segment.y).toBeLessThan(GAME_CONFIG.BOARD_HEIGHT);
      });
    });

    test('should have head in center area', () => {
      const head = INITIAL_SNAKE[0];
      const centerX = Math.floor(GAME_CONFIG.BOARD_WIDTH / 2);
      const centerY = Math.floor(GAME_CONFIG.BOARD_HEIGHT / 2);
      
      expect(head.x).toBe(centerX);
      expect(head.y).toBe(centerY);
    });

    test('should have no overlapping segments', () => {
      const positions = INITIAL_SNAKE.map(segment => `${segment.x},${segment.y}`);
      expect(new Set(positions).size).toBe(INITIAL_SNAKE.length);
    });
  });

  describe('Configuration Consistency', () => {
    test('initial snake should fit in board', () => {
      const maxX = Math.max(...INITIAL_SNAKE.map(s => s.x));
      const minX = Math.min(...INITIAL_SNAKE.map(s => s.x));
      const maxY = Math.max(...INITIAL_SNAKE.map(s => s.y));
      const minY = Math.min(...INITIAL_SNAKE.map(s => s.y));
      
      expect(minX).toBeGreaterThanOrEqual(0);
      expect(maxX).toBeLessThan(GAME_CONFIG.BOARD_WIDTH);
      expect(minY).toBeGreaterThanOrEqual(0);
      expect(maxY).toBeLessThan(GAME_CONFIG.BOARD_HEIGHT);
    });

    test('trap intervals should be reasonable for gameplay', () => {
      // Minimum interval should allow some gameplay before first trap
      expect(GAME_CONFIG.TRAP_SPAWN_MIN_INTERVAL).toBeGreaterThanOrEqual(5000);
      
      // Maximum interval shouldn't be too long to keep game interesting
      expect(GAME_CONFIG.TRAP_SPAWN_MAX_INTERVAL).toBeLessThanOrEqual(30000);
      
      // Warning duration should be noticeable but not too long
      expect(GAME_CONFIG.TRAP_WARNING_DURATION).toBeGreaterThanOrEqual(200);
      expect(GAME_CONFIG.TRAP_WARNING_DURATION).toBeLessThanOrEqual(2000);
    });

    test('game speed should allow reasonable gameplay', () => {
      // Initial speed should not be too fast for beginners
      expect(GAME_CONFIG.INITIAL_SPEED).toBeGreaterThanOrEqual(100);
      expect(GAME_CONFIG.INITIAL_SPEED).toBeLessThanOrEqual(500);
      
      // Speed increase should be gradual
      expect(GAME_CONFIG.SPEED_INCREASE).toBeLessThanOrEqual(50);
    });

    test('cell size should work with typical screen sizes', () => {
      // Cell size should allow reasonable board size on common screens
      const boardPixelWidth = GAME_CONFIG.BOARD_WIDTH * GAME_CONFIG.CELL_SIZE;
      const boardPixelHeight = GAME_CONFIG.BOARD_HEIGHT * GAME_CONFIG.CELL_SIZE;
      
      expect(boardPixelWidth).toBeGreaterThanOrEqual(200); // Minimum usable size
      expect(boardPixelWidth).toBeLessThanOrEqual(1000);   // Maximum reasonable size
      expect(boardPixelHeight).toBeGreaterThanOrEqual(200);
      expect(boardPixelHeight).toBeLessThanOrEqual(1000);
    });
  });
});