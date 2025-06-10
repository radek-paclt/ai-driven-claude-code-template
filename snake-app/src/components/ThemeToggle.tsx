import React from 'react';
import { useTheme } from '../contexts/ThemeContext';

interface ThemeToggleProps {
  className?: string;
  showLabel?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

/**
 * Theme toggle component with smooth transitions and accessibility support
 */
export const ThemeToggle: React.FC<ThemeToggleProps> = ({ 
  className = '', 
  showLabel = true,
  size = 'md'
}) => {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === 'dark';

  const getSizeStyles = () => {
    switch (size) {
      case 'sm':
        return {
          width: '40px',
          height: '20px',
          fontSize: '10px',
        };
      case 'lg':
        return {
          width: '60px',
          height: '30px',
          fontSize: '14px',
        };
      default:
        return {
          width: '50px',
          height: '25px',
          fontSize: '12px',
        };
    }
  };

  const sizeStyles = getSizeStyles();

  const containerStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: 'var(--space-md)',
    fontFamily: 'inherit',
  };

  const toggleStyle: React.CSSProperties = {
    position: 'relative',
    display: 'inline-block',
    width: sizeStyles.width,
    height: sizeStyles.height,
    backgroundColor: isDark ? 'var(--color-primary)' : 'var(--border-secondary)',
    borderRadius: 'calc(var(--radius-full) * 2)',
    border: '2px solid transparent',
    cursor: 'pointer',
    transition: 'all var(--duration-normal) var(--ease-in-out)',
    outline: 'none',
    boxShadow: isDark ? 'var(--shadow-md)' : 'inset 0 2px 4px rgba(0,0,0,0.1)',
  };

  const sliderStyle: React.CSSProperties = {
    position: 'absolute',
    top: '2px',
    left: isDark ? `calc(100% - ${parseInt(sizeStyles.height) - 4}px)` : '2px',
    width: `${parseInt(sizeStyles.height) - 4}px`,
    height: `${parseInt(sizeStyles.height) - 4}px`,
    backgroundColor: isDark ? '#FFD54F' : 'var(--bg-secondary)',
    borderRadius: 'var(--radius-full)',
    transition: 'all var(--duration-normal) var(--ease-in-out)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: sizeStyles.fontSize,
    boxShadow: 'var(--shadow-sm)',
  };

  const labelStyle: React.CSSProperties = {
    fontSize: 'var(--font-size-sm)',
    fontWeight: 'var(--font-weight-medium)',
    color: 'var(--text-secondary)',
    userSelect: 'none',
    transition: 'color var(--duration-normal) var(--ease-in-out)',
  };

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      toggleTheme();
    }
  };

  const handleFocus = (event: React.FocusEvent<HTMLDivElement>) => {
    event.currentTarget.style.boxShadow = 
      `0 0 0 3px ${isDark ? 'rgba(76, 175, 80, 0.3)' : 'rgba(76, 175, 80, 0.2)'}`;
  };

  const handleBlur = (event: React.FocusEvent<HTMLDivElement>) => {
    event.currentTarget.style.boxShadow = 
      isDark ? 'var(--shadow-md)' : 'inset 0 2px 4px rgba(0,0,0,0.1)';
  };

  return (
    <div className={`theme-toggle ${className}`} style={containerStyle}>
      {showLabel && (
        <span style={labelStyle}>
          {isDark ? 'Dark' : 'Light'} Mode
        </span>
      )}
      
      <div
        role="switch"
        aria-checked={isDark}
        aria-label={`Switch to ${isDark ? 'light' : 'dark'} theme`}
        tabIndex={0}
        style={toggleStyle}
        onClick={toggleTheme}
        onKeyDown={handleKeyDown}
        onFocus={handleFocus}
        onBlur={handleBlur}
        className="transition-all"
      >
        <div style={sliderStyle}>
          <span style={{ lineHeight: 1 }}>
            {isDark ? '🌙' : '☀️'}
          </span>
        </div>
      </div>
    </div>
  );
};

/**
 * Compact theme toggle for use in limited space
 */
export const CompactThemeToggle: React.FC<{ className?: string }> = ({ className }) => {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === 'dark';

  const buttonStyle: React.CSSProperties = {
    background: 'var(--bg-secondary)',
    border: '1px solid var(--border-primary)',
    borderRadius: 'var(--radius-md)',
    padding: 'var(--space-sm)',
    cursor: 'pointer',
    transition: 'all var(--duration-normal) var(--ease-in-out)',
    fontSize: 'var(--font-size-lg)',
    width: '40px',
    height: '40px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    outline: 'none',
  };

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      toggleTheme();
    }
  };

  return (
    <button
      className={`compact-theme-toggle transition-all hover-lift focus-ring ${className || ''}`}
      style={buttonStyle}
      onClick={toggleTheme}
      onKeyDown={handleKeyDown}
      aria-label={`Switch to ${isDark ? 'light' : 'dark'} theme`}
      title={`Switch to ${isDark ? 'light' : 'dark'} theme`}
    >
      {isDark ? '🌙' : '☀️'}
    </button>
  );
};