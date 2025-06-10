import React from 'react';
import { render, screen, act, waitFor } from '@testing-library/react';
import { vi, describe, test, expect, beforeEach, afterEach } from 'vitest';
import { ThemeProvider, useTheme, useIsDarkTheme, useThemeColor } from '../contexts/ThemeContext';

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

// Test components
const TestComponent = () => {
  const { theme, toggleTheme, setTheme } = useTheme();
  return (
    <div>
      <span data-testid="current-theme">{theme}</span>
      <button data-testid="toggle-theme" onClick={toggleTheme}>
        Toggle
      </button>
      <button data-testid="set-light" onClick={() => setTheme('light')}>
        Set Light
      </button>
      <button data-testid="set-dark" onClick={() => setTheme('dark')}>
        Set Dark
      </button>
    </div>
  );
};

const ThemeHooksTestComponent = () => {
  const isDark = useIsDarkTheme();
  const color = useThemeColor('#000', '#fff');
  return (
    <div>
      <span data-testid="is-dark">{isDark.toString()}</span>
      <span data-testid="theme-color">{color}</span>
    </div>
  );
};

describe('ThemeContext', () => {
  let mockMatchMedia: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    localStorageMock.clear();
    mockMatchMedia = vi.fn();
    window.matchMedia = mockMatchMedia;
    
    // Mock document.head.appendChild for meta theme-color
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

  describe('ThemeProvider', () => {
    test('should provide theme context to children', () => {
      mockMatchMedia.mockReturnValue(createMatchMediaMock(false));

      render(
        <ThemeProvider>
          <TestComponent />
        </ThemeProvider>
      );

      expect(screen.getByTestId('current-theme')).toHaveTextContent('light');
    });

    test('should throw error when useTheme is used outside provider', () => {
      // Suppress console.error for this test
      const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {});

      expect(() => {
        render(<TestComponent />);
      }).toThrow('useTheme must be used within a ThemeProvider');

      consoleError.mockRestore();
    });
  });

  describe('Initial Theme Detection', () => {
    test('should use saved theme from localStorage', () => {
      localStorageMock.setItem('snake-game-theme', 'dark');
      mockMatchMedia.mockReturnValue(createMatchMediaMock(false));

      render(
        <ThemeProvider>
          <TestComponent />
        </ThemeProvider>
      );

      expect(screen.getByTestId('current-theme')).toHaveTextContent('dark');
    });

    test('should fall back to system preference when no saved theme', () => {
      mockMatchMedia.mockReturnValue(createMatchMediaMock(true));

      render(
        <ThemeProvider>
          <TestComponent />
        </ThemeProvider>
      );

      expect(screen.getByTestId('current-theme')).toHaveTextContent('dark');
    });

    test('should default to light theme when no saved theme and system prefers light', () => {
      mockMatchMedia.mockReturnValue(createMatchMediaMock(false));

      render(
        <ThemeProvider>
          <TestComponent />
        </ThemeProvider>
      );

      expect(screen.getByTestId('current-theme')).toHaveTextContent('light');
    });

    test('should default to light theme when matchMedia is not available', () => {
      window.matchMedia = undefined as any;

      render(
        <ThemeProvider>
          <TestComponent />
        </ThemeProvider>
      );

      expect(screen.getByTestId('current-theme')).toHaveTextContent('light');
    });

    test('should ignore invalid saved theme values', () => {
      localStorageMock.setItem('snake-game-theme', 'invalid' as any);
      mockMatchMedia.mockReturnValue(createMatchMediaMock(true));

      render(
        <ThemeProvider>
          <TestComponent />
        </ThemeProvider>
      );

      expect(screen.getByTestId('current-theme')).toHaveTextContent('dark');
    });
  });

  describe('Theme Switching', () => {
    test('should toggle between light and dark themes', async () => {
      mockMatchMedia.mockReturnValue(createMatchMediaMock(false));

      render(
        <ThemeProvider>
          <TestComponent />
        </ThemeProvider>
      );

      expect(screen.getByTestId('current-theme')).toHaveTextContent('light');

      await act(async () => {
        screen.getByTestId('toggle-theme').click();
      });

      expect(screen.getByTestId('current-theme')).toHaveTextContent('dark');

      await act(async () => {
        screen.getByTestId('toggle-theme').click();
      });

      expect(screen.getByTestId('current-theme')).toHaveTextContent('light');
    });

    test('should set specific theme via setTheme', async () => {
      mockMatchMedia.mockReturnValue(createMatchMediaMock(false));

      render(
        <ThemeProvider>
          <TestComponent />
        </ThemeProvider>
      );

      await act(async () => {
        screen.getByTestId('set-dark').click();
      });

      expect(screen.getByTestId('current-theme')).toHaveTextContent('dark');

      await act(async () => {
        screen.getByTestId('set-light').click();
      });

      expect(screen.getByTestId('current-theme')).toHaveTextContent('light');
    });

    test('should persist theme changes to localStorage', async () => {
      mockMatchMedia.mockReturnValue(createMatchMediaMock(false));

      render(
        <ThemeProvider>
          <TestComponent />
        </ThemeProvider>
      );

      await act(async () => {
        screen.getByTestId('set-dark').click();
      });

      expect(localStorageMock.getItem('snake-game-theme')).toBe('dark');

      await act(async () => {
        screen.getByTestId('toggle-theme').click();
      });

      expect(localStorageMock.getItem('snake-game-theme')).toBe('light');
    });
  });

  describe('DOM Updates', () => {
    test('should update document data-theme attribute', async () => {
      const setAttribute = vi.spyOn(document.documentElement, 'setAttribute');
      mockMatchMedia.mockReturnValue(createMatchMediaMock(false));

      render(
        <ThemeProvider>
          <TestComponent />
        </ThemeProvider>
      );

      expect(setAttribute).toHaveBeenCalledWith('data-theme', 'light');

      await act(async () => {
        screen.getByTestId('set-dark').click();
      });

      expect(setAttribute).toHaveBeenCalledWith('data-theme', 'dark');
    });

    test('should update meta theme-color', async () => {
      const mockMeta = {
        setAttribute: vi.fn(),
        name: 'theme-color',
        content: '',
      };

      vi.spyOn(document, 'querySelector').mockReturnValue(mockMeta as any);
      mockMatchMedia.mockReturnValue(createMatchMediaMock(false));

      render(
        <ThemeProvider>
          <TestComponent />
        </ThemeProvider>
      );

      expect(mockMeta.setAttribute).toHaveBeenCalledWith('content', '#FAFAFA');

      await act(async () => {
        screen.getByTestId('set-dark').click();
      });

      expect(mockMeta.setAttribute).toHaveBeenCalledWith('content', '#121212');
    });

    test('should create meta theme-color if it does not exist', () => {
      const mockMeta = {
        setAttribute: vi.fn(),
        name: '',
        content: '',
      };

      const createElement = vi.spyOn(document, 'createElement').mockReturnValue(mockMeta as any);
      const appendChild = vi.spyOn(document.head, 'appendChild');
      vi.spyOn(document, 'querySelector').mockReturnValue(null);
      mockMatchMedia.mockReturnValue(createMatchMediaMock(false));

      render(
        <ThemeProvider>
          <TestComponent />
        </ThemeProvider>
      );

      expect(createElement).toHaveBeenCalledWith('meta');
      expect(mockMeta.name).toBe('theme-color');
      expect(mockMeta.content).toBe('#FAFAFA');
      expect(appendChild).toHaveBeenCalledWith(mockMeta);
    });
  });

  describe('System Theme Changes', () => {
    test('should listen for system theme changes', () => {
      const mockMediaQuery = createMatchMediaMock(false);
      mockMatchMedia.mockReturnValue(mockMediaQuery);

      render(
        <ThemeProvider>
          <TestComponent />
        </ThemeProvider>
      );

      expect(mockMediaQuery.addEventListener).toHaveBeenCalledWith('change', expect.any(Function));
    });

    test('should handle system theme changes when no saved theme', async () => {
      let changeHandler: ((e: MediaQueryListEvent) => void) | null = null;
      const mockMediaQuery = {
        ...createMatchMediaMock(false),
        addEventListener: vi.fn((event, handler) => {
          if (event === 'change') {
            changeHandler = handler;
          }
        }),
      };
      mockMatchMedia.mockReturnValue(mockMediaQuery);

      render(
        <ThemeProvider>
          <TestComponent />
        </ThemeProvider>
      );

      expect(screen.getByTestId('current-theme')).toHaveTextContent('light');

      // Simulate system theme change to dark
      if (changeHandler) {
        await act(async () => {
          changeHandler({ matches: true } as MediaQueryListEvent);
        });
      }

      expect(screen.getByTestId('current-theme')).toHaveTextContent('dark');
    });

    test('should not auto-switch when theme is saved in localStorage', async () => {
      localStorageMock.setItem('snake-game-theme', 'light');

      let changeHandler: ((e: MediaQueryListEvent) => void) | null = null;
      const mockMediaQuery = {
        ...createMatchMediaMock(false),
        addEventListener: vi.fn((event, handler) => {
          if (event === 'change') {
            changeHandler = handler;
          }
        }),
      };
      mockMatchMedia.mockReturnValue(mockMediaQuery);

      render(
        <ThemeProvider>
          <TestComponent />
        </ThemeProvider>
      );

      expect(screen.getByTestId('current-theme')).toHaveTextContent('light');

      // Simulate system theme change to dark
      if (changeHandler) {
        await act(async () => {
          changeHandler({ matches: true } as MediaQueryListEvent);
        });
      }

      // Should still be light because it's saved in localStorage
      expect(screen.getByTestId('current-theme')).toHaveTextContent('light');
    });

    test('should handle legacy addListener/removeListener', () => {
      const mockMediaQuery = {
        ...createMatchMediaMock(false),
        addEventListener: undefined,
        addListener: vi.fn(),
        removeListener: vi.fn(),
      };
      mockMatchMedia.mockReturnValue(mockMediaQuery);

      const { unmount } = render(
        <ThemeProvider>
          <TestComponent />
        </ThemeProvider>
      );

      expect(mockMediaQuery.addListener).toHaveBeenCalledWith(expect.any(Function));

      unmount();

      expect(mockMediaQuery.removeListener).toHaveBeenCalled();
    });

    test('should cleanup event listeners on unmount', () => {
      const mockMediaQuery = createMatchMediaMock(false);
      mockMatchMedia.mockReturnValue(mockMediaQuery);

      const { unmount } = render(
        <ThemeProvider>
          <TestComponent />
        </ThemeProvider>
      );

      unmount();

      expect(mockMediaQuery.removeEventListener).toHaveBeenCalledWith('change', expect.any(Function));
    });
  });

  describe('Theme Hooks', () => {
    test('useIsDarkTheme should return correct boolean', async () => {
      mockMatchMedia.mockReturnValue(createMatchMediaMock(false));

      render(
        <ThemeProvider>
          <ThemeHooksTestComponent />
          <TestComponent />
        </ThemeProvider>
      );

      expect(screen.getByTestId('is-dark')).toHaveTextContent('false');

      await act(async () => {
        screen.getByTestId('set-dark').click();
      });

      expect(screen.getByTestId('is-dark')).toHaveTextContent('true');
    });

    test('useThemeColor should return correct color based on theme', async () => {
      mockMatchMedia.mockReturnValue(createMatchMediaMock(false));

      render(
        <ThemeProvider>
          <ThemeHooksTestComponent />
          <TestComponent />
        </ThemeProvider>
      );

      expect(screen.getByTestId('theme-color')).toHaveTextContent('#000');

      await act(async () => {
        screen.getByTestId('set-dark').click();
      });

      expect(screen.getByTestId('theme-color')).toHaveTextContent('#fff');
    });

    test('theme hooks should throw error outside provider', () => {
      const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {});

      expect(() => {
        render(<ThemeHooksTestComponent />);
      }).toThrow('useTheme must be used within a ThemeProvider');

      consoleError.mockRestore();
    });
  });

  describe('Edge Cases', () => {
    test('should handle window being undefined (SSR)', () => {
      const originalWindow = global.window;
      // @ts-ignore
      delete global.window;

      expect(() => {
        render(
          <ThemeProvider>
            <TestComponent />
          </ThemeProvider>
        );
      }).not.toThrow();

      global.window = originalWindow;
    });

    test('should handle matchMedia not being available', () => {
      window.matchMedia = undefined as any;

      expect(() => {
        render(
          <ThemeProvider>
            <TestComponent />
          </ThemeProvider>
        );
      }).not.toThrow();
    });

    test('should handle localStorage errors gracefully', () => {
      const originalSetItem = localStorageMock.setItem;
      localStorageMock.setItem = vi.fn(() => {
        throw new Error('LocalStorage error');
      });

      expect(() => {
        render(
          <ThemeProvider>
            <TestComponent />
          </ThemeProvider>
        );
      }).not.toThrow();

      localStorageMock.setItem = originalSetItem;
    });
  });

  describe('Performance', () => {
    test('should not cause unnecessary re-renders', async () => {
      mockMatchMedia.mockReturnValue(createMatchMediaMock(false));

      const renderCount = vi.fn();
      const TrackingComponent = () => {
        renderCount();
        const { theme } = useTheme();
        return <div data-testid="theme">{theme}</div>;
      };

      render(
        <ThemeProvider>
          <TrackingComponent />
          <TestComponent />
        </ThemeProvider>
      );

      const initialRenderCount = renderCount.mock.calls.length;

      // Theme change should cause re-render
      await act(async () => {
        screen.getByTestId('toggle-theme').click();
      });

      expect(renderCount).toHaveBeenCalledTimes(initialRenderCount + 1);

      // Same theme should not cause re-render
      await act(async () => {
        screen.getByTestId('set-dark').click();
      });

      expect(renderCount).toHaveBeenCalledTimes(initialRenderCount + 1);
    });
  });
});