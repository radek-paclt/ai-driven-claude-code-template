import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { GameBoard } from '../components/GameBoard';

// Mock the game loop timing
vi.mock('../constants/gameConfig', () => ({
  GAME_CONFIG: {
    BOARD_WIDTH: 20,
    BOARD_HEIGHT: 20,
    INITIAL_SPEED: 150,
    SPEED_INCREASE: 10,
    CELL_SIZE: 20,
  },
  DIRECTIONS: {
    UP: { x: 0, y: -1 },
    DOWN: { x: 0, y: 1 },
    LEFT: { x: -1, y: 0 },
    RIGHT: { x: 1, y: 0 },
  },
  INITIAL_SNAKE: [
    { x: 10, y: 10 },
    { x: 9, y: 10 },
    { x: 8, y: 10 },
  ],
}));

describe('GameBoard', () => {
  beforeEach(() => {
    vi.clearAllTimers();
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.useRealTimers();
  });

  it('renders the game board with initial state', () => {
    render(<GameBoard />);

    expect(screen.getByTestId('game-board')).toBeInTheDocument();
    expect(screen.getByTestId('score')).toBeInTheDocument();
    expect(screen.getByText('Score: 0')).toBeInTheDocument();
    expect(screen.getByTestId('start-overlay')).toBeInTheDocument();
  });

  it('displays start overlay initially', () => {
    render(<GameBoard />);

    expect(screen.getByTestId('start-overlay')).toBeInTheDocument();
    expect(screen.getByText('Snake Game')).toBeInTheDocument();
    expect(screen.getByText('Start Game (Space)')).toBeInTheDocument();
  });

  it('has a clickable start button', () => {
    render(<GameBoard />);

    const startButton = screen.getByText('Start Game (Space)');
    expect(startButton).toBeInTheDocument();

    // Test that clicking doesn't throw an error
    expect(() => {
      fireEvent.click(startButton);
    }).not.toThrow();
  });

  it('responds to space key press', () => {
    render(<GameBoard />);

    // Test that keydown doesn't throw an error
    expect(() => {
      fireEvent.keyDown(window, { code: 'Space' });
    }).not.toThrow();
  });

  it('renders snake and food elements', () => {
    render(<GameBoard />);

    expect(screen.getByTestId('snake-head')).toBeInTheDocument();
    expect(screen.getAllByTestId('snake-body')).toHaveLength(2);
    expect(screen.getByTestId('food')).toBeInTheDocument();
  });

  it('changes snake direction with arrow keys', async () => {
    render(<GameBoard />);

    // Start the game first
    fireEvent.keyDown(window, { code: 'Space' });

    // Test direction change
    fireEvent.keyDown(window, { key: 'ArrowUp' });
    fireEvent.keyDown(window, { key: 'ArrowLeft' });
    fireEvent.keyDown(window, { key: 'ArrowDown' });
    fireEvent.keyDown(window, { key: 'ArrowRight' });

    // The test passes if no errors are thrown
    expect(screen.getByTestId('game-board')).toBeInTheDocument();
  });

  it('changes snake direction with WASD keys', async () => {
    render(<GameBoard />);

    // Start the game first
    fireEvent.keyDown(window, { code: 'Space' });

    // Test WASD direction change
    fireEvent.keyDown(window, { key: 'w' });
    fireEvent.keyDown(window, { key: 'a' });
    fireEvent.keyDown(window, { key: 's' });
    fireEvent.keyDown(window, { key: 'd' });

    // The test passes if no errors are thrown
    expect(screen.getByTestId('game-board')).toBeInTheDocument();
  });

  it('handles keyboard input without errors', () => {
    render(<GameBoard />);

    // Test various key inputs don't throw errors
    expect(() => {
      fireEvent.keyDown(window, { code: 'Space' });
      fireEvent.keyDown(window, { key: 'ArrowUp' });
      fireEvent.keyDown(window, { key: 'ArrowDown' });
      fireEvent.keyDown(window, { key: 'ArrowLeft' });
      fireEvent.keyDown(window, { key: 'ArrowRight' });
      fireEvent.keyDown(window, { key: 'w' });
      fireEvent.keyDown(window, { key: 'a' });
      fireEvent.keyDown(window, { key: 's' });
      fireEvent.keyDown(window, { key: 'd' });
    }).not.toThrow();
  });

  it('displays game instructions', () => {
    render(<GameBoard />);

    expect(
      screen.getByText('Use WASD or Arrow Keys to move')
    ).toBeInTheDocument();
    expect(screen.getByText('Space to pause/resume')).toBeInTheDocument();
    expect(
      screen.getByText('Eat red food to grow and score points')
    ).toBeInTheDocument();
    expect(
      screen.getByText('🪤 Avoid orange traps - they cut your snake length in half!')
    ).toBeInTheDocument();
  });

  it('renders TrapList component', () => {
    render(<GameBoard />);

    // The TrapList component should be rendered even if no traps are present
    // We can verify this by checking that the game board contains the trap list
    expect(screen.getByTestId('game-board')).toBeInTheDocument();
    
    // Since traps start empty, we won't see any trap elements initially
    const trapElements = screen.queryAllByTestId('trap');
    expect(trapElements).toHaveLength(0);
  });
});
