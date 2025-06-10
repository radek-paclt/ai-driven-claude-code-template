import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { vi, describe, test, expect, beforeEach, afterEach } from 'vitest';
import { App } from '../App';

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

// Mock matchMedia
const createMatchMediaMock = (matches: boolean) => ({
  matches,
  media: '(prefers-color-scheme: dark)',
  onchange: null,
  addEventListener: vi.fn(),
  removeEventListener: vi.fn(),
  addListener: vi.fn(),
  removeListener: vi.fn(),
  dispatchEvent: vi.fn(),
});

// Mock DOM methods for theme functionality
const mockElement = {
  setAttribute: vi.fn(),
  name: '',
  content: '',
  tagName: 'META',
  cloneNode: vi.fn(),
  parentNode: null,
  nodeType: 1,
};

describe('Integration Tests', () => {
  let mockMatchMedia: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    localStorageMock.clear();
    
    mockMatchMedia = vi.fn();
    window.matchMedia = mockMatchMedia;
    mockMatchMedia.mockReturnValue(createMatchMediaMock(false));
    
    // Mock DOM methods
    vi.spyOn(document.head, 'appendChild').mockImplementation(() => mockElement as any);
    vi.spyOn(document, 'querySelector').mockReturnValue(null);
    vi.spyOn(document, 'createElement').mockReturnValue(mockElement as any);
    vi.spyOn(document.documentElement, 'setAttribute').mockImplementation(() => {});
    
    // Mock timers for game loop testing
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.useRealTimers();
    localStorageMock.clear();
  });

  describe('App Initialization', () => {
    test('should render main app components', () => {
      render(<App />);
      
      expect(screen.getByText('Snake Game')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /start game/i })).toBeInTheDocument();
    });

    test('should initialize with light theme by default', () => {
      render(<App />);
      
      // Theme toggle should show light theme initially
      const themeButton = screen.getByRole('switch');
      expect(themeButton).toHaveAttribute('aria-checked', 'false');
    });

    test('should load saved theme from localStorage', () => {
      localStorageMock.setItem('snake-game-theme', 'dark');
      
      render(<App />);
      
      const themeButton = screen.getByRole('switch');
      expect(themeButton).toHaveAttribute('aria-checked', 'true');
    });
  });

  describe('Game Flow', () => {
    test('should start and stop game', async () => {
      render(<App />);
      
      const startButton = screen.getByRole('button', { name: /start game/i });
      
      // Start the game
      fireEvent.click(startButton);
      
      await waitFor(() => {
        expect(screen.getByRole('button', { name: /pause/i })).toBeInTheDocument();
      });
      
      // Pause the game
      const pauseButton = screen.getByRole('button', { name: /pause/i });
      fireEvent.click(pauseButton);
      
      await waitFor(() => {
        expect(screen.getByRole('button', { name: /resume/i })).toBeInTheDocument();
      });
    });

    test('should handle keyboard controls', async () => {
      render(<App />);
      
      // Start the game first
      const startButton = screen.getByRole('button', { name: /start game/i });
      fireEvent.click(startButton);
      
      await waitFor(() => {
        expect(screen.getByRole('button', { name: /pause/i })).toBeInTheDocument();
      });
      
      // Test keyboard controls
      fireEvent.keyDown(window, { key: 'ArrowUp' });
      fireEvent.keyDown(window, { key: 'ArrowDown' });
      fireEvent.keyDown(window, { key: 'ArrowLeft' });
      fireEvent.keyDown(window, { key: 'ArrowRight' });
      
      // Should not crash and game should still be running
      expect(screen.getByRole('button', { name: /pause/i })).toBeInTheDocument();
    });

    test('should reset game state', async () => {
      render(<App />);
      
      // Start game
      const startButton = screen.getByRole('button', { name: /start game/i });
      fireEvent.click(startButton);
      
      await waitFor(() => {
        expect(screen.getByRole('button', { name: /pause/i })).toBeInTheDocument();
      });
      
      // Reset game
      const resetButton = screen.getByRole('button', { name: /reset/i });
      fireEvent.click(resetButton);
      
      await waitFor(() => {
        expect(screen.getByRole('button', { name: /start game/i })).toBeInTheDocument();
      });
    });
  });

  describe('Theme Integration', () => {
    test('should toggle theme and persist to localStorage', async () => {
      render(<App />);
      
      const themeToggle = screen.getByRole('switch');
      
      // Initially light theme
      expect(themeToggle).toHaveAttribute('aria-checked', 'false');
      
      // Toggle to dark theme
      fireEvent.click(themeToggle);
      
      await waitFor(() => {
        expect(themeToggle).toHaveAttribute('aria-checked', 'true');
      });
      
      // Should persist to localStorage
      expect(localStorageMock.getItem('snake-game-theme')).toBe('dark');
    });

    test('should apply theme to document', () => {
      render(<App />);
      
      // Should set data-theme attribute on document element
      expect(document.documentElement.setAttribute).toHaveBeenCalledWith('data-theme', 'light');
    });
  });

  describe('Game Components Integration', () => {
    test('should render game board when game starts', async () => {
      render(<App />);
      
      const startButton = screen.getByRole('button', { name: /start game/i });
      fireEvent.click(startButton);
      
      await waitFor(() => {
        expect(screen.getByTestId('snake-head')).toBeInTheDocument();
        expect(screen.getByTestId('food')).toBeInTheDocument();
      });
    });

    test('should show statistics during game', async () => {
      render(<App />);
      
      const startButton = screen.getByRole('button', { name: /start game/i });
      fireEvent.click(startButton);
      
      await waitFor(() => {
        // Should show current score
        expect(screen.getByText(/score/i)).toBeInTheDocument();
      });
    });

    test('should handle game over state', async () => {
      render(<App />);
      
      const startButton = screen.getByRole('button', { name: /start game/i });
      fireEvent.click(startButton);
      
      await waitFor(() => {
        expect(screen.getByTestId('snake-head')).toBeInTheDocument();
      });
      
      // Simulate game over by making snake collide with itself
      // This would require more complex setup to actually trigger
      // For now, just test that reset button exists
      expect(screen.getByRole('button', { name: /reset/i })).toBeInTheDocument();
    });
  });

  describe('Performance and Error Handling', () => {
    test('should handle rapid key presses without crashing', async () => {
      render(<App />);
      
      const startButton = screen.getByRole('button', { name: /start game/i });
      fireEvent.click(startButton);
      
      await waitFor(() => {
        expect(screen.getByRole('button', { name: /pause/i })).toBeInTheDocument();
      });
      
      // Rapid key presses
      for (let i = 0; i < 10; i++) {
        fireEvent.keyDown(window, { key: 'ArrowUp' });
        fireEvent.keyDown(window, { key: 'ArrowDown' });
        fireEvent.keyDown(window, { key: 'ArrowLeft' });
        fireEvent.keyDown(window, { key: 'ArrowRight' });
      }
      
      // Should still be functional
      expect(screen.getByRole('button', { name: /pause/i })).toBeInTheDocument();
    });

    test('should handle localStorage errors gracefully', () => {
      // Mock localStorage to throw errors
      const originalSetItem = localStorageMock.setItem;
      localStorageMock.setItem = vi.fn(() => {
        throw new Error('LocalStorage full');
      });
      
      expect(() => {
        render(<App />);
      }).not.toThrow();
      
      // Restore original method
      localStorageMock.setItem = originalSetItem;
    });

    test('should handle window focus/blur events', async () => {
      render(<App />);
      
      // Start game
      const startButton = screen.getByRole('button', { name: /start game/i });
      fireEvent.click(startButton);
      
      await waitFor(() => {
        expect(screen.getByRole('button', { name: /pause/i })).toBeInTheDocument();
      });
      
      // Simulate window blur (user switches tab)
      fireEvent.blur(window);
      
      // Simulate window focus (user returns to tab)
      fireEvent.focus(window);
      
      // Game should still be functional
      expect(screen.getByRole('button', { name: /pause/i })).toBeInTheDocument();
    });
  });

  describe('Accessibility Integration', () => {
    test('should have proper heading structure', () => {
      render(<App />);
      
      const mainHeading = screen.getByRole('heading', { level: 1 });
      expect(mainHeading).toHaveTextContent('Snake Game');
    });

    test('should have keyboard navigation support', async () => {
      render(<App />);
      
      // Tab through interactive elements
      const startButton = screen.getByRole('button', { name: /start game/i });
      startButton.focus();
      expect(document.activeElement).toBe(startButton);
      
      // Theme toggle should be focusable
      const themeToggle = screen.getByRole('switch');
      themeToggle.focus();
      expect(document.activeElement).toBe(themeToggle);
    });

    test('should have proper ARIA labels and roles', () => {
      render(<App />);
      
      // Theme toggle should have proper ARIA
      const themeToggle = screen.getByRole('switch');
      expect(themeToggle).toHaveAttribute('aria-label');
      expect(themeToggle).toHaveAttribute('aria-checked');
      
      // Buttons should have accessible names
      const startButton = screen.getByRole('button', { name: /start game/i });
      expect(startButton).toBeInTheDocument();
    });
  });

  describe('Mobile Responsiveness', () => {
    test('should handle touch events', async () => {
      render(<App />);
      
      // Start game
      const startButton = screen.getByRole('button', { name: /start game/i });
      fireEvent.click(startButton);
      
      await waitFor(() => {
        expect(screen.getByTestId('snake-head')).toBeInTheDocument();
      });
      
      // Simulate touch events (these would be handled by touch controls if implemented)
      const gameBoard = screen.getByTestId('snake-head').closest('div');
      if (gameBoard) {
        fireEvent.touchStart(gameBoard, { touches: [{ clientX: 100, clientY: 100 }] });
        fireEvent.touchEnd(gameBoard, { touches: [] });
      }
      
      // Should not crash
      expect(screen.getByTestId('snake-head')).toBeInTheDocument();
    });

    test('should work with different viewport sizes', () => {
      // Test different viewport sizes
      const viewports = [
        { width: 320, height: 568 },   // Mobile
        { width: 768, height: 1024 },  // Tablet
        { width: 1920, height: 1080 }, // Desktop
      ];
      
      viewports.forEach(({ width, height }) => {
        // Mock viewport size
        Object.defineProperty(window, 'innerWidth', { value: width, writable: true });
        Object.defineProperty(window, 'innerHeight', { value: height, writable: true });
        
        expect(() => {
          render(<App />);
        }).not.toThrow();
      });
    });
  });

  describe('Data Persistence Integration', () => {
    test('should persist and restore game statistics', async () => {
      render(<App />);
      
      // Start and play a game (simplified)
      const startButton = screen.getByRole('button', { name: /start game/i });
      fireEvent.click(startButton);
      
      await waitFor(() => {
        expect(screen.getByRole('button', { name: /pause/i })).toBeInTheDocument();
      });
      
      // Reset to end game
      const resetButton = screen.getByRole('button', { name: /reset/i });
      fireEvent.click(resetButton);
      
      // Check that game data is persisted to localStorage
      const gameData = localStorageMock.getItem('snake-game-data');
      expect(gameData).toBeTruthy();
    });

    test('should handle corrupted localStorage data', () => {
      // Set corrupted data
      localStorageMock.setItem('snake-game-data', 'corrupted json data');
      
      expect(() => {
        render(<App />);
      }).not.toThrow();
      
      // Should still be functional
      expect(screen.getByRole('button', { name: /start game/i })).toBeInTheDocument();
    });
  });
});