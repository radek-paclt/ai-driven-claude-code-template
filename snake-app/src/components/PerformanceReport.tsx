import React from 'react';
import type { PerformanceInsights, TrendDirection } from '../services/performanceEvaluator';

interface PerformanceReportProps {
  insights: PerformanceInsights;
  isVisible: boolean;
  onClose: () => void;
}

/**
 * Component for displaying detailed performance analysis and recommendations
 */
export const PerformanceReport: React.FC<PerformanceReportProps> = ({
  insights,
  isVisible,
  onClose,
}) => {
  if (!isVisible) return null;

  const getTrendIcon = (trend: TrendDirection): string => {
    switch (trend) {
      case 'improving': return '📈';
      case 'declining': return '📉';
      case 'stable': return '➡️';
      default: return '➡️';
    }
  };

  const getTrendColor = (trend: TrendDirection): string => {
    switch (trend) {
      case 'improving': return '#4CAF50';
      case 'declining': return '#FF6B6B';
      case 'stable': return '#FFA726';
      default: return '#888';
    }
  };

  const getSkillLevelColor = (level: string): string => {
    switch (level) {
      case 'Expert': return '#9C27B0';
      case 'Advanced': return '#2196F3';
      case 'Intermediate': return '#4CAF50';
      case 'Beginner': return '#FF9800';
      default: return '#888';
    }
  };

  const overlayStyle: React.CSSProperties = {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
    padding: '20px',
  };

  const modalStyle: React.CSSProperties = {
    backgroundColor: '#1a1a1a',
    border: '2px solid #333',
    borderRadius: '12px',
    color: 'white',
    maxWidth: '900px',
    width: '100%',
    maxHeight: '90vh',
    overflow: 'auto',
    position: 'relative',
  };

  const headerStyle: React.CSSProperties = {
    padding: '20px 20px 10px',
    borderBottom: '1px solid #333',
    position: 'sticky',
    top: 0,
    backgroundColor: '#1a1a1a',
    zIndex: 1001,
  };

  const closeButtonStyle: React.CSSProperties = {
    position: 'absolute',
    top: '15px',
    right: '20px',
    background: 'none',
    border: 'none',
    color: '#888',
    fontSize: '24px',
    cursor: 'pointer',
    padding: '5px',
    borderRadius: '4px',
  };

  const contentStyle: React.CSSProperties = {
    padding: '20px',
  };

  const sectionStyle: React.CSSProperties = {
    marginBottom: '25px',
    backgroundColor: '#2a2a2a',
    padding: '20px',
    borderRadius: '8px',
    border: '1px solid #333',
  };

  const sectionTitleStyle: React.CSSProperties = {
    fontSize: '18px',
    fontWeight: 'bold',
    marginBottom: '15px',
    color: '#4CAF50',
    borderBottom: '1px solid #333',
    paddingBottom: '8px',
  };

  const gridStyle: React.CSSProperties = {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
    gap: '15px',
    marginBottom: '20px',
  };

  const metricCardStyle: React.CSSProperties = {
    backgroundColor: '#333',
    padding: '15px',
    borderRadius: '6px',
    border: '1px solid #444',
  };

  const metricLabelStyle: React.CSSProperties = {
    fontSize: '14px',
    color: '#ccc',
    marginBottom: '8px',
  };

  const metricValueStyle: React.CSSProperties = {
    fontSize: '18px',
    fontWeight: 'bold',
    color: 'white',
  };

  const skillLevelStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: '15px',
    marginBottom: '20px',
  };

  const skillBadgeStyle: React.CSSProperties = {
    backgroundColor: getSkillLevelColor(insights.skillLevel),
    color: 'white',
    padding: '8px 16px',
    borderRadius: '20px',
    fontSize: '16px',
    fontWeight: 'bold',
  };

  const progressBarStyle: React.CSSProperties = {
    flex: 1,
    height: '8px',
    backgroundColor: '#444',
    borderRadius: '4px',
    overflow: 'hidden',
  };

  const progressFillStyle: React.CSSProperties = {
    height: '100%',
    backgroundColor: getSkillLevelColor(insights.skillLevel),
    width: `${insights.skillProgress}%`,
    transition: 'width 0.3s ease',
  };

  const listStyle: React.CSSProperties = {
    listStyle: 'none',
    padding: 0,
    margin: 0,
  };

  const listItemStyle: React.CSSProperties = {
    padding: '8px 12px',
    marginBottom: '6px',
    backgroundColor: '#333',
    borderRadius: '4px',
    fontSize: '14px',
    borderLeft: '3px solid #4CAF50',
  };

  const improvementItemStyle: React.CSSProperties = {
    ...listItemStyle,
    borderLeftColor: '#FF9800',
  };

  const recommendationItemStyle: React.CSSProperties = {
    ...listItemStyle,
    borderLeftColor: '#2196F3',
  };

  const achievementItemStyle: React.CSSProperties = {
    ...listItemStyle,
    borderLeftColor: '#9C27B0',
    backgroundColor: '#2a1a2a',
  };

  const trendAnalysisStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    marginBottom: '10px',
  };

  const trendIconStyle: React.CSSProperties = {
    fontSize: '20px',
  };

  const trendTextStyle: React.CSSProperties = {
    color: getTrendColor(insights.overallTrend),
    fontWeight: 'bold',
  };

  const formatPercentage = (value: number): string => {
    return `${value.toFixed(1)}%`;
  };

  return (
    <div style={overlayStyle} onClick={onClose}>
      <div style={modalStyle} onClick={(e) => e.stopPropagation()}>
        <div style={headerStyle}>
          <h2 style={{ margin: 0, color: '#4CAF50' }}>
            Performance Analysis Report
          </h2>
          <button
            style={closeButtonStyle}
            onClick={onClose}
            onMouseEnter={(e) => (e.target as HTMLElement).style.color = '#fff'}
            onMouseLeave={(e) => (e.target as HTMLElement).style.color = '#888'}
          >
            ×
          </button>
        </div>

        <div style={contentStyle}>
          {/* Skill Level Section */}
          <div style={sectionStyle}>
            <div style={sectionTitleStyle}>Skill Assessment</div>
            
            <div style={skillLevelStyle}>
              <div style={skillBadgeStyle}>{insights.skillLevel}</div>
              <div style={progressBarStyle}>
                <div style={progressFillStyle}></div>
              </div>
              <span style={{ color: '#ccc', fontSize: '14px' }}>
                {formatPercentage(insights.skillProgress)} to next level
              </span>
            </div>

            <div style={trendAnalysisStyle}>
              <span style={trendIconStyle}>{getTrendIcon(insights.overallTrend)}</span>
              <span>Overall Trend:</span>
              <span style={trendTextStyle}>
                {insights.overallTrend.charAt(0).toUpperCase() + insights.overallTrend.slice(1)}
              </span>
            </div>
          </div>

          {/* Performance Metrics */}
          <div style={sectionStyle}>
            <div style={sectionTitleStyle}>Performance Metrics</div>
            
            <div style={gridStyle}>
              <div style={metricCardStyle}>
                <div style={metricLabelStyle}>Score Consistency</div>
                <div style={metricValueStyle}>
                  {formatPercentage(insights.metrics.scoreConsistency)}
                </div>
              </div>

              <div style={metricCardStyle}>
                <div style={metricLabelStyle}>Current Form</div>
                <div style={metricValueStyle}>
                  {formatPercentage(insights.metrics.currentForm)}
                </div>
              </div>

              <div style={metricCardStyle}>
                <div style={metricLabelStyle}>Learning Rate</div>
                <div style={metricValueStyle}>
                  {insights.metrics.learningRate > 0 ? '+' : ''}
                  {formatPercentage(insights.metrics.learningRate)}
                </div>
              </div>

              <div style={metricCardStyle}>
                <div style={metricLabelStyle}>Peak Performance</div>
                <div style={metricValueStyle}>
                  {insights.metrics.peakPerformance.toFixed(1)} points
                </div>
              </div>
            </div>
          </div>

          {/* Trend Analysis */}
          <div style={sectionStyle}>
            <div style={sectionTitleStyle}>Trend Analysis</div>
            
            <div style={gridStyle}>
              <div style={metricCardStyle}>
                <div style={metricLabelStyle}>Score Trend</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={trendIconStyle}>{getTrendIcon(insights.scoreAnalysis.direction)}</span>
                  <span style={{ color: getTrendColor(insights.scoreAnalysis.direction) }}>
                    {insights.scoreAnalysis.direction}
                  </span>
                </div>
                <div style={{ fontSize: '12px', color: '#888', marginTop: '5px' }}>
                  {insights.scoreAnalysis.recentChange > 0 ? '+' : ''}
                  {formatPercentage(insights.scoreAnalysis.recentChange)} change
                </div>
              </div>

              <div style={metricCardStyle}>
                <div style={metricLabelStyle}>Survival Trend</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={trendIconStyle}>{getTrendIcon(insights.survivalAnalysis.direction)}</span>
                  <span style={{ color: getTrendColor(insights.survivalAnalysis.direction) }}>
                    {insights.survivalAnalysis.direction}
                  </span>
                </div>
                <div style={{ fontSize: '12px', color: '#888', marginTop: '5px' }}>
                  {insights.survivalAnalysis.period}
                </div>
              </div>

              <div style={metricCardStyle}>
                <div style={metricLabelStyle}>Efficiency Trend</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={trendIconStyle}>{getTrendIcon(insights.efficiencyAnalysis.direction)}</span>
                  <span style={{ color: getTrendColor(insights.efficiencyAnalysis.direction) }}>
                    {insights.efficiencyAnalysis.direction}
                  </span>
                </div>
                <div style={{ fontSize: '12px', color: '#888', marginTop: '5px' }}>
                  Food collection rate
                </div>
              </div>
            </div>
          </div>

          {/* Strengths and Improvements */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>
            {/* Strengths */}
            <div style={sectionStyle}>
              <div style={sectionTitleStyle}>Your Strengths</div>
              <ul style={listStyle}>
                {insights.strengths.map((strength, index) => (
                  <li key={index} style={listItemStyle}>
                    {strength}
                  </li>
                ))}
              </ul>
            </div>

            {/* Areas for Improvement */}
            <div style={sectionStyle}>
              <div style={sectionTitleStyle}>Areas for Improvement</div>
              <ul style={listStyle}>
                {insights.improvements.map((improvement, index) => (
                  <li key={index} style={improvementItemStyle}>
                    {improvement}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Recommendations */}
          <div style={sectionStyle}>
            <div style={sectionTitleStyle}>Personalized Recommendations</div>
            <ul style={listStyle}>
              {insights.recommendations.map((recommendation, index) => (
                <li key={index} style={recommendationItemStyle}>
                  {recommendation}
                </li>
              ))}
            </ul>
          </div>

          {/* Achievements */}
          {insights.achievements.length > 0 && (
            <div style={sectionStyle}>
              <div style={sectionTitleStyle}>Achievements Unlocked</div>
              <ul style={listStyle}>
                {insights.achievements.map((achievement, index) => (
                  <li key={index} style={achievementItemStyle}>
                    {achievement}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};