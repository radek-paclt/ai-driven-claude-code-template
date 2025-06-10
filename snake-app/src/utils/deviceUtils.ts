/**
 * Utility functions for device detection and responsive calculations
 */

/**
 * Detects if the device is mobile based on screen size and user agent
 */
export const isMobileDevice = (): boolean => {
  if (typeof window === 'undefined') return false;
  
  // Check screen size
  const isMobileSize = window.innerWidth <= 768;
  
  // Check user agent for mobile devices
  const userAgent = window.navigator.userAgent.toLowerCase();
  const isMobileUA = /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/.test(userAgent);
  
  return isMobileSize || isMobileUA;
};

/**
 * Detects if the device has touch capability
 */
export const isTouchDevice = (): boolean => {
  if (typeof window === 'undefined') return false;
  
  return 'ontouchstart' in window || navigator.maxTouchPoints > 0;
};

/**
 * Calculates optimal game board size for the current screen
 */
export const calculateGameBoardSize = (): {
  width: number;
  height: number;
  cellSize: number;
  isMobile: boolean;
} => {
  if (typeof window === 'undefined') {
    return { width: 20, height: 20, cellSize: 20, isMobile: false };
  }
  
  const { innerWidth, innerHeight } = window;
  const isMobile = isMobileDevice();
  
  // Reserve space for UI elements
  const reservedHeight = isMobile ? 320 : 320; // Header + controls + margins
  const reservedWidth = isMobile ? 20 : 40; // Side margins
  
  const availableWidth = Math.min(innerWidth - reservedWidth, isMobile ? innerWidth - 20 : 800);
  const availableHeight = Math.min(innerHeight - reservedHeight, isMobile ? innerHeight - 320 : 800);
  
  // Calculate cell size based on available space
  let cellSize: number;
  let boardWidth: number;
  let boardHeight: number;
  
  if (isMobile) {
    // For mobile, calculate exact board size that fits screen
    // Start with minimum viable cell size
    const minCellSize = 8;
    const maxCellSize = 16;
    
    // Calculate how many cells can fit horizontally and vertically
    const maxCellsWidth = Math.floor(availableWidth / minCellSize);
    const maxCellsHeight = Math.floor(availableHeight / minCellSize);
    
    // Use smaller dimension to ensure square-ish board
    const targetCells = Math.min(maxCellsWidth, maxCellsHeight);
    
    // Clamp to reasonable range (15-25 cells)
    boardWidth = Math.max(15, Math.min(25, targetCells));
    boardHeight = boardWidth; // Keep it square
    
    // Calculate exact cell size that fits the board perfectly in available space
    cellSize = Math.floor(Math.min(availableWidth / boardWidth, availableHeight / boardHeight));
    cellSize = Math.max(minCellSize, Math.min(maxCellSize, cellSize));
    
    // Final adjustment - ensure the board doesn't exceed available space
    const actualBoardWidth = boardWidth * cellSize;
    const actualBoardHeight = boardHeight * cellSize;
    
    if (actualBoardWidth > availableWidth || actualBoardHeight > availableHeight) {
      // Reduce board size if it still doesn't fit
      boardWidth = Math.floor(availableWidth / cellSize);
      boardHeight = Math.floor(availableHeight / cellSize);
    }
  } else {
    // For desktop, use full size
    cellSize = 20;
    boardWidth = 40;
    boardHeight = 40;
  }
  
  return {
    width: boardWidth,
    height: boardHeight,
    cellSize,
    isMobile,
  };
};

/**
 * Gets viewport meta tag configuration for mobile
 */
export const getViewportConfig = (): string => {
  return 'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no, viewport-fit=cover';
};