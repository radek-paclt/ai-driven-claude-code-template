import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { vi, describe, test, expect, beforeEach, afterEach } from 'vitest';
import { ThemeProvider } from '../contexts/ThemeContext';
import { ThemeToggle, CompactThemeToggle } from '../components/ThemeToggle';

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

describe('ThemeToggle', () => {
  let mockMatchMedia: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    localStorageMock.clear();
    mockMatchMedia = vi.fn();
    window.matchMedia = mockMatchMedia;
    mockMatchMedia.mockReturnValue(createMatchMediaMock(false));
    
    // Mock DOM methods
    const mockElement = {
      setAttribute: vi.fn(),
      name: '',
      content: '',
      tagName: 'META',
      cloneNode: vi.fn(),
      parentNode: null,
      nodeType: 1,
    };
    vi.spyOn(document.head, 'appendChild').mockImplementation(() => mockElement as any);
    vi.spyOn(document, 'querySelector').mockReturnValue(null);
    vi.spyOn(document, 'createElement').mockReturnValue(mockElement as any);
  });

  afterEach(() => {
    vi.restoreAllMocks();
    localStorageMock.clear();
  });

  describe('Basic Rendering', () => {
    test('should render with default props', () => {
      render(
        <ThemeProvider>
          <ThemeToggle />
        </ThemeProvider>
      );

      expect(screen.getByRole('switch')).toBeInTheDocument();
      expect(screen.getByText('Light Mode')).toBeInTheDocument();
      expect(screen.getByText('☀️')).toBeInTheDocument();
    });

    test('should render without label when showLabel is false', () => {
      render(
        <ThemeProvider>
          <ThemeToggle showLabel={false} />
        </ThemeProvider>
      );

      expect(screen.queryByText('Light Mode')).not.toBeInTheDocument();
      expect(screen.queryByText('Dark Mode')).not.toBeInTheDocument();
      expect(screen.getByRole('switch')).toBeInTheDocument();
    });

    test('should apply custom className', () => {
      render(
        <ThemeProvider>
          <ThemeToggle className="custom-class" />
        </ThemeProvider>
      );

      expect(screen.getByRole('switch').closest('.theme-toggle')).toHaveClass('custom-class');
    });

    test('should render with different sizes', () => {
      const { rerender } = render(
        <ThemeProvider>
          <ThemeToggle size="sm" />
        </ThemeProvider>
      );

      let toggle = screen.getByRole('switch');
      expect(toggle).toHaveStyle({ width: '40px', height: '20px' });

      rerender(
        <ThemeProvider>
          <ThemeToggle size="lg" />
        </ThemeProvider>
      );

      toggle = screen.getByRole('switch');
      expect(toggle).toHaveStyle({ width: '60px', height: '30px' });

      rerender(
        <ThemeProvider>
          <ThemeToggle size="md" />
        </ThemeProvider>
      );

      toggle = screen.getByRole('switch');
      expect(toggle).toHaveStyle({ width: '50px', height: '25px' });
    });
  });

  describe('Theme State Display', () => {
    test('should show correct content for light theme', () => {
      render(
        <ThemeProvider>
          <ThemeToggle />
        </ThemeProvider>
      );

      expect(screen.getByText('Light Mode')).toBeInTheDocument();
      expect(screen.getByText('☀️')).toBeInTheDocument();
      expect(screen.getByRole('switch')).toHaveAttribute('aria-checked', 'false');
      expect(screen.getByRole('switch')).toHaveAttribute('aria-label', 'Switch to dark theme');
    });

    test('should show correct content for dark theme', () => {
      localStorageMock.setItem('snake-game-theme', 'dark');

      render(
        <ThemeProvider>
          <ThemeToggle />
        </ThemeProvider>
      );

      expect(screen.getByText('Dark Mode')).toBeInTheDocument();
      expect(screen.getByText('🌙')).toBeInTheDocument();
      expect(screen.getByRole('switch')).toHaveAttribute('aria-checked', 'true');
      expect(screen.getByRole('switch')).toHaveAttribute('aria-label', 'Switch to light theme');
    });
  });

  describe('Interaction', () => {
    test('should toggle theme on click', () => {
      render(
        <ThemeProvider>
          <ThemeToggle />
        </ThemeProvider>
      );

      const toggle = screen.getByRole('switch');
      
      expect(screen.getByText('Light Mode')).toBeInTheDocument();
      
      fireEvent.click(toggle);
      
      expect(screen.getByText('Dark Mode')).toBeInTheDocument();
      expect(screen.getByText('🌙')).toBeInTheDocument();
    });

    test('should toggle theme on Enter key', () => {
      render(
        <ThemeProvider>
          <ThemeToggle />
        </ThemeProvider>
      );

      const toggle = screen.getByRole('switch');
      
      expect(screen.getByText('Light Mode')).toBeInTheDocument();
      
      fireEvent.keyDown(toggle, { key: 'Enter' });
      
      expect(screen.getByText('Dark Mode')).toBeInTheDocument();
    });

    test('should toggle theme on Space key', () => {
      render(
        <ThemeProvider>
          <ThemeToggle />
        </ThemeProvider>
      );

      const toggle = screen.getByRole('switch');
      
      expect(screen.getByText('Light Mode')).toBeInTheDocument();
      
      fireEvent.keyDown(toggle, { key: ' ' });
      
      expect(screen.getByText('Dark Mode')).toBeInTheDocument();
    });

    test('should not toggle on other keys', () => {
      render(
        <ThemeProvider>
          <ThemeToggle />
        </ThemeProvider>
      );

      const toggle = screen.getByRole('switch');
      
      expect(screen.getByText('Light Mode')).toBeInTheDocument();
      
      fireEvent.keyDown(toggle, { key: 'a' });
      fireEvent.keyDown(toggle, { key: 'Escape' });
      fireEvent.keyDown(toggle, { key: 'Tab' });
      
      expect(screen.getByText('Light Mode')).toBeInTheDocument();
    });

    test('should prevent default on valid key presses', () => {
      render(
        <ThemeProvider>
          <ThemeToggle />
        </ThemeProvider>
      );

      const toggle = screen.getByRole('switch');
      
      const enterEvent = new KeyboardEvent('keydown', { key: 'Enter', bubbles: true });
      const spaceEvent = new KeyboardEvent('keydown', { key: ' ', bubbles: true });
      
      const preventDefaultSpy1 = vi.spyOn(enterEvent, 'preventDefault');
      const preventDefaultSpy2 = vi.spyOn(spaceEvent, 'preventDefault');
      
      toggle.dispatchEvent(enterEvent);
      toggle.dispatchEvent(spaceEvent);
      
      expect(preventDefaultSpy1).toHaveBeenCalled();
      expect(preventDefaultSpy2).toHaveBeenCalled();
    });
  });

  describe('Focus Management', () => {
    test('should handle focus events', () => {
      render(
        <ThemeProvider>
          <ThemeToggle />
        </ThemeProvider>
      );

      const toggle = screen.getByRole('switch');
      
      fireEvent.focus(toggle);
      
      // Check if focus styling is applied (box-shadow change)
      expect(toggle.style.boxShadow).toContain('rgba(76, 175, 80');
    });

    test('should handle blur events', () => {
      render(
        <ThemeProvider>
          <ThemeToggle />
        </ThemeProvider>
      );

      const toggle = screen.getByRole('switch');
      
      fireEvent.focus(toggle);
      fireEvent.blur(toggle);
      
      // Should reset to default box-shadow
      expect(toggle.style.boxShadow).toBe('inset 0 2px 4px rgba(0,0,0,0.1)');
    });

    test('should show different focus styling for dark theme', () => {
      localStorageMock.setItem('snake-game-theme', 'dark');

      render(
        <ThemeProvider>
          <ThemeToggle />
        </ThemeProvider>
      );

      const toggle = screen.getByRole('switch');
      
      fireEvent.focus(toggle);
      
      expect(toggle.style.boxShadow).toContain('rgba(76, 175, 80');
      
      fireEvent.blur(toggle);
      
      // Dark theme should have different default shadow
      expect(toggle.style.boxShadow).toBe('var(--shadow-md)');
    });
  });

  describe('Accessibility', () => {
    test('should have proper ARIA attributes', () => {
      render(
        <ThemeProvider>
          <ThemeToggle />
        </ThemeProvider>
      );

      const toggle = screen.getByRole('switch');
      
      expect(toggle).toHaveAttribute('role', 'switch');
      expect(toggle).toHaveAttribute('aria-checked', 'false');
      expect(toggle).toHaveAttribute('aria-label', 'Switch to dark theme');
      expect(toggle).toHaveAttribute('tabIndex', '0');
    });

    test('should update ARIA attributes when theme changes', () => {
      render(
        <ThemeProvider>
          <ThemeToggle />
        </ThemeProvider>
      );

      const toggle = screen.getByRole('switch');
      
      fireEvent.click(toggle);
      
      expect(toggle).toHaveAttribute('aria-checked', 'true');
      expect(toggle).toHaveAttribute('aria-label', 'Switch to light theme');
    });

    test('should be keyboard accessible', () => {
      render(
        <ThemeProvider>
          <ThemeToggle />
        </ThemeProvider>
      );

      const toggle = screen.getByRole('switch');
      
      expect(toggle).toHaveAttribute('tabIndex', '0');
      
      // Should respond to keyboard events
      fireEvent.keyDown(toggle, { key: 'Enter' });
      expect(toggle).toHaveAttribute('aria-checked', 'true');
    });
  });

  describe('Visual State', () => {
    test('should position slider correctly for light theme', () => {
      render(
        <ThemeProvider>
          <ThemeToggle />
        </ThemeProvider>
      );

      const slider = screen.getByText('☀️').parentElement;
      expect(slider).toHaveStyle({ left: '2px' });
    });

    test('should position slider correctly for dark theme', () => {
      localStorageMock.setItem('snake-game-theme', 'dark');

      render(
        <ThemeProvider>
          <ThemeToggle />
        </ThemeProvider>
      );

      const slider = screen.getByText('🌙').parentElement;
      expect(slider).toHaveStyle({ left: 'calc(100% - 21px)' });
    });

    test('should apply correct background colors', () => {
      const { rerender } = render(
        <ThemeProvider>
          <ThemeToggle />
        </ThemeProvider>
      );

      let toggle = screen.getByRole('switch');
      expect(toggle).toHaveStyle({ backgroundColor: 'var(--border-secondary)' });

      localStorageMock.setItem('snake-game-theme', 'dark');
      rerender(
        <ThemeProvider>
          <ThemeToggle />
        </ThemeProvider>
      );

      toggle = screen.getByRole('switch');
      expect(toggle).toHaveStyle({ backgroundColor: 'var(--color-primary)' });
    });
  });
});

describe('CompactThemeToggle', () => {
  let mockMatchMedia: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    localStorageMock.clear();
    mockMatchMedia = vi.fn();
    window.matchMedia = mockMatchMedia;
    mockMatchMedia.mockReturnValue(createMatchMediaMock(false));
    
    // Mock DOM methods
    const mockElement = {
      setAttribute: vi.fn(),
      name: '',
      content: '',
      tagName: 'META',
      cloneNode: vi.fn(),
      parentNode: null,
      nodeType: 1,
    };
    vi.spyOn(document.head, 'appendChild').mockImplementation(() => mockElement as any);
    vi.spyOn(document, 'querySelector').mockReturnValue(null);
    vi.spyOn(document, 'createElement').mockReturnValue(mockElement as any);
  });

  afterEach(() => {
    vi.restoreAllMocks();
    localStorageMock.clear();
  });

  describe('Basic Rendering', () => {
    test('should render compact toggle', () => {
      render(
        <ThemeProvider>
          <CompactThemeToggle />
        </ThemeProvider>
      );

      const button = screen.getByRole('button');
      expect(button).toBeInTheDocument();
      expect(button).toHaveTextContent('☀️');
    });

    test('should apply custom className', () => {
      render(
        <ThemeProvider>
          <CompactThemeToggle className="compact-custom" />
        </ThemeProvider>
      );

      const button = screen.getByRole('button');
      expect(button).toHaveClass('compact-custom');
    });

    test('should have fixed size styling', () => {
      render(
        <ThemeProvider>
          <CompactThemeToggle />
        </ThemeProvider>
      );

      const button = screen.getByRole('button');
      expect(button).toHaveStyle({
        width: '40px',
        height: '40px',
      });
    });
  });

  describe('Theme State Display', () => {
    test('should show sun icon for light theme', () => {
      render(
        <ThemeProvider>
          <CompactThemeToggle />
        </ThemeProvider>
      );

      const button = screen.getByRole('button');
      expect(button).toHaveTextContent('☀️');
      expect(button).toHaveAttribute('aria-label', 'Switch to dark theme');
      expect(button).toHaveAttribute('title', 'Switch to dark theme');
    });

    test('should show moon icon for dark theme', () => {
      localStorageMock.setItem('snake-game-theme', 'dark');

      render(
        <ThemeProvider>
          <CompactThemeToggle />
        </ThemeProvider>
      );

      const button = screen.getByRole('button');
      expect(button).toHaveTextContent('🌙');
      expect(button).toHaveAttribute('aria-label', 'Switch to light theme');
      expect(button).toHaveAttribute('title', 'Switch to light theme');
    });
  });

  describe('Interaction', () => {
    test('should toggle theme on click', () => {
      render(
        <ThemeProvider>
          <CompactThemeToggle />
        </ThemeProvider>
      );

      const button = screen.getByRole('button');
      
      expect(button).toHaveTextContent('☀️');
      
      fireEvent.click(button);
      
      expect(button).toHaveTextContent('🌙');
    });

    test('should toggle theme on Enter key', () => {
      render(
        <ThemeProvider>
          <CompactThemeToggle />
        </ThemeProvider>
      );

      const button = screen.getByRole('button');
      
      expect(button).toHaveTextContent('☀️');
      
      fireEvent.keyDown(button, { key: 'Enter' });
      
      expect(button).toHaveTextContent('🌙');
    });

    test('should toggle theme on Space key', () => {
      render(
        <ThemeProvider>
          <CompactThemeToggle />
        </ThemeProvider>
      );

      const button = screen.getByRole('button');
      
      expect(button).toHaveTextContent('☀️');
      
      fireEvent.keyDown(button, { key: ' ' });
      
      expect(button).toHaveTextContent('🌙');
    });

    test('should prevent default on valid key presses', () => {
      render(
        <ThemeProvider>
          <CompactThemeToggle />
        </ThemeProvider>
      );

      const button = screen.getByRole('button');
      
      const enterEvent = new KeyboardEvent('keydown', { key: 'Enter', bubbles: true });
      const spaceEvent = new KeyboardEvent('keydown', { key: ' ', bubbles: true });
      
      const preventDefaultSpy1 = vi.spyOn(enterEvent, 'preventDefault');
      const preventDefaultSpy2 = vi.spyOn(spaceEvent, 'preventDefault');
      
      button.dispatchEvent(enterEvent);
      button.dispatchEvent(spaceEvent);
      
      expect(preventDefaultSpy1).toHaveBeenCalled();
      expect(preventDefaultSpy2).toHaveBeenCalled();
    });
  });

  describe('Accessibility', () => {
    test('should have proper accessibility attributes', () => {
      render(
        <ThemeProvider>
          <CompactThemeToggle />
        </ThemeProvider>
      );

      const button = screen.getByRole('button');
      
      expect(button).toHaveAttribute('aria-label', 'Switch to dark theme');
      expect(button).toHaveAttribute('title', 'Switch to dark theme');
    });

    test('should update accessibility attributes when theme changes', () => {
      render(
        <ThemeProvider>
          <CompactThemeToggle />
        </ThemeProvider>
      );

      const button = screen.getByRole('button');
      
      fireEvent.click(button);
      
      expect(button).toHaveAttribute('aria-label', 'Switch to light theme');
      expect(button).toHaveAttribute('title', 'Switch to light theme');
    });
  });

  describe('CSS Classes', () => {
    test('should have correct CSS classes', () => {
      render(
        <ThemeProvider>
          <CompactThemeToggle />
        </ThemeProvider>
      );

      const button = screen.getByRole('button');
      
      expect(button).toHaveClass('compact-theme-toggle');
      expect(button).toHaveClass('transition-all');
      expect(button).toHaveClass('hover-lift');
      expect(button).toHaveClass('focus-ring');
    });
  });

  describe('Error Handling', () => {
    test('should not break when used outside ThemeProvider', () => {
      const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {});

      expect(() => {
        render(<CompactThemeToggle />);
      }).toThrow('useTheme must be used within a ThemeProvider');

      consoleError.mockRestore();
    });
  });
});