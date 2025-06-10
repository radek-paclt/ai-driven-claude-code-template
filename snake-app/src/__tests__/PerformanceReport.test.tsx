import { render, screen, fireEvent } from '@testing-library/react';
import { vi } from 'vitest';
import { PerformanceReport } from '../components/PerformanceReport';
import type { PerformanceInsights } from '../types';

describe('PerformanceReport Component', () => {
  const mockInsights: PerformanceInsights = {
    skillLevel: 'Intermediate',
    skillProgress: 65,
    overallTrend: 'improving',
    metrics: {
      scoreConsistency: 75,
      survivalTrend: 'stable',
      efficiencyTrend: 'improving',
      learningRate: 25,
      peakPerformance: 35,
      currentForm: 110,
    },
    scoreAnalysis: {
      direction: 'improving',
      strength: 40,
      recentChange: 15.5,
      period: '10 games this week',
    },
    survivalAnalysis: {
      direction: 'stable',
      strength: 20,
      recentChange: 2.1,
      period: '10 games this week',
    },
    efficiencyAnalysis: {
      direction: 'improving',
      strength: 30,
      recentChange: 12.3,
      period: '10 games this week',
    },
    strengths: [
      'Consistent high scoring',
      'Strong survival instincts',
      'Rapidly improving skills',
    ],
    improvements: [
      'Work on trap detection and avoidance',
      'Improve food collection efficiency',
    ],
    recommendations: [
      'Practice efficient pathfinding to food',
      'Learn to use traps as strategic obstacles',
      'Start planning moves several steps ahead',
      'Focus on trap warning indicators',
    ],
    achievements: [
      '🎯 Expert Scorer (30+ points)',
      '📈 Fast Learner',
      '🌟 High Scorer (20+ points)',
    ],
  };

  describe('Visibility Control', () => {
    test('should not render when isVisible is false', () => {
      render(
        <PerformanceReport
          insights={mockInsights}
          isVisible={false}
          onClose={() => {}}
        />
      );

      expect(screen.queryByText('Performance Analysis Report')).not.toBeInTheDocument();
    });

    test('should render when isVisible is true', () => {
      render(
        <PerformanceReport
          insights={mockInsights}
          isVisible={true}
          onClose={() => {}}
        />
      );

      expect(screen.getByText('Performance Analysis Report')).toBeInTheDocument();
    });
  });

  describe('Content Rendering', () => {
    beforeEach(() => {
      render(
        <PerformanceReport
          insights={mockInsights}
          isVisible={true}
          onClose={() => {}}
        />
      );
    });

    test('should display skill level and progress', () => {
      expect(screen.getByText('Intermediate')).toBeInTheDocument();
      expect(screen.getByText('65.0% to next level')).toBeInTheDocument();
    });

    test('should display overall trend', () => {
      expect(screen.getByText('Overall Trend:')).toBeInTheDocument();
      expect(screen.getByText('Improving')).toBeInTheDocument();
    });

    test('should display performance metrics', () => {
      expect(screen.getByText('Performance Metrics')).toBeInTheDocument();
      expect(screen.getByText('75.0%')).toBeInTheDocument(); // Score consistency
      expect(screen.getByText('110.0%')).toBeInTheDocument(); // Current form
      expect(screen.getByText('+25.0%')).toBeInTheDocument(); // Learning rate
      expect(screen.getByText('35.0 points')).toBeInTheDocument(); // Peak performance
    });

    test('should display trend analysis', () => {
      expect(screen.getByText('Trend Analysis')).toBeInTheDocument();
      expect(screen.getByText('Score Trend')).toBeInTheDocument();
      expect(screen.getByText('Survival Trend')).toBeInTheDocument();
      expect(screen.getByText('Efficiency Trend')).toBeInTheDocument();
      
      // Check for trend change percentages
      expect(screen.getByText('+15.5% change')).toBeInTheDocument();
      expect(screen.getByText('10 games this week')).toBeInTheDocument();
    });

    test('should display strengths', () => {
      expect(screen.getByText('Your Strengths')).toBeInTheDocument();
      expect(screen.getByText('Consistent high scoring')).toBeInTheDocument();
      expect(screen.getByText('Strong survival instincts')).toBeInTheDocument();
      expect(screen.getByText('Rapidly improving skills')).toBeInTheDocument();
    });

    test('should display improvements', () => {
      expect(screen.getByText('Areas for Improvement')).toBeInTheDocument();
      expect(screen.getByText('Work on trap detection and avoidance')).toBeInTheDocument();
      expect(screen.getByText('Improve food collection efficiency')).toBeInTheDocument();
    });

    test('should display recommendations', () => {
      expect(screen.getByText('Personalized Recommendations')).toBeInTheDocument();
      expect(screen.getByText('Practice efficient pathfinding to food')).toBeInTheDocument();
      expect(screen.getByText('Learn to use traps as strategic obstacles')).toBeInTheDocument();
      expect(screen.getByText('Start planning moves several steps ahead')).toBeInTheDocument();
      expect(screen.getByText('Focus on trap warning indicators')).toBeInTheDocument();
    });

    test('should display achievements when present', () => {
      expect(screen.getByText('Achievements Unlocked')).toBeInTheDocument();
      expect(screen.getByText('🎯 Expert Scorer (30+ points)')).toBeInTheDocument();
      expect(screen.getByText('📈 Fast Learner')).toBeInTheDocument();
      expect(screen.getByText('🌟 High Scorer (20+ points)')).toBeInTheDocument();
    });
  });

  describe('Interaction', () => {
    test('should call onClose when close button is clicked', () => {
      const mockOnClose = vi.fn();
      
      render(
        <PerformanceReport
          insights={mockInsights}
          isVisible={true}
          onClose={mockOnClose}
        />
      );

      const closeButton = screen.getByText('×');
      fireEvent.click(closeButton);

      expect(mockOnClose).toHaveBeenCalledTimes(1);
    });

    test('should call onClose when overlay is clicked', () => {
      const mockOnClose = vi.fn();
      
      render(
        <PerformanceReport
          insights={mockInsights}
          isVisible={true}
          onClose={mockOnClose}
        />
      );

      // Click on the overlay (parent div)
      const overlay = screen.getByText('Performance Analysis Report').closest('div')?.parentElement?.parentElement;
      if (overlay) {
        fireEvent.click(overlay);
        expect(mockOnClose).toHaveBeenCalledTimes(1);
      }
    });

    test('should not call onClose when modal content is clicked', () => {
      const mockOnClose = vi.fn();
      
      render(
        <PerformanceReport
          insights={mockInsights}
          isVisible={true}
          onClose={mockOnClose}
        />
      );

      // Click on the modal content
      const modalContent = screen.getByText('Performance Analysis Report');
      fireEvent.click(modalContent);

      expect(mockOnClose).not.toHaveBeenCalled();
    });
  });

  describe('Different Skill Levels', () => {
    test('should render Expert skill level correctly', () => {
      const expertInsights: PerformanceInsights = {
        ...mockInsights,
        skillLevel: 'Expert',
        skillProgress: 100,
      };

      render(
        <PerformanceReport
          insights={expertInsights}
          isVisible={true}
          onClose={() => {}}
        />
      );

      expect(screen.getByText('Expert')).toBeInTheDocument();
      expect(screen.getByText('100.0% to next level')).toBeInTheDocument();
    });

    test('should render Beginner skill level correctly', () => {
      const beginnerInsights: PerformanceInsights = {
        ...mockInsights,
        skillLevel: 'Beginner',
        skillProgress: 25,
      };

      render(
        <PerformanceReport
          insights={beginnerInsights}
          isVisible={true}
          onClose={() => {}}
        />
      );

      expect(screen.getByText('Beginner')).toBeInTheDocument();
      expect(screen.getByText('25.0% to next level')).toBeInTheDocument();
    });
  });

  describe('Different Trend Directions', () => {
    test('should display declining trends correctly', () => {
      const decliningInsights: PerformanceInsights = {
        ...mockInsights,
        overallTrend: 'declining',
        scoreAnalysis: {
          ...mockInsights.scoreAnalysis,
          direction: 'declining',
          recentChange: -12.5,
        },
      };

      render(
        <PerformanceReport
          insights={decliningInsights}
          isVisible={true}
          onClose={() => {}}
        />
      );

      expect(screen.getByText('Declining')).toBeInTheDocument();
      expect(screen.getByText('-12.5% change')).toBeInTheDocument();
    });

    test('should display stable trends correctly', () => {
      const stableInsights: PerformanceInsights = {
        ...mockInsights,
        overallTrend: 'stable',
        scoreAnalysis: {
          ...mockInsights.scoreAnalysis,
          direction: 'stable',
          recentChange: 1.2,
        },
      };

      render(
        <PerformanceReport
          insights={stableInsights}
          isVisible={true}
          onClose={() => {}}
        />
      );

      expect(screen.getByText('Stable')).toBeInTheDocument();
      expect(screen.getByText('+1.2% change')).toBeInTheDocument();
    });
  });

  describe('No Achievements', () => {
    test('should not display achievements section when empty', () => {
      const noAchievementsInsights: PerformanceInsights = {
        ...mockInsights,
        achievements: [],
      };

      render(
        <PerformanceReport
          insights={noAchievementsInsights}
          isVisible={true}
          onClose={() => {}}
        />
      );

      expect(screen.queryByText('Achievements Unlocked')).not.toBeInTheDocument();
    });
  });

  describe('Percentage Formatting', () => {
    test('should format percentages to one decimal place', () => {
      const preciseInsights: PerformanceInsights = {
        ...mockInsights,
        skillProgress: 67.8934,
        metrics: {
          ...mockInsights.metrics,
          scoreConsistency: 82.4567,
          currentForm: 95.1234,
          learningRate: 33.7890,
        },
      };

      render(
        <PerformanceReport
          insights={preciseInsights}
          isVisible={true}
          onClose={() => {}}
        />
      );

      expect(screen.getByText('67.9% to next level')).toBeInTheDocument();
      expect(screen.getByText('82.5%')).toBeInTheDocument();
      expect(screen.getByText('95.1%')).toBeInTheDocument();
      expect(screen.getByText('+33.8%')).toBeInTheDocument();
    });
  });
});