import React, { useState, useMemo } from 'react';
import type { GameSession } from '../types';

interface GameHistoryProps {
  history: GameSession[];
  onClearHistory: () => void;
  onExportData: () => void;
}

/**
 * Component for displaying game history with sorting and filtering options
 */
export const GameHistory: React.FC<GameHistoryProps> = ({
  history,
  onClearHistory,
  onExportData,
}) => {
  const [sortBy, setSortBy] = useState<'timestamp' | 'score' | 'duration'>('timestamp');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [showDetails, setShowDetails] = useState<string | null>(null);

  // Sort history based on current sort settings
  const sortedHistory = useMemo(() => {
    return [...history].sort((a, b) => {
      let comparison = 0;
      
      switch (sortBy) {
        case 'timestamp':
          comparison = a.timestamp - b.timestamp;
          break;
        case 'score':
          comparison = a.score - b.score;
          break;
        case 'duration':
          comparison = a.duration - b.duration;
          break;
      }
      
      return sortOrder === 'asc' ? comparison : -comparison;
    });
  }, [history, sortBy, sortOrder]);

  const formatDuration = (ms: number): string => {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    
    if (minutes > 0) {
      return `${minutes}m ${remainingSeconds}s`;
    }
    return `${remainingSeconds}s`;
  };

  const formatDate = (timestamp: number): string => {
    return new Date(timestamp).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const toggleSort = (newSortBy: typeof sortBy) => {
    if (sortBy === newSortBy) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(newSortBy);
      setSortOrder('desc');
    }
  };

  const getSortIcon = (column: typeof sortBy) => {
    if (sortBy !== column) return '⇅';
    return sortOrder === 'asc' ? '↑' : '↓';
  };

  const containerStyle: React.CSSProperties = {
    backgroundColor: '#1a1a1a',
    border: '2px solid #333',
    borderRadius: '8px',
    padding: '20px',
    color: 'white',
    maxHeight: '400px',
    overflow: 'auto',
  };

  const headerStyle: React.CSSProperties = {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '15px',
    paddingBottom: '10px',
    borderBottom: '1px solid #333',
  };

  const tableStyle: React.CSSProperties = {
    width: '100%',
    borderCollapse: 'collapse',
    marginBottom: '15px',
  };

  const thStyle: React.CSSProperties = {
    padding: '8px 12px',
    backgroundColor: '#2a2a2a',
    border: '1px solid #333',
    cursor: 'pointer',
    userSelect: 'none',
    fontSize: '14px',
    fontWeight: 'bold',
  };

  const tdStyle: React.CSSProperties = {
    padding: '8px 12px',
    border: '1px solid #333',
    fontSize: '14px',
  };

  const buttonStyle: React.CSSProperties = {
    padding: '6px 12px',
    fontSize: '12px',
    backgroundColor: '#4CAF50',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    marginLeft: '8px',
  };

  const dangerButtonStyle: React.CSSProperties = {
    ...buttonStyle,
    backgroundColor: '#f44336',
  };

  const detailsStyle: React.CSSProperties = {
    backgroundColor: '#2a2a2a',
    padding: '10px',
    margin: '5px 0',
    borderRadius: '4px',
    fontSize: '12px',
    border: '1px solid #333',
  };

  const emptyStateStyle: React.CSSProperties = {
    textAlign: 'center',
    color: '#888',
    fontSize: '16px',
    padding: '40px 20px',
  };

  if (history.length === 0) {
    return (
      <div style={containerStyle}>
        <div style={headerStyle}>
          <h3 style={{ margin: 0, color: '#4CAF50' }}>Game History</h3>
          <button style={buttonStyle} onClick={onExportData}>
            Export Data
          </button>
        </div>
        <div style={emptyStateStyle}>
          <div>No games played yet</div>
          <div style={{ fontSize: '14px', marginTop: '10px', color: '#666' }}>
            Start playing to see your game history here!
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={containerStyle}>
      <div style={headerStyle}>
        <h3 style={{ margin: 0, color: '#4CAF50' }}>
          Game History ({history.length} games)
        </h3>
        <div>
          <button style={buttonStyle} onClick={onExportData}>
            Export Data
          </button>
          <button style={dangerButtonStyle} onClick={onClearHistory}>
            Clear History
          </button>
        </div>
      </div>

      <table style={tableStyle}>
        <thead>
          <tr>
            <th style={thStyle} onClick={() => toggleSort('timestamp')}>
              Date {getSortIcon('timestamp')}
            </th>
            <th style={thStyle} onClick={() => toggleSort('score')}>
              Score {getSortIcon('score')}
            </th>
            <th style={thStyle} onClick={() => toggleSort('duration')}>
              Duration {getSortIcon('duration')}
            </th>
            <th style={thStyle}>Snake Length</th>
            <th style={thStyle}>Traps Hit</th>
            <th style={thStyle}>End Reason</th>
            <th style={thStyle}>Details</th>
          </tr>
        </thead>
        <tbody>
          {sortedHistory.map((game) => (
            <React.Fragment key={game.id}>
              <tr style={{ backgroundColor: game.score > 20 ? '#1a3a1a' : 'transparent' }}>
                <td style={tdStyle}>{formatDate(game.timestamp)}</td>
                <td style={{ ...tdStyle, fontWeight: 'bold', color: '#4CAF50' }}>
                  {game.score}
                </td>
                <td style={tdStyle}>{formatDuration(game.duration)}</td>
                <td style={tdStyle}>{game.snakeLength}</td>
                <td style={tdStyle}>
                  {game.trapsEncountered > 0 && (
                    <span style={{ color: '#FF6B6B' }}>{game.trapsEncountered}</span>
                  )}
                  {game.trapsEncountered === 0 && <span style={{ color: '#666' }}>0</span>}
                </td>
                <td style={tdStyle}>
                  <span style={{ 
                    color: game.endReason === 'self-collision' ? '#FF6B6B' : '#FFA500',
                    fontSize: '12px'
                  }}>
                    {game.endReason === 'self-collision' ? 'Collision' : 'Quit'}
                  </span>
                </td>
                <td style={tdStyle}>
                  <button
                    style={{
                      ...buttonStyle,
                      fontSize: '10px',
                      padding: '4px 8px',
                      backgroundColor: showDetails === game.id ? '#FF6B6B' : '#666',
                    }}
                    onClick={() => setShowDetails(showDetails === game.id ? null : game.id)}
                  >
                    {showDetails === game.id ? 'Hide' : 'Show'}
                  </button>
                </td>
              </tr>
              {showDetails === game.id && (
                <tr>
                  <td colSpan={7} style={{ padding: 0, border: 'none' }}>
                    <div style={detailsStyle}>
                      <div style={{ marginBottom: '8px' }}>
                        <strong>Game Events ({game.gameEvents.length}):</strong>
                      </div>
                      {game.gameEvents.length === 0 ? (
                        <div style={{ color: '#666' }}>No events recorded</div>
                      ) : (
                        <div style={{ display: 'grid', gap: '4px' }}>
                          {game.gameEvents.slice(-10).map((event, index) => (
                            <div key={index} style={{ 
                              display: 'flex', 
                              justifyContent: 'space-between',
                              padding: '2px 0',
                              borderBottom: index < 9 ? '1px solid #333' : 'none'
                            }}>
                              <span>
                                {event.type === 'food-eaten' && '🍎 Food eaten'}
                                {event.type === 'trap-hit' && '🪤 Trap hit'}
                                {event.type === 'speed-increase' && '🚀 Speed increase'}
                                {event.type === 'wall-passthrough' && '🌊 Wall pass'}
                              </span>
                              <span style={{ color: '#666' }}>
                                ({event.position.x}, {event.position.y})
                              </span>
                            </div>
                          ))}
                          {game.gameEvents.length > 10 && (
                            <div style={{ color: '#666', fontStyle: 'italic' }}>
                              ... and {game.gameEvents.length - 10} more events
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </td>
                </tr>
              )}
            </React.Fragment>
          ))}
        </tbody>
      </table>
    </div>
  );
};