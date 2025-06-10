import { useState, useCallback, useRef, useEffect } from 'react';
import type { GameState, Direction, Position, SnakeSegment, Trap, Obstacle } from '../types';
import {
  GAME_CONFIG,
  DIRECTIONS,
  INITIAL_SNAKE,
} from '../constants/gameConfig';
import { gameStorage } from '../services/gameStorage';

/**
 * Custom hook for managing the core game state and logic.
 * Handles snake movement, food generation, collision detection, and scoring.
 */
export const useGameState = (boardWidth: number = 40, boardHeight: number = 40) => {
  const [gameState, setGameState] = useState<GameState>(() => {
    // Try to load saved game first
    const savedGame = gameStorage.loadSavedGame();
    if (savedGame) {
      return savedGame.gameState;
    }
    
    const obstacles = generateObstacles();
    const reshapeTime = GAME_CONFIG.OBSTACLE_RESHAPE_MIN_TIME + 
      Math.random() * (GAME_CONFIG.OBSTACLE_RESHAPE_MAX_TIME - GAME_CONFIG.OBSTACLE_RESHAPE_MIN_TIME);
    return {
      snake: [...INITIAL_SNAKE],
      food: generateRandomFood(INITIAL_SNAKE, [], obstacles),
      traps: [],
      obstacles,
      direction: 'RIGHT',
      score: 0,
      isGameOver: false,
      isPlaying: false,
      obstacleReshapeCountdown: Math.floor(reshapeTime / 1000), // Convert to seconds
    };
  });

  const gameSpeedRef = useRef<number>((() => {
    const savedGame = gameStorage.loadSavedGame();
    return savedGame ? savedGame.gameSpeed : GAME_CONFIG.INITIAL_SPEED;
  })());
  const trapSpawnTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const obstacleReshapeTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const gameSessionActiveRef = useRef<boolean>(false);

  /**
   * Generates random obstacles for the game board
   */
  function generateObstacles(): Obstacle[] {
    const obstacles: Obstacle[] = [];
    const usedPositions = new Set<string>();
    
    // Add initial snake area to avoid placing obstacles there
    INITIAL_SNAKE.forEach(segment => {
      for (let dx = -3; dx <= 3; dx++) {
        for (let dy = -3; dy <= 3; dy++) {
          const x = segment.x + dx;
          const y = segment.y + dy;
          if (x >= 0 && x < boardWidth && y >= 0 && y < boardHeight) {
            usedPositions.add(`${x},${y}`);
          }
        }
      }
    });

    for (let i = 0; i < GAME_CONFIG.OBSTACLES_COUNT; i++) {
      let attempts = 0;
      const maxAttempts = 100;
      
      while (attempts < maxAttempts) {
        const width = Math.floor(Math.random() * (GAME_CONFIG.MAX_OBSTACLE_SIZE - GAME_CONFIG.MIN_OBSTACLE_SIZE + 1)) + GAME_CONFIG.MIN_OBSTACLE_SIZE;
        const height = Math.floor(Math.random() * (GAME_CONFIG.MAX_OBSTACLE_SIZE - GAME_CONFIG.MIN_OBSTACLE_SIZE + 1)) + GAME_CONFIG.MIN_OBSTACLE_SIZE;
        
        const x = Math.floor(Math.random() * (boardWidth - width));
        const y = Math.floor(Math.random() * (boardHeight - height));
        
        // Check if this position conflicts with existing obstacles or reserved areas
        let hasConflict = false;
        for (let dx = 0; dx < width; dx++) {
          for (let dy = 0; dy < height; dy++) {
            if (usedPositions.has(`${x + dx},${y + dy}`)) {
              hasConflict = true;
              break;
            }
          }
          if (hasConflict) break;
        }
        
        if (!hasConflict) {
          obstacles.push({
            id: `obstacle_${i}`,
            x,
            y,
            width,
            height,
          });
          
          // Mark all positions as used
          for (let dx = 0; dx < width; dx++) {
            for (let dy = 0; dy < height; dy++) {
              usedPositions.add(`${x + dx},${y + dy}`);
            }
          }
          break;
        }
        attempts++;
      }
    }
    
    return obstacles;
  }

  /**
   * Generates safe obstacles that don't interfere with current snake position
   */
  function generateSafeObstacles(currentSnake: SnakeSegment[]): Obstacle[] {
    const obstacles: Obstacle[] = [];
    const usedPositions = new Set<string>();
    
    // Add snake area and safe zone around it
    currentSnake.forEach(segment => {
      for (let dx = -GAME_CONFIG.SAFE_DISTANCE_FROM_SNAKE; dx <= GAME_CONFIG.SAFE_DISTANCE_FROM_SNAKE; dx++) {
        for (let dy = -GAME_CONFIG.SAFE_DISTANCE_FROM_SNAKE; dy <= GAME_CONFIG.SAFE_DISTANCE_FROM_SNAKE; dy++) {
          const x = segment.x + dx;
          const y = segment.y + dy;
          if (x >= 0 && x < boardWidth && y >= 0 && y < boardHeight) {
            usedPositions.add(`${x},${y}`);
          }
        }
      }
    });

    for (let i = 0; i < GAME_CONFIG.OBSTACLES_COUNT; i++) {
      let attempts = 0;
      const maxAttempts = 200; // More attempts for safe generation
      
      while (attempts < maxAttempts) {
        const width = Math.floor(Math.random() * (GAME_CONFIG.MAX_OBSTACLE_SIZE - GAME_CONFIG.MIN_OBSTACLE_SIZE + 1)) + GAME_CONFIG.MIN_OBSTACLE_SIZE;
        const height = Math.floor(Math.random() * (GAME_CONFIG.MAX_OBSTACLE_SIZE - GAME_CONFIG.MIN_OBSTACLE_SIZE + 1)) + GAME_CONFIG.MIN_OBSTACLE_SIZE;
        
        const x = Math.floor(Math.random() * (boardWidth - width));
        const y = Math.floor(Math.random() * (boardHeight - height));
        
        // Check if this position conflicts with existing obstacles or reserved areas
        let hasConflict = false;
        for (let dx = 0; dx < width; dx++) {
          for (let dy = 0; dy < height; dy++) {
            if (usedPositions.has(`${x + dx},${y + dy}`)) {
              hasConflict = true;
              break;
            }
          }
          if (hasConflict) break;
        }
        
        if (!hasConflict) {
          obstacles.push({
            id: `obstacle_reshape_${Date.now()}_${i}`,
            x,
            y,
            width,
            height,
          });
          
          // Mark all positions as used
          for (let dx = 0; dx < width; dx++) {
            for (let dy = 0; dy < height; dy++) {
              usedPositions.add(`${x + dx},${y + dy}`);
            }
          }
          break;
        }
        attempts++;
      }
    }
    
    return obstacles;
  }

  /**
   * Checks if a position collides with any obstacle
   */
  function isObstacleCollision(position: Position, obstacles: Obstacle[]): boolean {
    return obstacles.some(obstacle => 
      position.x >= obstacle.x &&
      position.x < obstacle.x + obstacle.width &&
      position.y >= obstacle.y &&
      position.y < obstacle.y + obstacle.height
    );
  }

  /**
   * Generates a random food position that doesn't overlap with the snake, traps, or obstacles
   */
  function generateRandomFood(snake: SnakeSegment[], traps: Trap[] = [], obstacles: Obstacle[] = []): Position {
    let newFood: Position;
    let attempts = 0;
    const maxAttempts = 100;

    do {
      newFood = {
        x: Math.floor(Math.random() * boardWidth),
        y: Math.floor(Math.random() * boardHeight),
      };
      attempts++;
    } while (
      attempts < maxAttempts &&
      (snake.some(segment => segment.x === newFood.x && segment.y === newFood.y) ||
       traps.some(trap => trap.x === newFood.x && trap.y === newFood.y) ||
       isObstacleCollision(newFood, obstacles))
    );

    return newFood;
  }

  /**
   * Generates a random trap position that doesn't overlap with snake, food, obstacles, or other traps
   */
  const generateRandomTrap = useCallback((snake: SnakeSegment[], food: Position, existingTraps: Trap[], obstacles: Obstacle[]): Trap | null => {
    let newTrap: Position;
    let attempts = 0;
    const maxAttempts = 100;

    do {
      newTrap = {
        x: Math.floor(Math.random() * boardWidth),
        y: Math.floor(Math.random() * boardHeight),
      };
      attempts++;
    } while (
      attempts < maxAttempts &&
      (snake.some(segment => segment.x === newTrap.x && segment.y === newTrap.y) ||
       (food.x === newTrap.x && food.y === newTrap.y) ||
       existingTraps.some(trap => trap.x === newTrap.x && trap.y === newTrap.y) ||
       isObstacleCollision(newTrap, obstacles))
    );

    if (attempts >= maxAttempts) {
      return null; // Couldn't find a valid position
    }

    return {
      id: `trap_${Date.now()}_${Math.random()}`,
      x: newTrap.x,
      y: newTrap.y,
      spawnTime: Date.now(),
      isTriggered: false,
    };
  }, []);

  /**
   * Schedules the next trap spawn
   */
  const scheduleNextTrap = useCallback(() => {
    if (trapSpawnTimerRef.current) {
      clearTimeout(trapSpawnTimerRef.current);
    }

    const spawnDelay = Math.random() * 
      (GAME_CONFIG.TRAP_SPAWN_MAX_INTERVAL - GAME_CONFIG.TRAP_SPAWN_MIN_INTERVAL) + 
      GAME_CONFIG.TRAP_SPAWN_MIN_INTERVAL;

    trapSpawnTimerRef.current = setTimeout(() => {
      setGameState(prevState => {
        if (!prevState.isPlaying || prevState.isGameOver || prevState.traps.length >= GAME_CONFIG.MAX_TRAPS) {
          return prevState;
        }

        const newTrap = generateRandomTrap(prevState.snake, prevState.food, prevState.traps, prevState.obstacles);
        if (!newTrap) {
          return prevState; // Couldn't generate trap
        }

        return {
          ...prevState,
          traps: [...prevState.traps, newTrap],
        };
      });

      // Schedule next trap
      scheduleNextTrap();
    }, spawnDelay);
  }, [generateRandomTrap]);

  /**
   * Starts the obstacle reshape countdown timer
   */
  const startObstacleReshapeTimer = useCallback(() => {
    if (obstacleReshapeTimerRef.current) {
      clearInterval(obstacleReshapeTimerRef.current);
    }

    obstacleReshapeTimerRef.current = setInterval(() => {
      setGameState(prevState => {
        if (!prevState.isPlaying || prevState.isGameOver) {
          return prevState;
        }

        const newCountdown = prevState.obstacleReshapeCountdown - 1;
        
        if (newCountdown <= 0) {
          // Time to reshape obstacles!
          const newObstacles = generateSafeObstacles(prevState.snake);
          const newFood = generateRandomFood(prevState.snake, prevState.traps, newObstacles);
          
          // Generate new countdown time
          const reshapeTime = GAME_CONFIG.OBSTACLE_RESHAPE_MIN_TIME + 
            Math.random() * (GAME_CONFIG.OBSTACLE_RESHAPE_MAX_TIME - GAME_CONFIG.OBSTACLE_RESHAPE_MIN_TIME);
          
          return {
            ...prevState,
            obstacles: newObstacles,
            food: newFood,
            obstacleReshapeCountdown: Math.floor(reshapeTime / 1000),
          };
        }
        
        return {
          ...prevState,
          obstacleReshapeCountdown: newCountdown,
        };
      });
    }, 1000); // Update every second
  }, []);

  /**
   * Stops the obstacle reshape timer
   */
  const stopObstacleReshapeTimer = useCallback(() => {
    if (obstacleReshapeTimerRef.current) {
      clearInterval(obstacleReshapeTimerRef.current);
      obstacleReshapeTimerRef.current = null;
    }
  }, []);

  /**
   * Reduces snake length by half when hitting a trap
   */
  const reduceSnakeLength = useCallback((snake: SnakeSegment[]): SnakeSegment[] => {
    const newLength = Math.max(1, Math.floor(snake.length / 2));
    return snake.slice(0, newLength);
  }, []);

  /**
   * Checks if the snake has collided with itself
   */
  const checkSelfCollision = useCallback((snake: SnakeSegment[]): boolean => {
    const head = snake[0];
    return snake
      .slice(1)
      .some(segment => segment.x === head.x && segment.y === head.y);
  }, []);

  /**
   * Handles wall passthrough by wrapping coordinates around the board
   */
  const wrapPosition = useCallback((position: Position): Position => {
    return {
      x: ((position.x % boardWidth) + boardWidth) % boardWidth,
      y: ((position.y % boardHeight) + boardHeight) % boardHeight,
    };
  }, []);

  /**
   * Moves the snake in the current direction and handles game logic
   */
  const moveSnake = useCallback(() => {
    setGameState(prevState => {
      if (!prevState.isPlaying || prevState.isGameOver) {
        return prevState;
      }

      const { snake, direction, food, score, traps, obstacles } = prevState;
      const head = snake[0];
      const directionVector = DIRECTIONS[direction];

      // Calculate new head position
      const rawNewHead: Position = {
        x: head.x + directionVector.x,
        y: head.y + directionVector.y,
      };

      // Handle wall passthrough - wrap around instead of collision
      const newHead = wrapPosition(rawNewHead);
      
      // Record wall passthrough event if position wrapped
      if (rawNewHead.x !== newHead.x || rawNewHead.y !== newHead.y) {
        gameStorage.recordEvent({
          type: 'wall-passthrough',
          position: newHead,
        });
      }

      // Create new snake with new head
      let newSnake = [newHead, ...snake];

      // Check self collision
      if (checkSelfCollision(newSnake)) {
        // End game session
        if (gameSessionActiveRef.current) {
          gameStorage.endGameSession(score, snake.length, 'self-collision');
          gameSessionActiveRef.current = false;
        }
        
        return {
          ...prevState,
          isGameOver: true,
          isPlaying: false,
        };
      }

      // Check obstacle collision
      if (isObstacleCollision(newHead, obstacles)) {
        // End game session
        if (gameSessionActiveRef.current) {
          gameStorage.endGameSession(score, snake.length, 'obstacle-collision');
          gameSessionActiveRef.current = false;
        }
        
        return {
          ...prevState,
          isGameOver: true,
          isPlaying: false,
        };
      }

      // Check trap collision
      const hitTrap = traps.find(trap => 
        !trap.isTriggered && trap.x === newHead.x && trap.y === newHead.y
      );

      let newTraps = traps;
      let trapWarning: Position | undefined;

      if (hitTrap) {
        // Record trap hit event
        gameStorage.recordEvent({
          type: 'trap-hit',
          position: { x: hitTrap.x, y: hitTrap.y },
          data: { previousSnakeLength: newSnake.length },
        });
        
        // Reduce snake length by half
        newSnake = reduceSnakeLength(newSnake);
        
        // Mark trap as triggered and set warning
        newTraps = traps.map(trap => 
          trap.id === hitTrap.id ? { ...trap, isTriggered: true } : trap
        );
        
        trapWarning = { x: hitTrap.x, y: hitTrap.y };

        // Remove triggered trap after warning duration
        setTimeout(() => {
          setGameState(prevState => ({
            ...prevState,
            traps: prevState.traps.filter(trap => trap.id !== hitTrap.id),
            trapWarning: undefined,
          }));
        }, GAME_CONFIG.TRAP_WARNING_DURATION);
      }

      // Check food collision
      const ateFood = newHead.x === food.x && newHead.y === food.y;

      if (ateFood) {
        // Record food eaten event
        gameStorage.recordEvent({
          type: 'food-eaten',
          position: { x: newHead.x, y: newHead.y },
          data: { score: score + 1, snakeLength: newSnake.length },
        });
        
        // Snake grows (don't remove tail), generate new food, increase score
        const newFood = generateRandomFood(newSnake, newTraps, obstacles);
        const newScore = score + 1;

        // Progressive speed acceleration: increase speed every 10 points
        if (newScore % 10 === 0) {
          gameSpeedRef.current = Math.max(
            50, // Minimum speed (50ms)
            gameSpeedRef.current - 5 // Decrease by 5ms for faster game
          );
          
          // Record speed increase event
          gameStorage.recordEvent({
            type: 'speed-increase',
            position: { x: newHead.x, y: newHead.y },
            data: { newSpeed: gameSpeedRef.current, score: newScore },
          });
        }

        return {
          ...prevState,
          snake: newSnake,
          food: newFood,
          score: newScore,
          traps: newTraps,
          trapWarning,
        };
      } else {
        // Snake doesn't grow (remove tail)
        if (!hitTrap) {
          newSnake.pop();
        }
        return {
          ...prevState,
          snake: newSnake,
          traps: newTraps,
          trapWarning,
        };
      }
    });
  }, [checkSelfCollision, wrapPosition, reduceSnakeLength]);

  /**
   * Changes the snake's direction
   */
  const changeDirection = useCallback((newDirection: Direction) => {
    setGameState(prevState => ({
      ...prevState,
      direction: newDirection,
    }));
  }, []);

  /**
   * Starts the game
   */
  const startGame = useCallback(() => {
    // Start new game session
    gameStorage.startGameSession();
    gameSessionActiveRef.current = true;
    
    setGameState(prevState => ({
      ...prevState,
      isPlaying: true,
      isGameOver: false,
    }));
    
    // Start trap spawning and obstacle reshape timer
    scheduleNextTrap();
    startObstacleReshapeTimer();
  }, [scheduleNextTrap, startObstacleReshapeTimer]);

  /**
   * Pauses/resumes the game
   */
  const togglePause = useCallback(() => {
    setGameState(prevState => {
      const newIsPlaying = !prevState.isPlaying;
      
      if (newIsPlaying && !prevState.isGameOver) {
        // Resume trap spawning and obstacle timer when unpausing
        scheduleNextTrap();
        startObstacleReshapeTimer();
      } else {
        // Clear timers when pausing
        if (trapSpawnTimerRef.current) {
          clearTimeout(trapSpawnTimerRef.current);
          trapSpawnTimerRef.current = null;
        }
        stopObstacleReshapeTimer();
      }
      
      return {
        ...prevState,
        isPlaying: newIsPlaying,
      };
    });
  }, [scheduleNextTrap, startObstacleReshapeTimer, stopObstacleReshapeTimer]);

  /**
   * Resets the game to initial state
   */
  const resetGame = useCallback(() => {
    // End current session if active
    if (gameSessionActiveRef.current) {
      gameStorage.endGameSession(gameState.score, gameState.snake.length, 'user-quit');
      gameSessionActiveRef.current = false;
    }
    
    // Clear saved game
    gameStorage.clearSavedGame();
    
    // Clear any existing timers
    if (trapSpawnTimerRef.current) {
      clearTimeout(trapSpawnTimerRef.current);
      trapSpawnTimerRef.current = null;
    }
    stopObstacleReshapeTimer();
    
    gameSpeedRef.current = GAME_CONFIG.INITIAL_SPEED;
    const initialSnake = [...INITIAL_SNAKE];
    const newObstacles = generateObstacles();
    const reshapeTime = GAME_CONFIG.OBSTACLE_RESHAPE_MIN_TIME + 
      Math.random() * (GAME_CONFIG.OBSTACLE_RESHAPE_MAX_TIME - GAME_CONFIG.OBSTACLE_RESHAPE_MIN_TIME);
    setGameState({
      snake: initialSnake,
      food: generateRandomFood(initialSnake, [], newObstacles),
      traps: [],
      obstacles: newObstacles,
      direction: 'RIGHT',
      score: 0,
      isGameOver: false,
      isPlaying: false,
      obstacleReshapeCountdown: Math.floor(reshapeTime / 1000),
    });
  }, [gameState.score, gameState.snake.length, stopObstacleReshapeTimer]);

  /**
   * Save current game state for resuming later
   */
  const saveGame = useCallback(() => {
    if (gameSessionActiveRef.current && gameState.isPlaying) {
      return gameStorage.saveGameState(gameState, gameSpeedRef.current);
    }
    return false;
  }, [gameState]);

  /**
   * Resume from saved game
   */
  const resumeSavedGame = useCallback(() => {
    const saved = gameStorage.loadSavedGame();
    if (saved && gameStorage.resumeSavedGame()) {
      gameSpeedRef.current = saved.gameSpeed;
      gameSessionActiveRef.current = true;
      setGameState(saved.gameState);
      
      if (saved.gameState.isPlaying) {
        scheduleNextTrap();
      }
      return true;
    }
    return false;
  }, [scheduleNextTrap]);

  // Auto-save game state periodically when playing
  useEffect(() => {
    if (gameState.isPlaying && !gameState.isGameOver && gameSessionActiveRef.current) {
      const saveInterval = setInterval(() => {
        saveGame();
      }, 5000); // Save every 5 seconds
      
      return () => clearInterval(saveInterval);
    }
  }, [gameState.isPlaying, gameState.isGameOver, saveGame]);

  // Resume saved game on hook initialization
  useEffect(() => {
    const savedGame = gameStorage.loadSavedGame();
    if (savedGame && !gameSessionActiveRef.current) {
      // Only auto-resume if saved game was in progress
      if (savedGame.gameState.isPlaying && !savedGame.gameState.isGameOver) {
        resumeSavedGame();
      }
    }
  }, []); // Only run once on mount

  // Cleanup trap timer on unmount
  useEffect(() => {
    return () => {
      if (trapSpawnTimerRef.current) {
        clearTimeout(trapSpawnTimerRef.current);
      }
    };
  }, []);

  return {
    gameState,
    gameSpeed: gameSpeedRef.current,
    moveSnake,
    changeDirection,
    startGame,
    togglePause,
    resetGame,
    saveGame,
    resumeSavedGame,
    // Storage-related functions
    getGameHistory: () => gameStorage.getGameHistory(),
    getStatistics: () => gameStorage.getStatistics(),
    clearHistory: () => gameStorage.clearHistory(),
    exportData: () => gameStorage.exportData(),
    importData: (data: string) => gameStorage.importData(data),
    getStorageInfo: () => gameStorage.getStorageInfo(),
    hasSavedGame: () => !!gameStorage.loadSavedGame(),
  };
};
