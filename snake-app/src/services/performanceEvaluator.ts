/**
 * Performance Evaluator Service
 * Analyzes player performance trends and provides skill assessment and feedback
 */

import type { GameSession, GameStatistics } from './gameStorage';

export type SkillLevel = 'Beginner' | 'Intermediate' | 'Advanced' | 'Expert';
export type TrendDirection = 'improving' | 'declining' | 'stable';

export interface PerformanceMetrics {
  scoreConsistency: number; // 0-100 (higher is more consistent)
  survivalTrend: TrendDirection;
  efficiencyTrend: TrendDirection;
  learningRate: number; // Rate of improvement over recent games
  peakPerformance: number; // Best performance period
  currentForm: number; // Recent performance relative to overall average
}

export interface TrendAnalysis {
  direction: TrendDirection;
  strength: number; // 0-100 (how strong the trend is)
  recentChange: number; // Recent change percentage
  period: string; // Time period analyzed
}

export interface PerformanceInsights {
  skillLevel: SkillLevel;
  skillProgress: number; // Progress towards next skill level (0-100)
  overallTrend: TrendDirection;
  metrics: PerformanceMetrics;
  scoreAnalysis: TrendAnalysis;
  survivalAnalysis: TrendAnalysis;
  efficiencyAnalysis: TrendAnalysis;
  strengths: string[];
  improvements: string[];
  recommendations: string[];
  achievements: string[];
}

export class PerformanceEvaluatorService {
  private readonly MIN_GAMES_FOR_ANALYSIS = 3;
  private readonly RECENT_GAMES_COUNT = 10;
  private readonly TREND_THRESHOLD = 5; // Minimum % change to consider a trend

  /**
   * Analyze player performance and generate insights
   */
  public analyzePerformance(
    gameHistory: GameSession[],
    statistics: GameStatistics
  ): PerformanceInsights {
    if (gameHistory.length < this.MIN_GAMES_FOR_ANALYSIS) {
      return this.generateBasicInsights(statistics);
    }

    const recentGames = this.getRecentGames(gameHistory);
    const skillLevel = this.calculateSkillLevel(statistics, recentGames);
    
    return {
      skillLevel,
      skillProgress: this.calculateSkillProgress(statistics, skillLevel),
      overallTrend: this.calculateOverallTrend(gameHistory),
      metrics: this.calculatePerformanceMetrics(gameHistory),
      scoreAnalysis: this.analyzeScoreTrend(gameHistory),
      survivalAnalysis: this.analyzeSurvivalTrend(gameHistory),
      efficiencyAnalysis: this.analyzeEfficiencyTrend(gameHistory),
      strengths: this.identifyStrengths(gameHistory, statistics),
      improvements: this.identifyImprovements(gameHistory, statistics),
      recommendations: this.generateRecommendations(gameHistory, statistics),
      achievements: this.identifyAchievements(gameHistory, statistics),
    };
  }

  /**
   * Calculate skill level based on recent performance
   */
  private calculateSkillLevel(
    _statistics: GameStatistics,
    recentGames: GameSession[]
  ): SkillLevel {
    const recentAvgScore = this.calculateAverage(recentGames.map(g => g.score));
    const recentAvgSurvival = this.calculateAverage(recentGames.map(g => g.duration));
    const trapAvoidanceRate = this.calculateTrapAvoidanceRate(recentGames);

    // Advanced scoring system considering multiple factors
    let skillScore = 0;
    
    // Score component (40% weight)
    if (recentAvgScore >= 40) skillScore += 40;
    else if (recentAvgScore >= 25) skillScore += 30;
    else if (recentAvgScore >= 15) skillScore += 20;
    else if (recentAvgScore >= 8) skillScore += 10;
    
    // Survival time component (30% weight)
    const avgSurvivalMinutes = recentAvgSurvival / (1000 * 60);
    if (avgSurvivalMinutes >= 5) skillScore += 30;
    else if (avgSurvivalMinutes >= 3) skillScore += 24;
    else if (avgSurvivalMinutes >= 2) skillScore += 18;
    else if (avgSurvivalMinutes >= 1) skillScore += 12;
    else if (avgSurvivalMinutes >= 0.5) skillScore += 6;

    // Trap avoidance component (20% weight)
    if (trapAvoidanceRate >= 0.8) skillScore += 20;
    else if (trapAvoidanceRate >= 0.6) skillScore += 15;
    else if (trapAvoidanceRate >= 0.4) skillScore += 10;
    else if (trapAvoidanceRate >= 0.2) skillScore += 5;

    // Consistency component (10% weight)
    const consistency = this.calculateScoreConsistency(recentGames);
    skillScore += Math.floor(consistency / 10);

    if (skillScore >= 80) return 'Expert';
    if (skillScore >= 60) return 'Advanced';
    if (skillScore >= 35) return 'Intermediate';
    return 'Beginner';
  }

  /**
   * Calculate progress towards next skill level
   */
  private calculateSkillProgress(
    statistics: GameStatistics,
    currentLevel: SkillLevel
  ): number {
    const avgScore = statistics.averageScore;
    
    switch (currentLevel) {
      case 'Beginner':
        return Math.min(100, (avgScore / 15) * 100);
      case 'Intermediate':
        return Math.min(100, ((avgScore - 15) / 10) * 100);
      case 'Advanced':
        return Math.min(100, ((avgScore - 25) / 15) * 100);
      case 'Expert':
        return 100;
      default:
        return 0;
    }
  }

  /**
   * Calculate overall performance trend
   */
  private calculateOverallTrend(gameHistory: GameSession[]): TrendDirection {
    const scoreAnalysis = this.analyzeScoreTrend(gameHistory);
    const survivalAnalysis = this.analyzeSurvivalTrend(gameHistory);
    const efficiencyAnalysis = this.analyzeEfficiencyTrend(gameHistory);

    const trends = [scoreAnalysis, survivalAnalysis, efficiencyAnalysis];
    const improvingCount = trends.filter(t => t.direction === 'improving').length;
    const decliningCount = trends.filter(t => t.direction === 'declining').length;

    if (improvingCount >= 2) return 'improving';
    if (decliningCount >= 2) return 'declining';
    return 'stable';
  }

  /**
   * Calculate performance metrics
   */
  private calculatePerformanceMetrics(gameHistory: GameSession[]): PerformanceMetrics {
    const recentGames = this.getRecentGames(gameHistory);
    
    return {
      scoreConsistency: this.calculateScoreConsistency(recentGames),
      survivalTrend: this.analyzeSurvivalTrend(gameHistory).direction,
      efficiencyTrend: this.analyzeEfficiencyTrend(gameHistory).direction,
      learningRate: this.calculateLearningRate(gameHistory),
      peakPerformance: this.calculatePeakPerformance(gameHistory),
      currentForm: this.calculateCurrentForm(gameHistory),
    };
  }

  /**
   * Analyze score trend over time
   */
  private analyzeScoreTrend(gameHistory: GameSession[]): TrendAnalysis {
    return this.analyzeTrend(
      gameHistory.map(g => g.score),
      'score',
      gameHistory
    );
  }

  /**
   * Analyze survival time trend
   */
  private analyzeSurvivalTrend(gameHistory: GameSession[]): TrendAnalysis {
    return this.analyzeTrend(
      gameHistory.map(g => g.duration / 1000), // Convert to seconds
      'survival time',
      gameHistory
    );
  }

  /**
   * Analyze efficiency trend (food eaten per minute)
   */
  private analyzeEfficiencyTrend(gameHistory: GameSession[]): TrendAnalysis {
    const efficiencyScores = gameHistory.map(game => {
      const foodEaten = game.gameEvents.filter(e => e.type === 'food-eaten').length;
      const minutes = game.duration / (1000 * 60);
      return minutes > 0 ? foodEaten / minutes : 0;
    });

    return this.analyzeTrend(efficiencyScores, 'efficiency', gameHistory);
  }

  /**
   * Generic trend analysis function
   */
  private analyzeTrend(
    values: number[],
    _metricName: string,
    gameHistory: GameSession[]
  ): TrendAnalysis {
    if (values.length < 3) {
      return {
        direction: 'stable',
        strength: 0,
        recentChange: 0,
        period: `${values.length} games`,
      };
    }

    const recentValues = values.slice(-this.RECENT_GAMES_COUNT);
    const olderValues = values.slice(0, -this.RECENT_GAMES_COUNT);
    
    const recentAvg = this.calculateAverage(recentValues);
    const olderAvg = olderValues.length > 0 ? this.calculateAverage(olderValues) : recentAvg;
    
    const changePercent = olderAvg > 0 ? ((recentAvg - olderAvg) / olderAvg) * 100 : 0;
    
    let direction: TrendDirection = 'stable';
    if (Math.abs(changePercent) >= this.TREND_THRESHOLD) {
      direction = changePercent > 0 ? 'improving' : 'declining';
    }

    const strength = Math.min(100, Math.abs(changePercent) * 2);
    const period = this.formatAnalysisPeriod(gameHistory);

    return {
      direction,
      strength,
      recentChange: changePercent,
      period,
    };
  }

  /**
   * Calculate score consistency (inverse of coefficient of variation)
   */
  private calculateScoreConsistency(games: GameSession[]): number {
    if (games.length < 2) return 100;

    const scores = games.map(g => g.score);
    const mean = this.calculateAverage(scores);
    const variance = this.calculateVariance(scores, mean);
    const stdDev = Math.sqrt(variance);
    
    if (mean === 0) return 100;
    
    const coefficientOfVariation = stdDev / mean;
    // Convert to consistency score (0-100, higher is more consistent)
    return Math.max(0, Math.min(100, (1 - coefficientOfVariation) * 100));
  }

  /**
   * Calculate learning rate (improvement over time)
   */
  private calculateLearningRate(gameHistory: GameSession[]): number {
    if (gameHistory.length < 5) return 0;

    const scores = gameHistory.map(g => g.score);
    const firstQuarter = scores.slice(0, Math.floor(scores.length / 4));
    const lastQuarter = scores.slice(-Math.floor(scores.length / 4));
    
    const firstAvg = this.calculateAverage(firstQuarter);
    const lastAvg = this.calculateAverage(lastQuarter);
    
    return firstAvg > 0 ? ((lastAvg - firstAvg) / firstAvg) * 100 : 0;
  }

  /**
   * Calculate peak performance period
   */
  private calculatePeakPerformance(gameHistory: GameSession[]): number {
    if (gameHistory.length < 5) return 0;

    const windowSize = Math.min(5, Math.floor(gameHistory.length / 3));
    let bestAverage = 0;

    for (let i = 0; i <= gameHistory.length - windowSize; i++) {
      const window = gameHistory.slice(i, i + windowSize);
      const avg = this.calculateAverage(window.map(g => g.score));
      bestAverage = Math.max(bestAverage, avg);
    }

    return bestAverage;
  }

  /**
   * Calculate current form (recent performance vs overall average)
   */
  private calculateCurrentForm(gameHistory: GameSession[]): number {
    const recentGames = this.getRecentGames(gameHistory);
    const recentAvg = this.calculateAverage(recentGames.map(g => g.score));
    const overallAvg = this.calculateAverage(gameHistory.map(g => g.score));
    
    return overallAvg > 0 ? (recentAvg / overallAvg) * 100 : 100;
  }

  /**
   * Identify player strengths
   */
  private identifyStrengths(
    gameHistory: GameSession[],
    statistics: GameStatistics
  ): string[] {
    const strengths: string[] = [];
    const recentGames = this.getRecentGames(gameHistory);

    // High scores
    if (statistics.averageScore >= 20) {
      strengths.push('Consistent high scoring');
    }

    // Trap avoidance
    const trapAvoidanceRate = this.calculateTrapAvoidanceRate(recentGames);
    if (trapAvoidanceRate >= 0.7) {
      strengths.push('Excellent trap avoidance');
    }

    // Survival time
    const avgSurvival = this.calculateAverage(recentGames.map(g => g.duration));
    if (avgSurvival >= 120000) { // 2 minutes
      strengths.push('Strong survival instincts');
    }

    // Consistency
    const consistency = this.calculateScoreConsistency(recentGames);
    if (consistency >= 70) {
      strengths.push('Highly consistent performance');
    }

    // Wall usage
    const wallUsage = statistics.totalWallPassthroughs / statistics.totalGamesPlayed;
    if (wallUsage >= 2) {
      strengths.push('Effective wall navigation');
    }

    // Improvement trend
    const scoreAnalysis = this.analyzeScoreTrend(gameHistory);
    if (scoreAnalysis.direction === 'improving' && scoreAnalysis.strength >= 30) {
      strengths.push('Rapidly improving skills');
    }

    return strengths.length > 0 ? strengths : ['Dedication to improvement'];
  }

  /**
   * Identify areas for improvement
   */
  private identifyImprovements(
    gameHistory: GameSession[],
    statistics: GameStatistics
  ): string[] {
    const improvements: string[] = [];
    const recentGames = this.getRecentGames(gameHistory);

    // Low scores
    if (statistics.averageScore < 10) {
      improvements.push('Focus on scoring more points');
    }

    // Trap hits
    const trapHitRate = statistics.totalTrapsHit / statistics.totalGamesPlayed;
    if (trapHitRate >= 1.5) {
      improvements.push('Work on trap detection and avoidance');
    }

    // Short games
    const avgSurvival = this.calculateAverage(recentGames.map(g => g.duration));
    if (avgSurvival < 60000) { // Less than 1 minute
      improvements.push('Improve survival time and patience');
    }

    // Inconsistency
    const consistency = this.calculateScoreConsistency(recentGames);
    if (consistency < 40) {
      improvements.push('Develop more consistent gameplay');
    }

    // Declining performance
    const overallTrend = this.calculateOverallTrend(gameHistory);
    if (overallTrend === 'declining') {
      improvements.push('Reverse declining performance trend');
    }

    // Efficiency
    const efficiency = this.analyzeEfficiencyTrend(gameHistory);
    if (efficiency.direction === 'declining') {
      improvements.push('Improve food collection efficiency');
    }

    return improvements.length > 0 ? improvements : ['Continue practicing for mastery'];
  }

  /**
   * Generate personalized recommendations
   */
  private generateRecommendations(
    gameHistory: GameSession[],
    statistics: GameStatistics
  ): string[] {
    const recommendations: string[] = [];
    const recentGames = this.getRecentGames(gameHistory);
    const skillLevel = this.calculateSkillLevel(statistics, recentGames);

    // Skill-based recommendations
    switch (skillLevel) {
      case 'Beginner':
        recommendations.push(
          'Focus on basic movement and avoiding walls',
          'Take your time - speed comes with practice',
          'Watch your snake\'s head position carefully'
        );
        break;
      case 'Intermediate':
        recommendations.push(
          'Practice efficient pathfinding to food',
          'Learn to use traps as strategic obstacles',
          'Start planning moves several steps ahead'
        );
        break;
      case 'Advanced':
        recommendations.push(
          'Master the art of trap prediction and avoidance',
          'Optimize your wall passthrough timing',
          'Work on maintaining high performance consistency'
        );
        break;
      case 'Expert':
        recommendations.push(
          'Perfect your risk-reward decision making',
          'Challenge yourself with complex maneuvers',
          'Share your expertise with other players'
        );
        break;
    }

    // Performance-specific recommendations
    const trapAvoidanceRate = this.calculateTrapAvoidanceRate(recentGames);
    if (trapAvoidanceRate < 0.5) {
      recommendations.push('Focus on trap warning indicators - they appear before traps spawn');
    }

    const avgSurvival = this.calculateAverage(recentGames.map(g => g.duration));
    if (avgSurvival < 90000) { // Less than 1.5 minutes
      recommendations.push('Practice patience - sometimes waiting is better than rushing');
    }

    const efficiency = this.analyzeEfficiencyTrend(gameHistory);
    if (efficiency.recentChange < -10) {
      recommendations.push('Try to maintain a steady rhythm when collecting food');
    }

    return recommendations.slice(0, 4); // Limit to top 4 recommendations
  }

  /**
   * Identify achievements and milestones
   */
  private identifyAchievements(
    gameHistory: GameSession[],
    statistics: GameStatistics
  ): string[] {
    const achievements: string[] = [];

    // Score milestones
    if (statistics.bestScore >= 50) achievements.push('🏆 Master Scorer (50+ points)');
    else if (statistics.bestScore >= 30) achievements.push('🎯 Expert Scorer (30+ points)');
    else if (statistics.bestScore >= 20) achievements.push('🌟 High Scorer (20+ points)');
    else if (statistics.bestScore >= 10) achievements.push('📈 Good Scorer (10+ points)');

    // Survival milestones
    const longestGame = Math.max(...gameHistory.map(g => g.duration));
    if (longestGame >= 300000) achievements.push('⏰ Endurance Master (5+ minutes)');
    else if (longestGame >= 180000) achievements.push('🕐 Marathon Player (3+ minutes)');
    else if (longestGame >= 120000) achievements.push('⌛ Survivor (2+ minutes)');

    // Consistency achievements
    const recentGames = this.getRecentGames(gameHistory);
    const consistency = this.calculateScoreConsistency(recentGames);
    if (consistency >= 80) achievements.push('🎯 Consistency Champion');
    else if (consistency >= 60) achievements.push('📊 Reliable Player');

    // Volume achievements
    if (statistics.totalGamesPlayed >= 100) achievements.push('💯 Century Club');
    else if (statistics.totalGamesPlayed >= 50) achievements.push('🎮 Dedicated Player');
    else if (statistics.totalGamesPlayed >= 25) achievements.push('🌱 Regular Player');

    // Special achievements
    const trapAvoidanceRate = this.calculateTrapAvoidanceRate(gameHistory);
    if (trapAvoidanceRate >= 0.8) achievements.push('🛡️ Trap Master');

    const learningRate = this.calculateLearningRate(gameHistory);
    if (learningRate >= 50) achievements.push('📈 Fast Learner');

    return achievements;
  }

  /**
   * Helper: Get recent games for analysis
   */
  private getRecentGames(gameHistory: GameSession[]): GameSession[] {
    return gameHistory.slice(-this.RECENT_GAMES_COUNT);
  }

  /**
   * Helper: Calculate average of number array
   */
  private calculateAverage(numbers: number[]): number {
    if (numbers.length === 0) return 0;
    return numbers.reduce((sum, num) => sum + num, 0) / numbers.length;
  }

  /**
   * Helper: Calculate variance
   */
  private calculateVariance(numbers: number[], mean: number): number {
    if (numbers.length === 0) return 0;
    return numbers.reduce((sum, num) => sum + Math.pow(num - mean, 2), 0) / numbers.length;
  }

  /**
   * Helper: Calculate trap avoidance rate
   */
  private calculateTrapAvoidanceRate(games: GameSession[]): number {
    if (games.length === 0) return 1;
    const totalTraps = games.reduce((sum, game) => sum + game.trapsEncountered, 0);
    const totalGames = games.length;
    const avgTrapsPerGame = totalTraps / totalGames;
    
    // Assume good trap avoidance means hitting less than 1 trap per game on average
    return Math.max(0, Math.min(1, 1 - (avgTrapsPerGame / 3)));
  }

  /**
   * Helper: Format analysis period
   */
  private formatAnalysisPeriod(gameHistory: GameSession[]): string {
    if (gameHistory.length === 0) return 'No games';
    
    const firstGame = gameHistory[0];
    const lastGame = gameHistory[gameHistory.length - 1];
    const daysDiff = Math.ceil((lastGame.timestamp - firstGame.timestamp) / (1000 * 60 * 60 * 24));
    
    if (daysDiff <= 1) return `${gameHistory.length} games today`;
    if (daysDiff <= 7) return `${gameHistory.length} games this week`;
    if (daysDiff <= 30) return `${gameHistory.length} games this month`;
    return `${gameHistory.length} games over ${daysDiff} days`;
  }

  /**
   * Generate basic insights for players with insufficient data
   */
  private generateBasicInsights(statistics: GameStatistics): PerformanceInsights {
    return {
      skillLevel: 'Beginner',
      skillProgress: Math.min(100, (statistics.averageScore / 10) * 100),
      overallTrend: 'stable',
      metrics: {
        scoreConsistency: 50,
        survivalTrend: 'stable',
        efficiencyTrend: 'stable',
        learningRate: 0,
        peakPerformance: statistics.bestScore,
        currentForm: 100,
      },
      scoreAnalysis: {
        direction: 'stable',
        strength: 0,
        recentChange: 0,
        period: 'Insufficient data',
      },
      survivalAnalysis: {
        direction: 'stable',
        strength: 0,
        recentChange: 0,
        period: 'Insufficient data',
      },
      efficiencyAnalysis: {
        direction: 'stable',
        strength: 0,
        recentChange: 0,
        period: 'Insufficient data',
      },
      strengths: ['Getting started', 'Learning the basics'],
      improvements: ['Play more games to unlock detailed analysis'],
      recommendations: [
        'Focus on learning basic movement controls',
        'Try to avoid hitting walls and your own tail',
        'Take your time to understand the game mechanics',
        'Practice makes perfect - keep playing!'
      ],
      achievements: statistics.totalGamesPlayed > 0 ? ['🎮 First Steps'] : [],
    };
  }
}

// Export singleton instance
export const performanceEvaluator = new PerformanceEvaluatorService();