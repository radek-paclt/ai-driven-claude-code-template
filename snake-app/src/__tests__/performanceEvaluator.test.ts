import { performanceEvaluator, PerformanceEvaluatorService } from '../services/performanceEvaluator';
import type { GameSession, GameStatistics } from '../types';

describe('PerformanceEvaluatorService', () => {
  let evaluator: PerformanceEvaluatorService;
  
  beforeEach(() => {
    evaluator = performanceEvaluator;
  });

  describe('Basic Analysis', () => {
    test('should provide basic insights for insufficient data', () => {
      const statistics: GameStatistics = {
        totalGamesPlayed: 2,
        bestScore: 5,
        averageScore: 3,
        totalPlaytime: 60000,
        totalFoodEaten: 6,
        totalTrapsHit: 2,
        totalWallPassthroughs: 1,
        gamesThisSession: 2,
        lastPlayed: Date.now(),
      };

      const gameHistory: GameSession[] = [
        {
          id: 'game1',
          timestamp: Date.now() - 3600000,
          score: 2,
          duration: 30000,
          snakeLength: 3,
          trapsEncountered: 1,
          gameEvents: [
            { type: 'food-eaten', timestamp: Date.now(), position: { x: 5, y: 5 } },
            { type: 'trap-hit', timestamp: Date.now(), position: { x: 8, y: 8 } },
          ],
          endReason: 'self-collision',
        },
        {
          id: 'game2',
          timestamp: Date.now(),
          score: 4,
          duration: 30000,
          snakeLength: 5,
          trapsEncountered: 1,
          gameEvents: [
            { type: 'food-eaten', timestamp: Date.now(), position: { x: 3, y: 3 } },
            { type: 'food-eaten', timestamp: Date.now(), position: { x: 7, y: 7 } },
          ],
          endReason: 'self-collision',
        },
      ];

      const insights = evaluator.analyzePerformance(gameHistory, statistics);

      expect(insights.skillLevel).toBe('Beginner');
      expect(insights.overallTrend).toBe('stable');
      expect(insights.recommendations).toHaveLength(4);
      expect(insights.strengths).toContain('Getting started');
      expect(insights.improvements).toContain('Play more games to unlock detailed analysis');
    });
  });

  describe('Skill Level Assessment', () => {
    test('should assess Expert skill level correctly', () => {
      const statistics: GameStatistics = {
        totalGamesPlayed: 20,
        bestScore: 60,
        averageScore: 45,
        totalPlaytime: 1200000, // 20 minutes
        totalFoodEaten: 900,
        totalTrapsHit: 5,
        totalWallPassthroughs: 40,
        gamesThisSession: 5,
        lastPlayed: Date.now(),
      };

      const gameHistory: GameSession[] = Array.from({ length: 20 }, (_, i) => ({
        id: `game${i + 1}`,
        timestamp: Date.now() - (19 - i) * 3600000,
        score: 40 + Math.random() * 20, // Scores between 40-60
        duration: 60000, // 1 minute each
        snakeLength: 40 + Math.floor(Math.random() * 20),
        trapsEncountered: Math.random() < 0.2 ? 1 : 0, // Low trap hit rate
        gameEvents: Array.from({ length: 40 + Math.floor(Math.random() * 20) }, (_, j) => ({
          type: 'food-eaten' as const,
          timestamp: Date.now() - (19 - i) * 3600000 + j * 1000,
          position: { x: Math.floor(Math.random() * 20), y: Math.floor(Math.random() * 20) },
        })),
        endReason: 'self-collision' as const,
      }));

      const insights = evaluator.analyzePerformance(gameHistory, statistics);

      expect(insights.skillLevel).toBe('Expert');
      expect(insights.skillProgress).toBe(100);
      expect(insights.achievements).toContain('🏆 Master Scorer (50+ points)');
    });

    test('should assess Beginner skill level correctly', () => {
      const statistics: GameStatistics = {
        totalGamesPlayed: 10,
        bestScore: 8,
        averageScore: 4,
        totalPlaytime: 300000, // 5 minutes
        totalFoodEaten: 40,
        totalTrapsHit: 15,
        totalWallPassthroughs: 5,
        gamesThisSession: 3,
        lastPlayed: Date.now(),
      };

      const gameHistory: GameSession[] = Array.from({ length: 10 }, (_, i) => ({
        id: `game${i + 1}`,
        timestamp: Date.now() - (9 - i) * 3600000,
        score: 2 + Math.random() * 6, // Scores between 2-8
        duration: 30000, // 30 seconds each
        snakeLength: 2 + Math.floor(Math.random() * 6),
        trapsEncountered: Math.random() < 0.7 ? 1 : (Math.random() < 0.9 ? 2 : 3), // High trap hit rate
        gameEvents: Array.from({ length: 2 + Math.floor(Math.random() * 6) }, (_, j) => ({
          type: j % 3 === 0 ? 'trap-hit' as const : 'food-eaten' as const,
          timestamp: Date.now() - (9 - i) * 3600000 + j * 1000,
          position: { x: Math.floor(Math.random() * 20), y: Math.floor(Math.random() * 20) },
        })),
        endReason: 'self-collision' as const,
      }));

      const insights = evaluator.analyzePerformance(gameHistory, statistics);

      expect(insights.skillLevel).toBe('Beginner');
      expect(insights.skillProgress).toBeLessThan(100);
      expect(insights.improvements).toContain('Work on trap detection and avoidance');
    });
  });

  describe('Trend Analysis', () => {
    test('should detect improving score trend', () => {
      const gameHistory: GameSession[] = Array.from({ length: 15 }, (_, i) => ({
        id: `game${i + 1}`,
        timestamp: Date.now() - (14 - i) * 3600000,
        score: i < 5 ? 8 : 25 + i * 3, // Strong improvement: early games 8, later games 40+
        duration: i < 5 ? 30000 : 60000 + i * 5000, // Improving survival time too
        snakeLength: i < 5 ? 8 : 25 + i * 3,
        trapsEncountered: i < 5 ? 2 : 0, // Also improving trap avoidance
        gameEvents: Array.from({ length: i < 5 ? 8 : 25 + i * 3 }, (_, j) => ({
          type: 'food-eaten' as const,
          timestamp: Date.now() - (14 - i) * 3600000 + j * 1000,
          position: { x: Math.floor(Math.random() * 20), y: Math.floor(Math.random() * 20) },
        })), // More food eaten in later games for efficiency improvement
        endReason: 'self-collision' as const,
      }));

      const statistics: GameStatistics = {
        totalGamesPlayed: 15,
        bestScore: 67, // Best score from the pattern (25 + 14 * 3)
        averageScore: 32, // Higher average due to improvement
        totalPlaytime: 675000,
        totalFoodEaten: 480,
        totalTrapsHit: 10, // Lower trap hits due to improvement
        totalWallPassthroughs: 15,
        gamesThisSession: 5,
        lastPlayed: Date.now(),
      };

      const insights = evaluator.analyzePerformance(gameHistory, statistics);

      expect(insights.scoreAnalysis.direction).toBe('improving');
      expect(insights.overallTrend).toBe('improving');
      expect(insights.strengths).toContain('Rapidly improving skills');
    });

    test('should detect declining performance trend', () => {
      const gameHistory: GameSession[] = Array.from({ length: 15 }, (_, i) => ({
        id: `game${i + 1}`,
        timestamp: Date.now() - (14 - i) * 3600000,
        score: 30 - i * 1.5, // Steadily decreasing scores
        duration: 60000 - i * 2000, // Also declining survival
        snakeLength: 30 - i,
        trapsEncountered: Math.floor(i / 3), // Increasing trap hits
        gameEvents: [],
        endReason: 'self-collision' as const,
      }));

      const statistics: GameStatistics = {
        totalGamesPlayed: 15,
        bestScore: 30,
        averageScore: 19.5,
        totalPlaytime: 675000,
        totalFoodEaten: 292,
        totalTrapsHit: 35,
        totalWallPassthroughs: 15,
        gamesThisSession: 5,
        lastPlayed: Date.now(),
      };

      const insights = evaluator.analyzePerformance(gameHistory, statistics);

      expect(insights.scoreAnalysis.direction).toBe('declining');
      expect(insights.overallTrend).toBe('declining');
      expect(insights.improvements).toContain('Reverse declining performance trend');
    });

    test('should detect stable performance', () => {
      const gameHistory: GameSession[] = Array.from({ length: 15 }, (_, i) => ({
        id: `game${i + 1}`,
        timestamp: Date.now() - (14 - i) * 3600000,
        score: 20 + (Math.random() - 0.5) * 4, // Scores around 20 with small variation
        duration: 60000 + (Math.random() - 0.5) * 10000,
        snakeLength: 20 + Math.floor((Math.random() - 0.5) * 6),
        trapsEncountered: Math.random() < 0.4 ? 1 : 0,
        gameEvents: [],
        endReason: 'self-collision' as const,
      }));

      const statistics: GameStatistics = {
        totalGamesPlayed: 15,
        bestScore: 24,
        averageScore: 20,
        totalPlaytime: 900000,
        totalFoodEaten: 300,
        totalTrapsHit: 6,
        totalWallPassthroughs: 15,
        gamesThisSession: 5,
        lastPlayed: Date.now(),
      };

      const insights = evaluator.analyzePerformance(gameHistory, statistics);

      expect(insights.scoreAnalysis.direction).toBe('stable');
      expect(insights.overallTrend).toBe('stable');
    });
  });

  describe('Performance Metrics', () => {
    test('should calculate consistency correctly', () => {
      // Create games with very consistent scores
      const consistentGameHistory: GameSession[] = Array.from({ length: 10 }, (_, i) => ({
        id: `game${i + 1}`,
        timestamp: Date.now() - (9 - i) * 3600000,
        score: 20, // All games have same score
        duration: 60000,
        snakeLength: 20,
        trapsEncountered: 1,
        gameEvents: [],
        endReason: 'self-collision' as const,
      }));

      const statistics: GameStatistics = {
        totalGamesPlayed: 10,
        bestScore: 20,
        averageScore: 20,
        totalPlaytime: 600000,
        totalFoodEaten: 200,
        totalTrapsHit: 10,
        totalWallPassthroughs: 10,
        gamesThisSession: 3,
        lastPlayed: Date.now(),
      };

      const insights = evaluator.analyzePerformance(consistentGameHistory, statistics);

      expect(insights.metrics.scoreConsistency).toBeGreaterThan(90);
      expect(insights.strengths).toContain('Highly consistent performance');
    });

    test('should identify learning rate correctly', () => {
      // Create games with clear improvement from first quarter to last quarter
      const gameHistory: GameSession[] = [
        // First quarter: low scores
        ...Array.from({ length: 5 }, (_, i) => ({
          id: `early_game${i + 1}`,
          timestamp: Date.now() - (19 - i) * 3600000,
          score: 5,
          duration: 30000,
          snakeLength: 5,
          trapsEncountered: 2,
          gameEvents: [],
          endReason: 'self-collision' as const,
        })),
        // Middle games
        ...Array.from({ length: 10 }, (_, i) => ({
          id: `mid_game${i + 1}`,
          timestamp: Date.now() - (14 - i) * 3600000,
          score: 10 + i,
          duration: 45000,
          snakeLength: 10 + i,
          trapsEncountered: 1,
          gameEvents: [],
          endReason: 'self-collision' as const,
        })),
        // Last quarter: high scores
        ...Array.from({ length: 5 }, (_, i) => ({
          id: `late_game${i + 1}`,
          timestamp: Date.now() - (4 - i) * 3600000,
          score: 25,
          duration: 60000,
          snakeLength: 25,
          trapsEncountered: 0,
          gameEvents: [],
          endReason: 'self-collision' as const,
        })),
      ];

      const statistics: GameStatistics = {
        totalGamesPlayed: 20,
        bestScore: 25,
        averageScore: 15,
        totalPlaytime: 950000,
        totalFoodEaten: 300,
        totalTrapsHit: 20,
        totalWallPassthroughs: 20,
        gamesThisSession: 5,
        lastPlayed: Date.now(),
      };

      const insights = evaluator.analyzePerformance(gameHistory, statistics);

      expect(insights.metrics.learningRate).toBeGreaterThan(200); // 400% improvement
      expect(insights.achievements).toContain('📈 Fast Learner');
    });
  });

  describe('Recommendations and Feedback', () => {
    test('should provide appropriate beginner recommendations', () => {
      const statistics: GameStatistics = {
        totalGamesPlayed: 10,
        bestScore: 8,
        averageScore: 4,
        totalPlaytime: 200000,
        totalFoodEaten: 40,
        totalTrapsHit: 20,
        totalWallPassthroughs: 5,
        gamesThisSession: 3,
        lastPlayed: Date.now(),
      };

      const gameHistory: GameSession[] = Array.from({ length: 10 }, (_, i) => ({
        id: `game${i + 1}`,
        timestamp: Date.now() - (9 - i) * 3600000,
        score: 2 + Math.random() * 6,
        duration: 20000, // Short games
        snakeLength: 4,
        trapsEncountered: 2,
        gameEvents: [],
        endReason: 'self-collision' as const,
      }));

      const insights = evaluator.analyzePerformance(gameHistory, statistics);

      expect(insights.recommendations).toContain('Focus on basic movement and avoiding walls');
      expect(insights.recommendations).toContain('Take your time - speed comes with practice');
      expect(insights.improvements).toContain('Improve survival time and patience');
    });

    test('should provide expert-level recommendations', () => {
      const statistics: GameStatistics = {
        totalGamesPlayed: 50,
        bestScore: 70,
        averageScore: 55,
        totalPlaytime: 3000000,
        totalFoodEaten: 2750,
        totalTrapsHit: 15,
        totalWallPassthroughs: 150,
        gamesThisSession: 5,
        lastPlayed: Date.now(),
      };

      const gameHistory: GameSession[] = Array.from({ length: 50 }, (_, i) => ({
        id: `game${i + 1}`,
        timestamp: Date.now() - (49 - i) * 3600000,
        score: 50 + Math.random() * 20,
        duration: 60000,
        snakeLength: 50 + Math.floor(Math.random() * 20),
        trapsEncountered: Math.random() < 0.1 ? 1 : 0,
        gameEvents: [],
        endReason: 'self-collision' as const,
      }));

      const insights = evaluator.analyzePerformance(gameHistory, statistics);

      expect(insights.skillLevel).toBe('Expert');
      expect(insights.recommendations).toContain('Perfect your risk-reward decision making');
      expect(insights.recommendations).toContain('Challenge yourself with complex maneuvers');
    });
  });

  describe('Achievement Detection', () => {
    test('should detect score-based achievements', () => {
      const statistics: GameStatistics = {
        totalGamesPlayed: 10,
        bestScore: 55,
        averageScore: 25,
        totalPlaytime: 600000,
        totalFoodEaten: 250,
        totalTrapsHit: 5,
        totalWallPassthroughs: 20,
        gamesThisSession: 3,
        lastPlayed: Date.now(),
      };

      // Create game history to avoid basic insights
      const gameHistory: GameSession[] = Array.from({ length: 10 }, (_, i) => ({
        id: `achievement_game${i + 1}`,
        timestamp: Date.now() - (9 - i) * 3600000,
        score: 20 + Math.random() * 35, // Scores 20-55
        duration: 120000,
        snakeLength: 25,
        trapsEncountered: 0,
        gameEvents: [],
        endReason: 'self-collision' as const,
      }));

      const insights = evaluator.analyzePerformance(gameHistory, statistics);

      expect(insights.achievements).toContain('🏆 Master Scorer (50+ points)');
    });

    test('should detect volume-based achievements', () => {
      const statistics: GameStatistics = {
        totalGamesPlayed: 100,
        bestScore: 25,
        averageScore: 15,
        totalPlaytime: 6000000,
        totalFoodEaten: 1500,
        totalTrapsHit: 50,
        totalWallPassthroughs: 200,
        gamesThisSession: 5,
        lastPlayed: Date.now(),
      };

      // Create sufficient game history to avoid basic insights
      const gameHistory: GameSession[] = Array.from({ length: 20 }, (_, i) => ({
        id: `volume_game${i + 1}`,
        timestamp: Date.now() - (19 - i) * 3600000,
        score: 10 + Math.random() * 15, // Scores 10-25
        duration: 60000,
        snakeLength: 15,
        trapsEncountered: 1,
        gameEvents: [],
        endReason: 'self-collision' as const,
      }));

      const insights = evaluator.analyzePerformance(gameHistory, statistics);

      expect(insights.achievements).toContain('💯 Century Club');
    });

    test('should detect consistency achievements', () => {
      const consistentGameHistory: GameSession[] = Array.from({ length: 20 }, (_, i) => ({
        id: `game${i + 1}`,
        timestamp: Date.now() - (19 - i) * 3600000,
        score: 20 + (Math.random() - 0.5) * 2, // Very consistent scores
        duration: 60000,
        snakeLength: 20,
        trapsEncountered: 0,
        gameEvents: [],
        endReason: 'self-collision' as const,
      }));

      const statistics: GameStatistics = {
        totalGamesPlayed: 20,
        bestScore: 21,
        averageScore: 20,
        totalPlaytime: 1200000,
        totalFoodEaten: 400,
        totalTrapsHit: 2,
        totalWallPassthroughs: 40,
        gamesThisSession: 5,
        lastPlayed: Date.now(),
      };

      const insights = evaluator.analyzePerformance(consistentGameHistory, statistics);

      expect(insights.achievements).toContain('🎯 Consistency Champion');
    });
  });

  describe('Edge Cases', () => {
    test('should handle empty game history', () => {
      const statistics: GameStatistics = {
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

      const insights = evaluator.analyzePerformance([], statistics);

      expect(insights.skillLevel).toBe('Beginner');
      expect(insights.overallTrend).toBe('stable');
      expect(insights.scoreAnalysis.period).toBe('Insufficient data');
      expect(insights.achievements).toHaveLength(0);
    });

    test('should handle single game history', () => {
      const gameHistory: GameSession[] = [{
        id: 'only_game',
        timestamp: Date.now(),
        score: 10,
        duration: 60000,
        snakeLength: 10,
        trapsEncountered: 1,
        gameEvents: [],
        endReason: 'self-collision',
      }];

      const statistics: GameStatistics = {
        totalGamesPlayed: 1,
        bestScore: 10,
        averageScore: 10,
        totalPlaytime: 60000,
        totalFoodEaten: 10,
        totalTrapsHit: 1,
        totalWallPassthroughs: 2,
        gamesThisSession: 1,
        lastPlayed: Date.now(),
      };

      const insights = evaluator.analyzePerformance(gameHistory, statistics);

      expect(insights.skillLevel).toBe('Beginner');
      expect(insights.scoreAnalysis.direction).toBe('stable');
      expect(insights.recommendations).toHaveLength(4);
    });
  });
});