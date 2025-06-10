import { render, screen, fireEvent } from '@testing-library/react';
import { Statistics } from '../components/Statistics';
import type { GameStatistics, GameSession } from '../types';

describe('Statistics Component', () => {
  describe('Empty State', () => {
    test('should render empty state when no games played', () => {
      const emptyStats: GameStatistics = {
        totalGamesPlayed: 0,
        bestScore: 0,
        averageScore: 0,
        totalPlaytime: 0,
        totalFoodEaten: 0,
        totalTrapsHit: 0,
        totalWallPassthroughs: 0,
        gamesThisSession: 0,
        lastPlayed: 0,
      };

      render(<Statistics statistics={emptyStats} gameHistory={[]} />);

      expect(screen.getByText('Statistics')).toBeInTheDocument();
      expect(screen.getByText('No statistics available')).toBeInTheDocument();
      expect(screen.getByText('Play some games to see your statistics here!')).toBeInTheDocument();
    });
  });

  describe('With Statistics Data', () => {
    const mockStats: GameStatistics = {
      totalGamesPlayed: 15,
      bestScore: 42,
      averageScore: 18.5,
      totalPlaytime: 450000, // 7.5 minutes
      totalFoodEaten: 85,
      totalTrapsHit: 12,
      totalWallPassthroughs: 23,
      gamesThisSession: 3,
      lastPlayed: Date.now() - 3600000, // 1 hour ago
    };

    test('should render all statistic cards', () => {
      render(<Statistics statistics={mockStats} gameHistory={[]} />);

      expect(screen.getByText('Overall Performance')).toBeInTheDocument();
      expect(screen.getByText('Time Statistics')).toBeInTheDocument();
      expect(screen.getByText('Game Actions')).toBeInTheDocument();
      expect(screen.getByText('Performance Ratios')).toBeInTheDocument();
    });

    test('should display overall performance correctly', () => {
      render(<Statistics statistics={mockStats} gameHistory={[]} />);

      expect(screen.getByText('15')).toBeInTheDocument(); // Total games
      expect(screen.getByText('42')).toBeInTheDocument(); // Best score
      expect(screen.getByText('18.5')).toBeInTheDocument(); // Average score
    });

    test('should display time statistics correctly', () => {
      render(<Statistics statistics={mockStats} gameHistory={[]} />);

      expect(screen.getByText('7m 30s')).toBeInTheDocument(); // Total playtime
      expect(screen.getByText('30s')).toBeInTheDocument(); // Average game duration
      expect(screen.getByText('3')).toBeInTheDocument(); // Games this session
    });

    test('should display game actions correctly', () => {
      render(<Statistics statistics={mockStats} gameHistory={[]} />);

      expect(screen.getByText('85')).toBeInTheDocument(); // Food eaten
      expect(screen.getByText('12')).toBeInTheDocument(); // Traps hit
      expect(screen.getByText('23')).toBeInTheDocument(); // Wall passthroughs
      expect(screen.getByText('5.7')).toBeInTheDocument(); // Avg food per game
    });

    test('should calculate performance ratios correctly', () => {
      render(<Statistics statistics={mockStats} gameHistory={[]} />);

      // Food efficiency: 85/(85+12) = 87.6%
      expect(screen.getByText('87.6%')).toBeInTheDocument();

      // Trap avoidance: (1 - 12/15) = 20.0%
      expect(screen.getByText('20.0%')).toBeInTheDocument();

      // Wall usage: 23/15 = 1.5 per game
      expect(screen.getByText('1.5 per game')).toBeInTheDocument();
    });

    test('should display skill level based on performance', () => {
      render(<Statistics statistics={mockStats} gameHistory={[]} />);

      // With average score 18.5 and 12/15 = 0.8 trap hit rate, should be Beginner
      expect(screen.getByText('Beginner 🌱')).toBeInTheDocument();
    });
  });

  describe('Skill Level Calculation', () => {
    test('should show Expert level for high performance', () => {
      const expertStats: GameStatistics = {
        totalGamesPlayed: 10,
        bestScore: 50,
        averageScore: 35,
        totalPlaytime: 300000,
        totalFoodEaten: 350,
        totalTrapsHit: 2, // Low trap hit rate
        totalWallPassthroughs: 15,
        gamesThisSession: 1,
        lastPlayed: Date.now(),
      };

      // Create expert-level game history
      const expertGameHistory: GameSession[] = Array.from({ length: 10 }, (_, i) => ({
        id: `expert_game${i + 1}`,
        timestamp: Date.now() - (9 - i) * 3600000,
        score: 30 + Math.random() * 20, // High scores 30-50
        duration: 180000, // 3 minutes each - long survival
        snakeLength: 30 + Math.floor(Math.random() * 20),
        trapsEncountered: Math.random() < 0.1 ? 1 : 0, // Very low trap hit rate
        gameEvents: Array.from({ length: 35 }, (_, j) => ({
          type: 'food-eaten' as const,
          timestamp: Date.now() - (9 - i) * 3600000 + j * 1000,
          position: { x: Math.floor(Math.random() * 20), y: Math.floor(Math.random() * 20) },
        })),
        endReason: 'self-collision' as const,
      }));

      render(<Statistics statistics={expertStats} gameHistory={expertGameHistory} />);
      expect(screen.getByText('Expert 🏆')).toBeInTheDocument();
    });

    test('should show Advanced level for good performance', () => {
      const advancedStats: GameStatistics = {
        totalGamesPlayed: 10,
        bestScore: 35,
        averageScore: 25,
        totalPlaytime: 300000,
        totalFoodEaten: 250,
        totalTrapsHit: 5, // Moderate trap hit rate
        totalWallPassthroughs: 15,
        gamesThisSession: 1,
        lastPlayed: Date.now(),
      };

      // Create advanced-level game history
      const advancedGameHistory: GameSession[] = Array.from({ length: 10 }, (_, i) => ({
        id: `advanced_game${i + 1}`,
        timestamp: Date.now() - (9 - i) * 3600000,
        score: 20 + Math.random() * 15, // Good scores 20-35
        duration: 120000, // 2 minutes each - good survival
        snakeLength: 20 + Math.floor(Math.random() * 15),
        trapsEncountered: Math.random() < 0.3 ? 1 : 0, // Low trap hit rate
        gameEvents: Array.from({ length: 25 }, (_, j) => ({
          type: 'food-eaten' as const,
          timestamp: Date.now() - (9 - i) * 3600000 + j * 1000,
          position: { x: Math.floor(Math.random() * 20), y: Math.floor(Math.random() * 20) },
        })),
        endReason: 'self-collision' as const,
      }));

      render(<Statistics statistics={advancedStats} gameHistory={advancedGameHistory} />);
      expect(screen.getByText('Advanced 🎯')).toBeInTheDocument();
    });

    test('should show Intermediate level for moderate performance', () => {
      const intermediateStats: GameStatistics = {
        totalGamesPlayed: 10,
        bestScore: 20,
        averageScore: 15,
        totalPlaytime: 300000,
        totalFoodEaten: 150,
        totalTrapsHit: 15, // Higher trap hit rate
        totalWallPassthroughs: 15,
        gamesThisSession: 1,
        lastPlayed: Date.now(),
      };

      // Create intermediate-level game history
      const intermediateGameHistory: GameSession[] = Array.from({ length: 10 }, (_, i) => ({
        id: `intermediate_game${i + 1}`,
        timestamp: Date.now() - (9 - i) * 3600000,
        score: 10 + Math.random() * 10, // Moderate scores 10-20
        duration: 80000, // 1.3 minutes each - moderate survival
        snakeLength: 10 + Math.floor(Math.random() * 10),
        trapsEncountered: Math.random() < 0.6 ? 1 : (Math.random() < 0.8 ? 2 : 0), // Moderate trap hits
        gameEvents: Array.from({ length: 15 }, (_, j) => ({
          type: j % 4 === 0 ? 'trap-hit' as const : 'food-eaten' as const,
          timestamp: Date.now() - (9 - i) * 3600000 + j * 1000,
          position: { x: Math.floor(Math.random() * 20), y: Math.floor(Math.random() * 20) },
        })),
        endReason: 'self-collision' as const,
      }));

      render(<Statistics statistics={intermediateStats} gameHistory={intermediateGameHistory} />);
      expect(screen.getByText('Intermediate 📈')).toBeInTheDocument();
    });

    test('should show Beginner level for poor performance', () => {
      const learningStats: GameStatistics = {
        totalGamesPlayed: 10,
        bestScore: 8,
        averageScore: 3,
        totalPlaytime: 300000,
        totalFoodEaten: 30,
        totalTrapsHit: 25,
        totalWallPassthroughs: 5,
        gamesThisSession: 1,
        lastPlayed: Date.now(),
      };

      // Create beginner-level game history
      const beginnerGameHistory: GameSession[] = Array.from({ length: 10 }, (_, i) => ({
        id: `beginner_game${i + 1}`,
        timestamp: Date.now() - (9 - i) * 3600000,
        score: 1 + Math.random() * 5, // Low scores 1-6
        duration: 30000, // 30 seconds each - short survival
        snakeLength: 3 + Math.floor(Math.random() * 3),
        trapsEncountered: Math.random() < 0.8 ? (Math.random() < 0.5 ? 2 : 3) : 1, // High trap hits
        gameEvents: Array.from({ length: 5 }, (_, j) => ({
          type: j % 2 === 0 ? 'trap-hit' as const : 'food-eaten' as const,
          timestamp: Date.now() - (9 - i) * 3600000 + j * 1000,
          position: { x: Math.floor(Math.random() * 20), y: Math.floor(Math.random() * 20) },
        })),
        endReason: 'self-collision' as const,
      }));

      render(<Statistics statistics={learningStats} gameHistory={beginnerGameHistory} />);
      expect(screen.getByText('Beginner 🌱')).toBeInTheDocument();
    });
  });

  describe('Time Formatting', () => {
    test('should format hours and minutes correctly', () => {
      const longPlaytimeStats: GameStatistics = {
        totalGamesPlayed: 1,
        bestScore: 10,
        averageScore: 10,
        totalPlaytime: 3900000, // 1 hour 5 minutes
        totalFoodEaten: 10,
        totalTrapsHit: 1,
        totalWallPassthroughs: 2,
        gamesThisSession: 1,
        lastPlayed: Date.now(),
      };

      render(<Statistics statistics={longPlaytimeStats} gameHistory={[]} />);
      expect(screen.getAllByText('1h 5m')).toHaveLength(2); // Total playtime and average game duration
    });

    test('should format minutes and seconds correctly', () => {
      const shortPlaytimeStats: GameStatistics = {
        totalGamesPlayed: 1,
        bestScore: 5,
        averageScore: 5,
        totalPlaytime: 125000, // 2 minutes 5 seconds
        totalFoodEaten: 5,
        totalTrapsHit: 1,
        totalWallPassthroughs: 1,
        gamesThisSession: 1,
        lastPlayed: Date.now(),
      };

      render(<Statistics statistics={shortPlaytimeStats} gameHistory={[]} />);
      expect(screen.getAllByText('2m 5s')).toHaveLength(2); // Total playtime and average game duration
    });

    test('should format seconds only correctly', () => {
      const veryShortPlaytimeStats: GameStatistics = {
        totalGamesPlayed: 1,
        bestScore: 1,
        averageScore: 1,
        totalPlaytime: 45000, // 45 seconds
        totalFoodEaten: 1,
        totalTrapsHit: 0,
        totalWallPassthroughs: 0,
        gamesThisSession: 1,
        lastPlayed: Date.now(),
      };

      render(<Statistics statistics={veryShortPlaytimeStats} gameHistory={[]} />);
      expect(screen.getAllByText('45s')).toHaveLength(2); // Total playtime and average game duration
    });
  });

  describe('Date Formatting', () => {
    test('should format last played date correctly', () => {
      const recentStats: GameStatistics = {
        totalGamesPlayed: 1,
        bestScore: 10,
        averageScore: 10,
        totalPlaytime: 60000,
        totalFoodEaten: 10,
        totalTrapsHit: 1,
        totalWallPassthroughs: 2,
        gamesThisSession: 1,
        lastPlayed: new Date('2024-01-15T14:30:00').getTime(),
      };

      render(<Statistics statistics={recentStats} gameHistory={[]} />);
      // Should display formatted date
      expect(screen.getByText(/Jan 15, 2024/)).toBeInTheDocument();
    });

    test('should show empty state when never played', () => {
      const neverPlayedStats: GameStatistics = {
        totalGamesPlayed: 0,
        bestScore: 0,
        averageScore: 0,
        totalPlaytime: 0,
        totalFoodEaten: 0,
        totalTrapsHit: 0,
        totalWallPassthroughs: 0,
        gamesThisSession: 0,
        lastPlayed: 0,
      };

      render(<Statistics statistics={neverPlayedStats} gameHistory={[]} />);
      expect(screen.getByText('No statistics available')).toBeInTheDocument();
    });

    test('should show "Never" for last played when timestamp is 0', () => {
      const statsWithNoLastPlayed: GameStatistics = {
        totalGamesPlayed: 5,
        bestScore: 10,
        averageScore: 8,
        totalPlaytime: 300000,
        totalFoodEaten: 40,
        totalTrapsHit: 5,
        totalWallPassthroughs: 10,
        gamesThisSession: 2,
        lastPlayed: 0, // This should show "Never"
      };

      const gameHistory: GameSession[] = Array.from({ length: 5 }, (_, i) => ({
        id: `game${i + 1}`,
        timestamp: Date.now() - (4 - i) * 3600000,
        score: 8,
        duration: 60000,
        snakeLength: 8,
        trapsEncountered: 1,
        gameEvents: [],
        endReason: 'self-collision' as const,
      }));

      render(<Statistics statistics={statsWithNoLastPlayed} gameHistory={gameHistory} />);
      expect(screen.getByText('Never')).toBeInTheDocument();
    });
  });

  describe('Edge Cases', () => {
    test('should handle division by zero gracefully', () => {
      const zeroGamesStats: GameStatistics = {
        totalGamesPlayed: 0,
        bestScore: 0,
        averageScore: 0,
        totalPlaytime: 0,
        totalFoodEaten: 0,
        totalTrapsHit: 0,
        totalWallPassthroughs: 0,
        gamesThisSession: 0,
        lastPlayed: 0,
      };

      // Should not crash with empty state
      render(<Statistics statistics={zeroGamesStats} gameHistory={[]} />);
      expect(screen.getByText('No statistics available')).toBeInTheDocument();
    });

    test('should handle very large numbers correctly', () => {
      const largeStats: GameStatistics = {
        totalGamesPlayed: 9999,
        bestScore: 999,
        averageScore: 123.456789, // Should be rounded
        totalPlaytime: 86400000, // 24 hours
        totalFoodEaten: 99999,
        totalTrapsHit: 5000,
        totalWallPassthroughs: 15000,
        gamesThisSession: 100,
        lastPlayed: Date.now(),
      };

      render(<Statistics statistics={largeStats} gameHistory={[]} />);
      expect(screen.getByText('9999')).toBeInTheDocument();
      expect(screen.getByText('999')).toBeInTheDocument();
      expect(screen.getByText('123.5')).toBeInTheDocument(); // Rounded average
      expect(screen.getByText('24h 0m')).toBeInTheDocument();
    });
  });
});