import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, test, expect, vi } from 'vitest';
import { Snake } from '../components/Snake';
import type { SnakeSegment } from '../types';
import { GAME_CONFIG } from '../constants/gameConfig';

// Mock CSS variables for testing
Object.defineProperty(document.documentElement.style, 'setProperty', {
  value: vi.fn(),
});

// Mock getComputedStyle for CSS variable calculations
Object.defineProperty(window, 'getComputedStyle', {
  value: () => ({
    getPropertyValue: (prop: string) => {
      const mockValues: Record<string, string> = {
        '--color-primary': '#4CAF50',
        '--color-primary-dark': '#388E3C',
        '--color-primary-light': '#8BC34A',
        '--color-success': '#66BB6A',
        '--shadow-sm': '0 1px 3px rgba(0,0,0,0.12)',
        '--shadow-md': '0 4px 6px rgba(0,0,0,0.16)',
        '--radius-sm': '4px',
        '--radius-md': '8px',
        '--radius-full': '50%',
        '--duration-fast': '150ms',
        '--ease-out': 'ease-out',
      };
      return mockValues[prop] || '';
    },
  }),
});

describe('Snake Component', () => {
  const createSnakeSegment = (x: number, y: number): SnakeSegment => ({ x, y });

  describe('Basic Rendering', () => {
    test('should render single segment snake (head only)', () => {
      const snake = [createSnakeSegment(5, 5)];
      
      render(<Snake snake={snake} />);
      
      const head = screen.getByTestId('snake-head');
      expect(head).toBeInTheDocument();
      
      // Check positioning (styles are applied via style attribute)
      expect(head.style.left).toBe(`${5 * GAME_CONFIG.CELL_SIZE}px`);
      expect(head.style.top).toBe(`${5 * GAME_CONFIG.CELL_SIZE}px`);
      expect(head.style.width).toBe(`${GAME_CONFIG.CELL_SIZE}px`);
      expect(head.style.height).toBe(`${GAME_CONFIG.CELL_SIZE}px`);
    });

    test('should render multi-segment snake', () => {
      const snake = [
        createSnakeSegment(5, 5), // head
        createSnakeSegment(4, 5), // body
        createSnakeSegment(3, 5), // tail
      ];
      
      render(<Snake snake={snake} />);
      
      expect(screen.getByTestId('snake-head')).toBeInTheDocument();
      expect(screen.getAllByTestId('snake-body')).toHaveLength(2);
    });

    test('should render long snake with multiple body segments', () => {
      const snake = [
        createSnakeSegment(10, 10), // head
        createSnakeSegment(9, 10),  // body
        createSnakeSegment(8, 10),  // body
        createSnakeSegment(7, 10),  // body
        createSnakeSegment(6, 10),  // tail
      ];
      
      render(<Snake snake={snake} />);
      
      expect(screen.getByTestId('snake-head')).toBeInTheDocument();
      expect(screen.getAllByTestId('snake-body')).toHaveLength(4);
    });

    test('should render empty snake gracefully', () => {
      const snake: SnakeSegment[] = [];
      
      expect(() => {
        render(<Snake snake={snake} />);
      }).not.toThrow();
    });
  });

  describe('Head Styling and Features', () => {
    test('should apply head-specific styling', () => {
      const snake = [createSnakeSegment(0, 0)];
      
      render(<Snake snake={snake} />);
      
      const head = screen.getByTestId('snake-head');
      
      // Check for head-specific classes and attributes
      expect(head).toHaveClass('snake-head', 'animate-pulse');
      expect(head).toHaveAttribute('role', 'img');
      expect(head).toHaveAttribute('aria-label', 'Snake head');
      
      // Head should have scale transform
      expect(head.style.transform).toBe('scale(1.05)');
    });

    test('should render head with eyes', () => {
      const snake = [createSnakeSegment(0, 0)];
      
      render(<Snake snake={snake} />);
      
      const head = screen.getByTestId('snake-head');
      
      // Should have eye elements (divs without test ids)
      const eyes = head.querySelectorAll('div');
      expect(eyes.length).toBeGreaterThanOrEqual(2); // At least left and right eyes
    });

    test('should render head with nose/mouth indicator', () => {
      const snake = [createSnakeSegment(0, 0)];
      
      render(<Snake snake={snake} />);
      
      const head = screen.getByTestId('snake-head');
      const noseElement = head.querySelector('div:last-child');
      
      expect(noseElement).toBeInTheDocument();
      expect(noseElement.style.position).toBe('absolute');
      expect(noseElement.style.bottom).toBe('25%');
      expect(noseElement.style.left).toBe('50%');
      expect(noseElement.style.transform).toBe('translateX(-50%)');
    });

    test('should have proper z-index for head', () => {
      const snake = [
        createSnakeSegment(0, 0), // head
        createSnakeSegment(1, 0), // body
      ];
      
      render(<Snake snake={snake} />);
      
      const head = screen.getByTestId('snake-head');
      const body = screen.getByTestId('snake-body');
      
      expect(head.style.zIndex).toBe('3');
      expect(body.style.zIndex).toBe('2');
    });
  });

  describe('Body and Tail Styling', () => {
    test('should apply body-specific styling', () => {
      const snake = [
        createSnakeSegment(0, 0), // head
        createSnakeSegment(1, 0), // body
        createSnakeSegment(2, 0), // tail
      ];
      
      render(<Snake snake={snake} />);
      
      const bodySegments = screen.getAllByTestId('snake-body');
      
      bodySegments.forEach((segment, index) => {
        expect(segment).toHaveAttribute('role', 'img');
        
        if (index === bodySegments.length - 1) {
          // Tail
          expect(segment).toHaveClass('snake-segment', 'snake-tail');
          expect(segment).toHaveAttribute('aria-label', 'Snake tail');
          expect(segment.style.zIndex).toBe('1');
        } else {
          // Body
          expect(segment).toHaveClass('snake-segment', 'snake-body');
          expect(segment).toHaveAttribute('aria-label', 'Snake body');
          expect(segment.style.zIndex).toBe('2');
        }
      });
    });

    test('should render body segments with inner highlight', () => {
      const snake = [
        createSnakeSegment(0, 0), // head
        createSnakeSegment(1, 0), // body
      ];
      
      render(<Snake snake={snake} />);
      
      const bodySegment = screen.getByTestId('snake-body');
      const highlight = bodySegment.querySelector('div');
      
      expect(highlight).toBeInTheDocument();
      expect(highlight.style.position).toBe('absolute');
      expect(highlight.style.top).toBe('2px');
      expect(highlight.style.left).toBe('2px');
      expect(highlight.style.right).toBe('2px');
      expect(highlight.style.height).toBe('30%');
    });

    test('should handle single segment (head only) correctly', () => {
      const snake = [createSnakeSegment(0, 0)];
      
      render(<Snake snake={snake} />);
      
      expect(screen.getByTestId('snake-head')).toBeInTheDocument();
      expect(screen.queryByTestId('snake-body')).not.toBeInTheDocument();
    });
  });

  describe('Positioning', () => {
    test('should position segments correctly based on coordinates', () => {
      const snake = [
        createSnakeSegment(2, 3), // head
        createSnakeSegment(1, 3), // body
        createSnakeSegment(0, 3), // tail
      ];
      
      render(<Snake snake={snake} />);
      
      const head = screen.getByTestId('snake-head');
      const bodySegments = screen.getAllByTestId('snake-body');
      
      expect(head.style.left).toBe(`${2 * GAME_CONFIG.CELL_SIZE}px`);
      expect(head.style.top).toBe(`${3 * GAME_CONFIG.CELL_SIZE}px`);
      
      expect(bodySegments[0].style.left).toBe(`${1 * GAME_CONFIG.CELL_SIZE}px`);
      expect(bodySegments[0].style.top).toBe(`${3 * GAME_CONFIG.CELL_SIZE}px`);
      
      expect(bodySegments[1].style.left).toBe(`${0 * GAME_CONFIG.CELL_SIZE}px`);
      expect(bodySegments[1].style.top).toBe(`${3 * GAME_CONFIG.CELL_SIZE}px`);
    });

    test('should handle various positions correctly', () => {
      const testPositions = [
        [0, 0], [5, 10], [15, 7], [19, 19]
      ];
      
      testPositions.forEach(([x, y]) => {
        const snake = [createSnakeSegment(x, y)];
        
        render(<Snake snake={snake} />);
        
        const head = screen.getByTestId('snake-head');
        expect(head.style.left).toBe(`${x * GAME_CONFIG.CELL_SIZE}px`);
        expect(head.style.top).toBe(`${y * GAME_CONFIG.CELL_SIZE}px`);
        
        // Clean up for next iteration
        head.remove();
      });
    });
  });

  describe('Animation and Styling', () => {
    test('should have animation delays based on segment index', () => {
      const snake = [
        createSnakeSegment(0, 0), // head
        createSnakeSegment(1, 0), // body 1
        createSnakeSegment(2, 0), // body 2
        createSnakeSegment(3, 0), // tail
      ];
      
      render(<Snake snake={snake} />);
      
      const head = screen.getByTestId('snake-head');
      const bodySegments = screen.getAllByTestId('snake-body');
      
      expect(head.style.animationDelay).toBe('0s');
      expect(bodySegments[0].style.animationDelay).toBe('0.05s');
      expect(bodySegments[1].style.animationDelay).toBe('0.1s');
      expect(bodySegments[2].style.animationDelay).toBe('0.15s'); // tail
    });

    test('should apply correct CSS variables', () => {
      const snake = [
        createSnakeSegment(0, 0), // head
        createSnakeSegment(1, 0), // body
        createSnakeSegment(2, 0), // tail
      ];
      
      render(<Snake snake={snake} />);
      
      const head = screen.getByTestId('snake-head');
      const bodySegments = screen.getAllByTestId('snake-body');
      const tail = bodySegments[bodySegments.length - 1];
      
      // Check background gradients using CSS variables
      expect(head.style.background).toBe('linear-gradient(135deg, var(--color-primary), var(--color-primary-dark))');
      
      expect(tail.style.background).toBe('linear-gradient(135deg, var(--color-primary-light), var(--color-success))');
    });

    test('should include CSS animations in the document', () => {
      const snake = [createSnakeSegment(0, 0)];
      
      render(<Snake snake={snake} />);
      
      // Check that style element is added to the document
      const styleElements = document.querySelectorAll('style');
      const snakeStyles = Array.from(styleElements).find(style => 
        style.textContent?.includes('@keyframes snakeMove')
      );
      
      expect(snakeStyles).toBeDefined();
      expect(snakeStyles?.textContent).toContain('@keyframes snakeMove');
      expect(snakeStyles?.textContent).toContain('.snake-head');
      expect(snakeStyles?.textContent).toContain('.snake-segment');
    });
  });

  describe('Accessibility', () => {
    test('should have proper ARIA labels', () => {
      const snake = [
        createSnakeSegment(0, 0), // head
        createSnakeSegment(1, 0), // body
        createSnakeSegment(2, 0), // tail
      ];
      
      render(<Snake snake={snake} />);
      
      const head = screen.getByTestId('snake-head');
      const bodySegments = screen.getAllByTestId('snake-body');
      
      expect(head).toHaveAttribute('aria-label', 'Snake head');
      expect(bodySegments[0]).toHaveAttribute('aria-label', 'Snake body');
      expect(bodySegments[1]).toHaveAttribute('aria-label', 'Snake tail');
    });

    test('should have proper role attributes', () => {
      const snake = [
        createSnakeSegment(0, 0), // head
        createSnakeSegment(1, 0), // body
      ];
      
      render(<Snake snake={snake} />);
      
      const head = screen.getByTestId('snake-head');
      const body = screen.getByTestId('snake-body');
      
      expect(head).toHaveAttribute('role', 'img');
      expect(body).toHaveAttribute('role', 'img');
    });

    test('should support reduced motion preferences', () => {
      const snake = [createSnakeSegment(0, 0)];
      
      render(<Snake snake={snake} />);
      
      const styleElements = document.querySelectorAll('style');
      const snakeStyles = Array.from(styleElements).find(style => 
        style.textContent?.includes('@media (prefers-reduced-motion: reduce)')
      );
      
      expect(snakeStyles?.textContent).toContain('@media (prefers-reduced-motion: reduce)');
      expect(snakeStyles?.textContent).toContain('animation: none !important');
    });
  });

  describe('Visual Effects', () => {
    test('should apply glow effect for long snakes', () => {
      const longSnake = Array.from({ length: 10 }, (_, i) => 
        createSnakeSegment(i, 0)
      );
      
      render(<Snake snake={longSnake} />);
      
      const styleElements = document.querySelectorAll('style');
      const snakeStyles = Array.from(styleElements).find(style => 
        style.textContent?.includes('.snake-head')
      );
      
      // Should include glow animation for long snakes
      expect(snakeStyles?.textContent).toContain('glow 2s ease-in-out infinite');
    });

    test('should not apply glow effect for short snakes', () => {
      const shortSnake = [
        createSnakeSegment(0, 0),
        createSnakeSegment(1, 0),
        createSnakeSegment(2, 0),
      ];
      
      render(<Snake snake={shortSnake} />);
      
      const styleElements = document.querySelectorAll('style');
      const snakeStyles = Array.from(styleElements).find(style => 
        style.textContent?.includes('.snake-head')
      );
      
      // Should not include glow animation for short snakes
      expect(snakeStyles?.textContent).toContain('animation: none');
    });

    test('should have proper box shadows', () => {
      const snake = [
        createSnakeSegment(0, 0), // head
        createSnakeSegment(1, 0), // body
      ];
      
      render(<Snake snake={snake} />);
      
      const head = screen.getByTestId('snake-head');
      const body = screen.getByTestId('snake-body');
      
      expect(head.style.boxShadow).toBe('var(--shadow-md), 0 0 10px rgba(76, 175, 80, 0.3)');
      
      expect(body.style.boxShadow).toBe('var(--shadow-sm)');
    });
  });

  describe('Edge Cases', () => {
    test('should handle negative coordinates', () => {
      const snake = [createSnakeSegment(-1, -1)];
      
      expect(() => {
        render(<Snake snake={snake} />);
      }).not.toThrow();
      
      const head = screen.getByTestId('snake-head');
      expect(head.style.left).toBe(`${-1 * GAME_CONFIG.CELL_SIZE}px`);
      expect(head.style.top).toBe(`${-1 * GAME_CONFIG.CELL_SIZE}px`);
    });

    test('should handle very large coordinates', () => {
      const snake = [createSnakeSegment(1000, 1000)];
      
      expect(() => {
        render(<Snake snake={snake} />);
      }).not.toThrow();
      
      const head = screen.getByTestId('snake-head');
      expect(head.style.left).toBe(`${1000 * GAME_CONFIG.CELL_SIZE}px`);
      expect(head.style.top).toBe(`${1000 * GAME_CONFIG.CELL_SIZE}px`);
    });

    test('should handle duplicate coordinates', () => {
      const snake = [
        createSnakeSegment(5, 5),
        createSnakeSegment(5, 5), // duplicate
        createSnakeSegment(5, 5), // duplicate
      ];
      
      expect(() => {
        render(<Snake snake={snake} />);
      }).not.toThrow();
      
      expect(screen.getByTestId('snake-head')).toBeInTheDocument();
      expect(screen.getAllByTestId('snake-body')).toHaveLength(2);
    });
  });

  describe('Performance', () => {
    test('should render large snakes efficiently', () => {
      const largeSnake = Array.from({ length: 100 }, (_, i) => 
        createSnakeSegment(i % 20, Math.floor(i / 20))
      );
      
      const startTime = performance.now();
      render(<Snake snake={largeSnake} />);
      const endTime = performance.now();
      
      // Should render quickly (less than 100ms for 100 segments)
      expect(endTime - startTime).toBeLessThan(100);
      
      expect(screen.getByTestId('snake-head')).toBeInTheDocument();
      expect(screen.getAllByTestId('snake-body')).toHaveLength(99);
    });

    test('should generate unique keys for segments', () => {
      const snake = [
        createSnakeSegment(0, 0),
        createSnakeSegment(1, 0),
        createSnakeSegment(2, 0),
      ];
      
      render(<Snake snake={snake} />);
      
      // Each segment should have a unique key (based on index)
      // This is tested indirectly by ensuring all segments render
      expect(screen.getByTestId('snake-head')).toBeInTheDocument();
      expect(screen.getAllByTestId('snake-body')).toHaveLength(2);
    });
  });
});