import React, { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import { calculateGameBoardSize } from '../utils/deviceUtils';
import { GAME_CONFIG } from '../constants/gameConfig';

interface GameConfigContextType {
  boardWidth: number;
  boardHeight: number;
  cellSize: number;
  isMobile: boolean;
}

const GameConfigContext = createContext<GameConfigContextType>({
  boardWidth: GAME_CONFIG.BOARD_WIDTH,
  boardHeight: GAME_CONFIG.BOARD_HEIGHT,
  cellSize: GAME_CONFIG.CELL_SIZE,
  isMobile: false,
});

interface GameConfigProviderProps {
  children: ReactNode;
}

export const GameConfigProvider: React.FC<GameConfigProviderProps> = ({ children }) => {
  const [config, setConfig] = useState(() => {
    const size = calculateGameBoardSize();
    return {
      boardWidth: size.width,
      boardHeight: size.height,
      cellSize: size.cellSize,
      isMobile: size.isMobile,
    };
  });

  useEffect(() => {
    const handleResize = () => {
      const size = calculateGameBoardSize();
      setConfig({
        boardWidth: size.width,
        boardHeight: size.height,
        cellSize: size.cellSize,
        isMobile: size.isMobile,
      });
    };

    window.addEventListener('resize', handleResize);
    window.addEventListener('orientationchange', handleResize);
    
    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('orientationchange', handleResize);
    };
  }, []);

  return (
    <GameConfigContext.Provider value={config}>
      {children}
    </GameConfigContext.Provider>
  );
};

export const useGameConfig = (): GameConfigContextType => {
  const context = useContext(GameConfigContext);
  if (!context) {
    throw new Error('useGameConfig must be used within a GameConfigProvider');
  }
  return context;
};