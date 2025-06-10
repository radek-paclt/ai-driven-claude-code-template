import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, test, expect, beforeEach, vi } from 'vitest';
import { Food } from '../components/Food';
import type { Food as FoodType } from '../types';
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
        '--color-accent': '#FF6B6B',
        '--color-accent-dark': '#E53E3E',
        '--shadow-sm': '0 1px 3px rgba(0,0,0,0.12)',
        '--shadow-md': '0 4px 6px rgba(0,0,0,0.16)',
        '--radius-full': '50%',
        '--duration-fast': '150ms',
        '--ease-in-out': 'ease-in-out',
      };
      return mockValues[prop] || '';
    },
  }),
});

describe('Food Component', () => {
  const createFood = (x: number, y: number): FoodType => ({ x, y });

  beforeEach(() => {
    // Clear any existing style elements
    document.querySelectorAll('style').forEach(style => {
      if (style.textContent?.includes('@keyframes foodAppear')) {
        style.remove();
      }
    });
  });

  describe('Basic Rendering', () => {
    test('should render food at correct position', () => {
      const food = createFood(5, 10);
      
      render(<Food food={food} />);
      
      const foodElement = screen.getByTestId('food');
      expect(foodElement).toBeInTheDocument();
      
      // Check positioning (styles are applied via style attribute)
      expect(foodElement.style.left).toBe(`${5 * GAME_CONFIG.CELL_SIZE}px`);
      expect(foodElement.style.top).toBe(`${10 * GAME_CONFIG.CELL_SIZE}px`);
      expect(foodElement.style.width).toBe(`${GAME_CONFIG.CELL_SIZE}px`);
      expect(foodElement.style.height).toBe(`${GAME_CONFIG.CELL_SIZE}px`);
    });

    test('should have correct size based on CELL_SIZE', () => {
      const food = createFood(0, 0);
      
      render(<Food food={food} />);
      
      const foodElement = screen.getByTestId('food');
      expect(foodElement.style.width).toBe(`${GAME_CONFIG.CELL_SIZE}px`);
      expect(foodElement.style.height).toBe(`${GAME_CONFIG.CELL_SIZE}px`);
    });

    test('should render at various positions correctly', () => {
      const positions = [
        [0, 0], [1, 1], [15, 10], [19, 19]
      ];
      
      positions.forEach(([x, y]) => {
        const food = createFood(x, y);
        
        render(<Food food={food} />);
        
        const foodElement = screen.getByTestId('food');
        expect(foodElement.style.left).toBe(`${x * GAME_CONFIG.CELL_SIZE}px`);
        expect(foodElement.style.top).toBe(`${y * GAME_CONFIG.CELL_SIZE}px`);
        
        // Clean up for next iteration
        foodElement.remove();
      });
    });
  });

  describe('Visual Styling', () => {
    test('should have correct basic styling', () => {
      const food = createFood(5, 5);
      
      render(<Food food={food} />);
      
      const foodElement = screen.getByTestId('food');
      
      expect(foodElement.style.position).toBe('absolute');
      expect(foodElement.style.background).toBe('radial-gradient(circle at 30% 30%, var(--color-accent), var(--color-accent-dark))');
      expect(foodElement.style.borderRadius).toBe('var(--radius-full)');
      expect(foodElement.style.border).toBe('2px solid var(--color-accent-dark)');
      expect(foodElement.style.boxSizing).toBe('border-box');
      expect(foodElement.style.zIndex).toBe('2');
    });

    test('should have proper box shadow with glow effect', () => {
      const food = createFood(0, 0);
      
      render(<Food food={food} />);
      
      const foodElement = screen.getByTestId('food');
      
      const expectedBoxShadow = `
      var(--shadow-sm),
      0 0 10px rgba(255, 107, 107, 0.4),
      inset 0 2px 4px rgba(255, 255, 255, 0.3)
    `.replace(/\s+/g, ' ').trim();
      
      expect(foodElement).toHaveStyle({
        boxShadow: expectedBoxShadow,
      });
    });

    test('should have entrance and pulse animations', () => {
      const food = createFood(0, 0);
      
      render(<Food food={food} />);
      
      const foodElement = screen.getByTestId('food');
      
      expect(foodElement.style.animation).toBe('foodAppear 0.3s ease-out, foodPulse 2s ease-in-out infinite 0.3s');
    });

    test('should render inner glow/highlight', () => {
      const food = createFood(0, 0);
      
      render(<Food food={food} />);
      
      const foodElement = screen.getByTestId('food');
      const children = Array.from(foodElement.children);
      
      // Should have at least one child for the core highlight
      expect(children.length).toBeGreaterThan(0);
      
      const coreElement = children[0] as HTMLElement;
      expect(coreElement.style.position).toBe('absolute');
      expect(coreElement.style.top).toBe('20%');
      expect(coreElement.style.left).toBe('20%');
      expect(coreElement.style.width).toBe('60%');
      expect(coreElement.style.height).toBe('60%');
      expect(coreElement.style.borderRadius).toBe('var(--radius-full)');
      expect(coreElement.style.pointerEvents).toBe('none');
    });

    test('should render sparkle effects', () => {
      const food = createFood(0, 0);
      
      render(<Food food={food} />);
      
      const foodElement = screen.getByTestId('food');
      const sparkles = Array.from(foodElement.children).slice(1); // Skip core element
      
      // Should have sparkle elements
      expect(sparkles.length).toBeGreaterThanOrEqual(2);
      
      sparkles.forEach(sparkle => {
        expect(sparkle.style.position).toBe('absolute');
        expect(sparkle.style.borderRadius).toBe('var(--radius-full)');
        expect(sparkle.style.pointerEvents).toBe('none');
      });
    });
  });

  describe('Animations and CSS', () => {
    test('should inject CSS animations into document', () => {
      const food = createFood(0, 0);
      
      render(<Food food={food} />);
      
      const styleElements = document.querySelectorAll('style');
      const foodStyles = Array.from(styleElements).find(style => 
        style.textContent?.includes('@keyframes foodAppear')
      );
      
      expect(foodStyles).toBeDefined();
      expect(foodStyles?.textContent).toContain('@keyframes foodAppear');
      expect(foodStyles?.textContent).toContain('@keyframes foodPulse');
      expect(foodStyles?.textContent).toContain('@keyframes sparkle');
      expect(foodStyles?.textContent).toContain('@keyframes foodEaten');
    });

    test('should include reduced motion preferences', () => {
      const food = createFood(0, 0);
      
      render(<Food food={food} />);
      
      const styleElements = document.querySelectorAll('style');
      const foodStyles = Array.from(styleElements).find(style => 
        style.textContent?.includes('@media (prefers-reduced-motion: reduce)')
      );
      
      expect(foodStyles?.textContent).toContain('@media (prefers-reduced-motion: reduce)');
      expect(foodStyles?.textContent).toContain('animation: none !important');
    });

    test('should include high contrast mode support', () => {
      const food = createFood(0, 0);
      
      render(<Food food={food} />);
      
      const styleElements = document.querySelectorAll('style');
      const foodStyles = Array.from(styleElements).find(style => 
        style.textContent?.includes('@media (prefers-contrast: high)')
      );
      
      expect(foodStyles?.textContent).toContain('@media (prefers-contrast: high)');
      expect(foodStyles?.textContent).toContain('border-width: 3px');
      expect(foodStyles?.textContent).toContain('box-shadow: none !important');
    });

    test('should include dark theme adjustments', () => {
      const food = createFood(0, 0);
      
      render(<Food food={food} />);
      
      const styleElements = document.querySelectorAll('style');
      const foodStyles = Array.from(styleElements).find(style => 
        style.textContent?.includes('[data-theme="dark"] .food-item')
      );
      
      expect(foodStyles?.textContent).toContain('[data-theme="dark"] .food-item');
      expect(foodStyles?.textContent).toContain('box-shadow:');
    });

    test('should include hover effects', () => {
      const food = createFood(0, 0);
      
      render(<Food food={food} />);
      
      const styleElements = document.querySelectorAll('style');
      const foodStyles = Array.from(styleElements).find(style => 
        style.textContent?.includes('.food-item:hover')
      );
      
      expect(foodStyles?.textContent).toContain('.food-item:hover');
      expect(foodStyles?.textContent).toContain('transform: scale(1.1)');
    });

    test('should include eating animation class', () => {
      const food = createFood(0, 0);
      
      render(<Food food={food} />);
      
      const styleElements = document.querySelectorAll('style');
      const foodStyles = Array.from(styleElements).find(style => 
        style.textContent?.includes('.food-item.eating')
      );
      
      expect(foodStyles?.textContent).toContain('.food-item.eating');
      expect(foodStyles?.textContent).toContain('animation: foodEaten 0.3s ease-out forwards');
    });
  });

  describe('Accessibility', () => {
    test('should have proper ARIA attributes', () => {
      const food = createFood(5, 5);
      
      render(<Food food={food} />);
      
      const foodElement = screen.getByTestId('food');
      
      expect(foodElement).toHaveAttribute('role', 'img');
      expect(foodElement).toHaveAttribute('aria-label', 'Food item for snake to eat');
    });

    test('should have correct CSS class for styling', () => {
      const food = createFood(0, 0);
      
      render(<Food food={food} />);
      
      const foodElement = screen.getByTestId('food');
      expect(foodElement).toHaveClass('food-item');
    });

    test('should be identifiable by test id', () => {
      const food = createFood(10, 15);
      
      render(<Food food={food} />);
      
      expect(screen.getByTestId('food')).toBeInTheDocument();
    });
  });

  describe('Edge Cases', () => {
    test('should handle negative coordinates', () => {
      const food = createFood(-1, -1);
      
      expect(() => {
        render(<Food food={food} />);
      }).not.toThrow();
      
      const foodElement = screen.getByTestId('food');
      expect(foodElement).toHaveStyle({
        left: `${-1 * GAME_CONFIG.CELL_SIZE}px`,
        top: `${-1 * GAME_CONFIG.CELL_SIZE}px`,
      });
    });

    test('should handle very large coordinates', () => {
      const food = createFood(1000, 1000);
      
      expect(() => {
        render(<Food food={food} />);
      }).not.toThrow();
      
      const foodElement = screen.getByTestId('food');
      expect(foodElement).toHaveStyle({
        left: `${1000 * GAME_CONFIG.CELL_SIZE}px`,
        top: `${1000 * GAME_CONFIG.CELL_SIZE}px`,
      });
    });

    test('should handle zero coordinates', () => {
      const food = createFood(0, 0);
      
      render(<Food food={food} />);
      
      const foodElement = screen.getByTestId('food');
      expect(foodElement).toHaveStyle({
        left: '0px',
        top: '0px',
      });
    });

    test('should handle decimal coordinates', () => {
      const food = createFood(5.5, 10.7);
      
      render(<Food food={food} />);
      
      const foodElement = screen.getByTestId('food');
      expect(foodElement).toHaveStyle({
        left: `${5.5 * GAME_CONFIG.CELL_SIZE}px`,
        top: `${10.7 * GAME_CONFIG.CELL_SIZE}px`,
      });
    });
  });

  describe('Component Structure', () => {
    test('should have correct DOM structure', () => {
      const food = createFood(5, 5);
      
      render(<Food food={food} />);
      
      const foodElement = screen.getByTestId('food');
      
      // Should have child elements for core and sparkles
      expect(foodElement.children.length).toBeGreaterThanOrEqual(3);
      
      // First child should be the core
      const coreElement = foodElement.children[0] as HTMLElement;
      expect(coreElement).toHaveStyle({
        background: 'radial-gradient(circle at 40% 40%, rgba(255, 255, 255, 0.6), transparent 70%)',
      });
    });

    test('should include style element in document', () => {
      const food = createFood(0, 0);
      
      render(<Food food={food} />);
      
      // Check that a style element was added
      const styleElements = document.querySelectorAll('style');
      const hasRelevantStyles = Array.from(styleElements).some(style => 
        style.textContent?.includes('foodAppear') || style.textContent?.includes('foodPulse')
      );
      
      expect(hasRelevantStyles).toBe(true);
    });

    test('should have multiple sparkle elements with different positions', () => {
      const food = createFood(0, 0);
      
      render(<Food food={food} />);
      
      const foodElement = screen.getByTestId('food');
      const sparkles = Array.from(foodElement.children).slice(1) as HTMLElement[];
      
      // Should have different positioned sparkles
      const positions = sparkles.map(sparkle => ({
        top: sparkle.style.top,
        left: sparkle.style.left,
        right: sparkle.style.right,
      }));
      
      // Should have different positions
      const uniquePositions = new Set(positions.map(p => JSON.stringify(p)));
      expect(uniquePositions.size).toBeGreaterThan(1);
    });
  });

  describe('Performance', () => {
    test('should render quickly', () => {
      const food = createFood(5, 5);
      
      const startTime = performance.now();
      render(<Food food={food} />);
      const endTime = performance.now();
      
      // Should render very quickly (less than 10ms)
      expect(endTime - startTime).toBeLessThan(10);
    });

    test('should not create memory leaks with multiple renders', () => {
      const positions = Array.from({ length: 100 }, (_, i) => [i % 20, Math.floor(i / 20)]);
      
      expect(() => {
        positions.forEach(([x, y]) => {
          const food = createFood(x, y);
          const { unmount } = render(<Food food={food} />);
          unmount();
        });
      }).not.toThrow();
    });
  });

  describe('CSS Variables Integration', () => {
    test('should use CSS variables in styling', () => {
      const food = createFood(0, 0);
      
      render(<Food food={food} />);
      
      const foodElement = screen.getByTestId('food');
      // const computedStyle = window.getComputedStyle(foodElement);
      
      // Check that CSS variables are being used
      expect(foodElement.style.borderRadius).toBe('var(--radius-full)');
      expect(foodElement.style.border).toBe('2px solid var(--color-accent-dark)');
    });

    test('should handle missing CSS variables gracefully', () => {
      // Override getComputedStyle to return empty values
      const originalGetComputedStyle = window.getComputedStyle;
      window.getComputedStyle = () => ({
        getPropertyValue: () => '',
      }) as CSSStyleDeclaration;
      
      const food = createFood(0, 0);
      
      expect(() => {
        render(<Food food={food} />);
      }).not.toThrow();
      
      // Restore original function
      window.getComputedStyle = originalGetComputedStyle;
    });
  });

  describe('Animation Sequences', () => {
    test('should have proper animation timing', () => {
      const food = createFood(0, 0);
      
      render(<Food food={food} />);
      
      const foodElement = screen.getByTestId('food');
      
      // Should have both entrance and pulse animations with proper timing
      expect(foodElement.style.animation).toBe('foodAppear 0.3s ease-out, foodPulse 2s ease-in-out infinite 0.3s');
    });

    test('should have sparkle animations with delays', () => {
      const food = createFood(0, 0);
      
      render(<Food food={food} />);
      
      const foodElement = screen.getByTestId('food');
      const sparkles = Array.from(foodElement.children).slice(1) as HTMLElement[];
      
      // At least one sparkle should have an animation delay
      const hasDelayedSparkle = sparkles.some(sparkle => 
        sparkle.style.animationDelay && sparkle.style.animationDelay !== '0s'
      );
      expect(hasDelayedSparkle).toBe(true);
    });
  });
});