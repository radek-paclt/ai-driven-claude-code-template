import React, { useState } from 'react';
import type { GameStatistics, GameSession, PerformanceInsights } from '../types';
import { performanceEvaluator } from '../services/performanceEvaluator';
import { PerformanceReport } from './PerformanceReport';

interface StatisticsProps {
  statistics: GameStatistics;
  gameHistory?: GameSession[];
}

/**
 * Component for displaying aggregated game statistics
 */
export const Statistics: React.FC<StatisticsProps> = ({ statistics, gameHistory = [] }) => {
  const [showPerformanceReport, setShowPerformanceReport] = useState(false);
  const [performanceInsights, setPerformanceInsights] = useState<PerformanceInsights | null>(null);
  const formatDuration = (ms: number): string => {
    const totalSeconds = Math.floor(ms / 1000);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    } else if (minutes > 0) {
      return `${minutes}m ${seconds}s`;
    }
    return `${seconds}s`;
  };

  const formatDate = (timestamp: number): string => {
    if (timestamp === 0) return 'Never';
    return new Date(timestamp).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const handleShowPerformanceReport = () => {
    const insights = performanceEvaluator.analyzePerformance(gameHistory, statistics);
    setPerformanceInsights(insights);
    setShowPerformanceReport(true);
  };

  const getPerformanceInsights = () => {
    return performanceEvaluator.analyzePerformance(gameHistory, statistics);
  };

  const insights = getPerformanceInsights();

  const getTrendIcon = (trend: string): string => {
    switch (trend) {
      case 'improving': return '📈';
      case 'declining': return '📉';
      case 'stable': return '➡️';
      default: return '➡️';
    }
  };

  const getTrendColor = (trend: string): string => {
    switch (trend) {
      case 'improving': return '#4CAF50';
      case 'declining': return '#FF6B6B';
      case 'stable': return '#FFA726';
      default: return '#888';
    }
  };

  const getSkillLevelIcon = (level: string): string => {
    switch (level) {
      case 'Expert': return '🏆';
      case 'Advanced': return '🎯';
      case 'Intermediate': return '📈';
      case 'Beginner': return '🌱';
      default: return '🎮';
    }
  };

  const getEfficiencyRating = (): string => {
    return `${insights.skillLevel} ${getSkillLevelIcon(insights.skillLevel)}`;
  };

  const containerStyle: React.CSSProperties = {
    backgroundColor: '#1a1a1a',
    border: '2px solid #333',
    borderRadius: '8px',
    padding: '20px',
    color: 'white',
  };

  const headerStyle: React.CSSProperties = {
    marginBottom: '20px',
    paddingBottom: '10px',
    borderBottom: '1px solid #333',
  };

  const gridStyle: React.CSSProperties = {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
    gap: '20px',
  };

  const cardStyle: React.CSSProperties = {
    backgroundColor: '#2a2a2a',
    padding: '15px',
    borderRadius: '6px',
    border: '1px solid #333',
  };

  const cardTitleStyle: React.CSSProperties = {
    fontSize: '16px',
    fontWeight: 'bold',
    marginBottom: '12px',
    color: '#4CAF50',
    borderBottom: '1px solid #333',
    paddingBottom: '6px',
  };

  const statRowStyle: React.CSSProperties = {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '6px 0',
    borderBottom: '1px solid #444',
  };

  const statLabelStyle: React.CSSProperties = {
    fontSize: '14px',
    color: '#ccc',
  };

  const statValueStyle: React.CSSProperties = {
    fontSize: '14px',
    fontWeight: 'bold',
    color: 'white',
  };

  const highlightValueStyle: React.CSSProperties = {
    ...statValueStyle,
    color: '#4CAF50',
    fontSize: '16px',
  };

  const emptyStateStyle: React.CSSProperties = {
    textAlign: 'center',
    color: '#888',
    fontSize: '16px',
    padding: '40px 20px',
  };

  const performanceButtonStyle: React.CSSProperties = {
    backgroundColor: '#4CAF50',
    color: 'white',
    border: 'none',
    padding: '12px 20px',
    borderRadius: '6px',
    fontSize: '14px',
    fontWeight: 'bold',
    cursor: 'pointer',
    marginTop: '15px',
    width: '100%',
    transition: 'background-color 0.3s ease',
  };

  const trendIndicatorStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    fontSize: '12px',
    marginTop: '4px',
  };

  const achievementTagStyle: React.CSSProperties = {
    display: 'inline-block',
    backgroundColor: '#9C27B0',
    color: 'white',
    padding: '2px 8px',
    borderRadius: '12px',
    fontSize: '11px',
    marginRight: '5px',
    marginBottom: '5px',
  };

  if (statistics.totalGamesPlayed === 0) {
    return (
      <div style={containerStyle}>
        <div style={headerStyle}>
          <h3 style={{ margin: 0, color: '#4CAF50' }}>Statistics</h3>
        </div>
        <div style={emptyStateStyle}>
          <div>No statistics available</div>
          <div style={{ fontSize: '14px', marginTop: '10px', color: '#666' }}>
            Play some games to see your statistics here!
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={containerStyle}>
      <div style={headerStyle}>
        <h3 style={{ margin: 0, color: '#4CAF50' }}>Statistics</h3>
        <div style={{ fontSize: '14px', color: '#888', marginTop: '5px' }}>
          Your snake game performance overview
        </div>
      </div>

      <div style={gridStyle}>
        {/* Overall Performance */}
        <div style={cardStyle}>
          <div style={cardTitleStyle}>Overall Performance</div>
          
          <div style={statRowStyle}>
            <span style={statLabelStyle}>Total Games Played</span>
            <span style={highlightValueStyle}>{statistics.totalGamesPlayed}</span>
          </div>
          
          <div style={statRowStyle}>
            <span style={statLabelStyle}>Best Score</span>
            <span style={highlightValueStyle}>{statistics.bestScore}</span>
          </div>
          
          <div style={statRowStyle}>
            <span style={statLabelStyle}>Average Score</span>
            <div>
              <span style={statValueStyle}>{statistics.averageScore.toFixed(1)}</span>
              <div style={trendIndicatorStyle}>
                <span style={{ color: getTrendColor(insights.scoreAnalysis.direction) }}>
                  {getTrendIcon(insights.scoreAnalysis.direction)}
                </span>
                <span style={{ color: getTrendColor(insights.scoreAnalysis.direction) }}>
                  {insights.scoreAnalysis.direction}
                </span>
              </div>
            </div>
          </div>
          
          <div style={statRowStyle}>
            <span style={statLabelStyle}>Skill Level</span>
            <div>
              <span style={statValueStyle}>{getEfficiencyRating()}</span>
              <div style={{ fontSize: '11px', color: '#888', marginTop: '2px' }}>
                {insights.skillProgress.toFixed(0)}% to next level
              </div>
            </div>
          </div>

          {/* Quick achievements display */}
          {insights.achievements.length > 0 && (
            <div style={{ marginTop: '15px' }}>
              <div style={{ fontSize: '12px', color: '#888', marginBottom: '8px' }}>Recent Achievements:</div>
              <div>
                {insights.achievements.slice(0, 2).map((achievement, index) => (
                  <span key={index} style={achievementTagStyle}>
                    {achievement}
                  </span>
                ))}
              </div>
            </div>
          )}

          <button
            style={performanceButtonStyle}
            onClick={handleShowPerformanceReport}
            onMouseEnter={(e) => (e.target as HTMLElement).style.backgroundColor = '#45a049'}
            onMouseLeave={(e) => (e.target as HTMLElement).style.backgroundColor = '#4CAF50'}
          >
            View Detailed Performance Report
          </button>
        </div>

        {/* Time Statistics */}
        <div style={cardStyle}>
          <div style={cardTitleStyle}>Time Statistics</div>
          
          <div style={statRowStyle}>
            <span style={statLabelStyle}>Total Playtime</span>
            <span style={statValueStyle}>{formatDuration(statistics.totalPlaytime)}</span>
          </div>
          
          <div style={statRowStyle}>
            <span style={statLabelStyle}>Average Game Duration</span>
            <div>
              <span style={statValueStyle}>
                {statistics.totalGamesPlayed > 0 
                  ? formatDuration(statistics.totalPlaytime / statistics.totalGamesPlayed)
                  : '0s'
                }
              </span>
              <div style={trendIndicatorStyle}>
                <span style={{ color: getTrendColor(insights.survivalAnalysis.direction) }}>
                  {getTrendIcon(insights.survivalAnalysis.direction)}
                </span>
                <span style={{ color: getTrendColor(insights.survivalAnalysis.direction) }}>
                  survival {insights.survivalAnalysis.direction}
                </span>
              </div>
            </div>
          </div>
          
          <div style={statRowStyle}>
            <span style={statLabelStyle}>Last Played</span>
            <span style={statValueStyle}>{formatDate(statistics.lastPlayed)}</span>
          </div>
          
          <div style={statRowStyle}>
            <span style={statLabelStyle}>Games This Session</span>
            <span style={statValueStyle}>{statistics.gamesThisSession}</span>
          </div>
        </div>

        {/* Game Actions */}
        <div style={cardStyle}>
          <div style={cardTitleStyle}>Game Actions</div>
          
          <div style={statRowStyle}>
            <span style={statLabelStyle}>Food Eaten</span>
            <span style={statValueStyle}>{statistics.totalFoodEaten}</span>
          </div>
          
          <div style={statRowStyle}>
            <span style={statLabelStyle}>Traps Hit</span>
            <span style={{ ...statValueStyle, color: '#FF6B6B' }}>{statistics.totalTrapsHit}</span>
          </div>
          
          <div style={statRowStyle}>
            <span style={statLabelStyle}>Wall Passthroughs</span>
            <span style={{ ...statValueStyle, color: '#87CEEB' }}>{statistics.totalWallPassthroughs}</span>
          </div>
          
          <div style={statRowStyle}>
            <span style={statLabelStyle}>Avg Food per Game</span>
            <span style={statValueStyle}>
              {statistics.totalGamesPlayed > 0 
                ? (statistics.totalFoodEaten / statistics.totalGamesPlayed).toFixed(1)
                : '0'
              }
            </span>
          </div>
        </div>

        {/* Performance Ratios */}
        <div style={cardStyle}>
          <div style={cardTitleStyle}>Performance Ratios</div>
          
          <div style={statRowStyle}>
            <span style={statLabelStyle}>Food Efficiency</span>
            <div>
              <span style={statValueStyle}>
                {statistics.totalFoodEaten > 0 
                  ? `${((statistics.totalFoodEaten / (statistics.totalFoodEaten + statistics.totalTrapsHit)) * 100).toFixed(1)}%`
                  : '100%'
                }
              </span>
              <div style={trendIndicatorStyle}>
                <span style={{ color: getTrendColor(insights.efficiencyAnalysis.direction) }}>
                  {getTrendIcon(insights.efficiencyAnalysis.direction)}
                </span>
                <span style={{ color: getTrendColor(insights.efficiencyAnalysis.direction) }}>
                  efficiency {insights.efficiencyAnalysis.direction}
                </span>
              </div>
            </div>
          </div>
          
          <div style={statRowStyle}>
            <span style={statLabelStyle}>Trap Avoidance</span>
            <span style={statValueStyle}>
              {statistics.totalGamesPlayed > 0 
                ? `${((1 - (statistics.totalTrapsHit / statistics.totalGamesPlayed)) * 100).toFixed(1)}%`
                : '100%'
              }
            </span>
          </div>
          
          <div style={statRowStyle}>
            <span style={statLabelStyle}>Wall Usage</span>
            <span style={statValueStyle}>
              {statistics.totalGamesPlayed > 0 
                ? `${(statistics.totalWallPassthroughs / statistics.totalGamesPlayed).toFixed(1)} per game`
                : '0 per game'
              }
            </span>
          </div>
          
          <div style={statRowStyle}>
            <span style={statLabelStyle}>Score per Hour</span>
            <span style={statValueStyle}>
              {statistics.totalPlaytime > 0 
                ? `${((statistics.totalFoodEaten * 3600000) / statistics.totalPlaytime).toFixed(1)}`
                : '0'
              }
            </span>
          </div>
        </div>
      </div>

      {/* Performance Report Modal */}
      {performanceInsights && (
        <PerformanceReport
          insights={performanceInsights}
          isVisible={showPerformanceReport}
          onClose={() => setShowPerformanceReport(false)}
        />
      )}
    </div>
  );
};