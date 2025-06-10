import React, { useEffect, useCallback, useState } from 'react';
import { Snake } from './Snake';
import { Food } from './Food';
import { TrapList } from './Trap';
import { ObstacleList } from './Obstacle';
import { GameHistory } from './GameHistory';
import { Statistics } from './Statistics';
import { useGameState } from '../hooks/useGameState';
import { useKeyboard } from '../hooks/useKeyboard';
import { useTouchControls } from '../hooks/useTouchControls';
import { GAME_CONFIG } from '../constants/gameConfig';
import { useGameConfig } from '../contexts/GameConfigContext';

/**
 * Main GameBoard component that orchestrates the entire snake game.
 * Manages the game loop, renders all game elements, and handles user interactions.
 */
export const GameBoard: React.FC = () => {
  const { boardWidth, boardHeight, cellSize, isMobile } = useGameConfig();

  const {
    gameState,
    gameSpeed,
    moveSnake,
    changeDirection,
    startGame,
    togglePause,
    resetGame,
    resumeSavedGame,
    getGameHistory,
    getStatistics,
    clearHistory,
    exportData,
    importData,
    hasSavedGame,
  } = useGameState(boardWidth, boardHeight);

  const [showHistory, setShowHistory] = useState(false);
  const [showStatistics, setShowStatistics] = useState(false);
  const [gameHistory, setGameHistory] = useState(() => getGameHistory());
  const [statistics, setStatistics] = useState(() => getStatistics());

  const { updateLastDirection } = useKeyboard(changeDirection);
  
  // Touch controls for mobile devices
  useTouchControls(changeDirection, gameState.isPlaying);

  // Update history and statistics when game ends
  useEffect(() => {
    if (gameState.isGameOver) {
      setGameHistory(getGameHistory());
      setStatistics(getStatistics());
    }
  }, [gameState.isGameOver, getGameHistory, getStatistics]);

  // Refresh data when toggling views
  const refreshData = useCallback(() => {
    setGameHistory(getGameHistory());
    setStatistics(getStatistics());
  }, [getGameHistory, getStatistics]);

  // Handle history actions
  const handleClearHistory = useCallback(() => {
    if (window.confirm('Are you sure you want to clear all game history? This cannot be undone.')) {
      clearHistory();
      refreshData();
    }
  }, [clearHistory, refreshData]);

  const handleExportData = useCallback(() => {
    try {
      const data = exportData();
      const blob = new Blob([data], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `snake-game-data-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      alert('Failed to export data. Please try again.');
    }
  }, [exportData]);

  const handleImportData = useCallback(() => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (e) => {
          try {
            const data = e.target?.result as string;
            if (importData(data)) {
              refreshData();
              alert('Data imported successfully!');
            } else {
              alert('Failed to import data. Please check the file format.');
            }
          } catch (error) {
            alert('Failed to import data. Please check the file format.');
          }
        };
        reader.readAsText(file);
      }
    };
    input.click();
  }, [importData, refreshData]);

  // Update keyboard hook when direction changes
  useEffect(() => {
    updateLastDirection(gameState.direction);
  }, [gameState.direction, updateLastDirection]);

  // Game loop using requestAnimationFrame for smooth performance
  const gameLoop = useCallback(() => {
    moveSnake();
  }, [moveSnake]);

  // Start/stop the game loop based on game state
  useEffect(() => {
    if (gameState.isPlaying && !gameState.isGameOver) {
      const interval = setInterval(gameLoop, gameSpeed);
      return () => clearInterval(interval);
    }
  }, [gameState.isPlaying, gameState.isGameOver, gameSpeed, gameLoop]);

  // Handle spacebar for pause/start
  useEffect(() => {
    const handleSpaceBar = (event: KeyboardEvent) => {
      if (event.code === 'Space') {
        event.preventDefault();
        if (gameState.isGameOver) {
          resetGame();
        } else if (
          !gameState.isPlaying &&
          gameState.snake.length === 3 &&
          gameState.score === 0
        ) {
          startGame();
        } else {
          togglePause();
        }
      }
    };

    window.addEventListener('keydown', handleSpaceBar);
    return () => window.removeEventListener('keydown', handleSpaceBar);
  }, [
    gameState.isGameOver,
    gameState.isPlaying,
    gameState.snake.length,
    gameState.score,
    resetGame,
    startGame,
    togglePause,
  ]);

  const actualBoardWidth = boardWidth * cellSize;
  const actualBoardHeight = boardHeight * cellSize;
  
  const boardStyle: React.CSSProperties = {
    position: 'relative',
    width: `${actualBoardWidth}px`,
    height: `${actualBoardHeight}px`,
    backgroundColor: '#1a1a1a',
    border: isMobile ? '1px solid #333' : '3px solid #333',
    borderRadius: isMobile ? '4px' : '8px',
    margin: '0 auto',
    overflow: 'hidden',
    // Add grid pattern for visual reference
    backgroundImage: `
      linear-gradient(rgba(255,255,255,0.02) 1px, transparent 1px),
      linear-gradient(90deg, rgba(255,255,255,0.02) 1px, transparent 1px)
    `,
    backgroundSize: `${cellSize}px ${cellSize}px`,
    // Add touch-action for better mobile performance
    touchAction: 'none',
    userSelect: 'none',
  };

  const overlayStyle: React.CSSProperties = {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    color: 'white',
    fontSize: '24px',
    fontWeight: 'bold',
    zIndex: 10,
    borderRadius: '5px',
  };

  const buttonStyle: React.CSSProperties = {
    marginTop: '20px',
    padding: '12px 24px',
    fontSize: '18px',
    backgroundColor: '#4CAF50',
    color: 'white',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
    transition: 'background-color 0.2s',
  };

  const scoreStyle: React.CSSProperties = {
    fontSize: isMobile ? '16px' : '20px',
    fontWeight: 'bold',
    color: '#4CAF50',
    marginBottom: isMobile ? '5px' : '10px',
    textAlign: 'center',
  };

  const instructionsStyle: React.CSSProperties = {
    fontSize: isMobile ? '12px' : '14px',
    color: '#ccc',
    textAlign: 'center',
    marginTop: isMobile ? '5px' : '10px',
    lineHeight: '1.4',
  };

  // Calculate current game speed percentage (for display)
  const speedPercentage = Math.round(((GAME_CONFIG.INITIAL_SPEED - gameSpeed) / (GAME_CONFIG.INITIAL_SPEED - 50)) * 100);
  const displaySpeed = Math.max(0, speedPercentage);

  // Additional styles for new components
  const sidebarToggleStyle: React.CSSProperties = {
    position: isMobile ? 'static' : 'fixed',
    right: isMobile ? 'auto' : '20px',
    top: isMobile ? 'auto' : '20px',
    display: 'flex',
    flexDirection: isMobile ? 'row' : 'column',
    flexWrap: isMobile ? 'wrap' : 'nowrap',
    gap: isMobile ? '8px' : '10px',
    zIndex: 1000,
    marginTop: isMobile ? '15px' : '0',
    marginBottom: isMobile ? '15px' : '0',
    justifyContent: isMobile ? 'center' : 'flex-start',
  };

  const toggleButtonStyle: React.CSSProperties = {
    padding: isMobile ? '6px 12px' : '8px 16px',
    fontSize: isMobile ? '12px' : '14px',
    backgroundColor: '#4CAF50',
    color: 'white',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
    transition: 'background-color 0.2s',
    minWidth: isMobile ? '80px' : '120px',
    textAlign: 'center',
  };

  const overlayStyle2: React.CSSProperties = {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 2000,
    padding: '20px',
  };

  const modalStyle: React.CSSProperties = {
    maxWidth: '90vw',
    maxHeight: '90vh',
    overflow: 'auto',
    position: 'relative',
  };

  const closeButtonStyle: React.CSSProperties = {
    position: 'absolute',
    top: '10px',
    right: '10px',
    padding: '5px 10px',
    fontSize: '16px',
    backgroundColor: '#f44336',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    zIndex: 10,
  };

  const savedGameIndicatorStyle: React.CSSProperties = {
    position: 'absolute',
    top: '10px',
    left: '10px',
    padding: '5px 10px',
    fontSize: '12px',
    backgroundColor: hasSavedGame() ? '#4CAF50' : 'transparent',
    color: 'white',
    border: hasSavedGame() ? 'none' : '1px solid #666',
    borderRadius: '4px',
    display: hasSavedGame() ? 'block' : 'none',
  };

  return (
    <div style={{ 
      textAlign: 'center', 
      padding: isMobile ? '10px 5px' : '20px', 
      position: 'relative',
      maxWidth: '100vw',
      overflow: 'hidden',
    }}>
      {/* Sidebar Toggle Buttons */}
      <div style={sidebarToggleStyle}>
        <button
          style={toggleButtonStyle}
          onClick={() => {
            setShowStatistics(!showStatistics);
            if (!showStatistics) refreshData();
          }}
          onMouseEnter={e => e.currentTarget.style.backgroundColor = '#45a049'}
          onMouseLeave={e => e.currentTarget.style.backgroundColor = '#4CAF50'}
        >
          {showStatistics ? 'Hide Stats' : 'Show Stats'}
        </button>
        
        <button
          style={toggleButtonStyle}
          onClick={() => {
            setShowHistory(!showHistory);
            if (!showHistory) refreshData();
          }}
          onMouseEnter={e => e.currentTarget.style.backgroundColor = '#45a049'}
          onMouseLeave={e => e.currentTarget.style.backgroundColor = '#4CAF50'}
        >
          {showHistory ? 'Hide History' : 'Show History'}
        </button>

        <button
          style={{...toggleButtonStyle, backgroundColor: '#FF6B6B'}}
          onClick={handleImportData}
          onMouseEnter={e => e.currentTarget.style.backgroundColor = '#FF5252'}
          onMouseLeave={e => e.currentTarget.style.backgroundColor = '#FF6B6B'}
        >
          Import Data
        </button>

        {hasSavedGame() && (
          <button
            style={{...toggleButtonStyle, backgroundColor: '#FFA500'}}
            onClick={() => {
              if (window.confirm('Resume your saved game?')) {
                resumeSavedGame();
              }
            }}
            onMouseEnter={e => e.currentTarget.style.backgroundColor = '#FF8C00'}
            onMouseLeave={e => e.currentTarget.style.backgroundColor = '#FFA500'}
          >
            Resume Game
          </button>
        )}
      </div>

      {/* Saved Game Indicator */}
      <div style={savedGameIndicatorStyle}>
        💾 Saved Game Available
      </div>

      <div style={scoreStyle} data-testid="score">
        Score: {gameState.score}
      </div>
      
      <div style={{ ...scoreStyle, fontSize: isMobile ? '14px' : '16px', color: '#FF6B6B', marginBottom: isMobile ? '3px' : '5px' }} data-testid="speed-indicator">
        Speed: {displaySpeed}% {gameSpeed < GAME_CONFIG.INITIAL_SPEED && '🚀'}
      </div>

      <div style={{ 
        ...scoreStyle, 
        fontSize: isMobile ? '14px' : '16px', 
        color: gameState.obstacleReshapeCountdown <= 10 ? '#FF4444' : '#4CAF50', 
        marginBottom: isMobile ? '3px' : '5px',
        fontWeight: gameState.obstacleReshapeCountdown <= 10 ? 'bold' : 'normal'
      }} data-testid="reshape-countdown">
        {gameState.obstacleReshapeCountdown <= 10 ? '⚠️' : '🔄'} Obstacles change in: {gameState.obstacleReshapeCountdown}s
      </div>

      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        width: '100%',
        margin: isMobile ? '10px 0' : '0'
      }}>
        <div style={boardStyle} data-testid="game-board">
        <ObstacleList obstacles={gameState.obstacles} />
        <Snake snake={gameState.snake} />
        <Food food={gameState.food} />
        <TrapList traps={gameState.traps} warningPosition={gameState.trapWarning} />

        {/* Game Over Overlay */}
        {gameState.isGameOver && (
          <div style={overlayStyle} data-testid="game-over-overlay">
            <div>Game Over!</div>
            <div style={{ fontSize: '18px', margin: '10px 0' }}>
              Final Score: {gameState.score}
            </div>
            <button
              style={buttonStyle}
              onClick={resetGame}
              onMouseEnter={e => {
                e.currentTarget.style.backgroundColor = '#45a049';
              }}
              onMouseLeave={e => {
                e.currentTarget.style.backgroundColor = '#4CAF50';
              }}
            >
              Play Again (Space)
            </button>
          </div>
        )}

        {/* Start Game Overlay */}
        {!gameState.isPlaying &&
          !gameState.isGameOver &&
          gameState.snake.length === 3 &&
          gameState.score === 0 && (
            <div style={overlayStyle} data-testid="start-overlay">
              <div>Snake Game</div>
              <button
                style={buttonStyle}
                onClick={startGame}
                onMouseEnter={e => {
                  e.currentTarget.style.backgroundColor = '#45a049';
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.backgroundColor = '#4CAF50';
                }}
              >
                Start Game (Space)
              </button>
            </div>
          )}

        {/* Paused Overlay */}
        {!gameState.isPlaying &&
          !gameState.isGameOver &&
          !(gameState.snake.length === 3 && gameState.score === 0) && (
            <div style={overlayStyle} data-testid="paused-overlay">
              <div>Paused</div>
              <button
                style={buttonStyle}
                onClick={togglePause}
                onMouseEnter={e => {
                  e.currentTarget.style.backgroundColor = '#45a049';
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.backgroundColor = '#4CAF50';
                }}
              >
                Resume (Space)
              </button>
            </div>
          )}
        </div>
      </div>

      <div style={instructionsStyle}>
        {isMobile ? (
          <>
            <div>👆 Swipe to control direction</div>
            <div>🍎 Eat red food to grow and score</div>
            <div>🧱 Avoid brown obstacles</div>
            <div>🔄 Obstacles change every 30-45s</div>
          </>
        ) : (
          <>
            <div>Use WASD or Arrow Keys to move</div>
            <div>Space to pause/resume</div>
            <div>Eat red food to grow and score points</div>
            <div>🌊 Pass through walls to appear on the opposite side</div>
            <div>⚡ Speed increases every 10 points</div>
          </>
        )}
        <div>🪤 Avoid orange traps - they cut your snake length in half!</div>
        <div>📊 View your game statistics and history using the buttons on the right</div>
        <div>💾 Games are automatically saved and can be resumed</div>
      </div>

      {/* Statistics Modal */}
      {showStatistics && (
        <div style={overlayStyle2}>
          <div style={modalStyle}>
            <button 
              style={closeButtonStyle}
              onClick={() => setShowStatistics(false)}
            >
              ✕
            </button>
            <Statistics statistics={statistics} gameHistory={gameHistory} />
          </div>
        </div>
      )}

      {/* Game History Modal */}
      {showHistory && (
        <div style={overlayStyle2}>
          <div style={modalStyle}>
            <button 
              style={closeButtonStyle}
              onClick={() => setShowHistory(false)}
            >
              ✕
            </button>
            <GameHistory 
              history={gameHistory}
              onClearHistory={handleClearHistory}
              onExportData={handleExportData}
            />
          </div>
        </div>
      )}
    </div>
  );
};
