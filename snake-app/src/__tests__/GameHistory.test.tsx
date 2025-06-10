import { vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { GameHistory } from '../components/GameHistory';
import type { GameSession } from '../types';

// Mock game sessions data
const mockGameSessions: GameSession[] = [
  {
    id: 'game_1',
    timestamp: Date.now() - 86400000, // 1 day ago
    score: 15,
    duration: 120000, // 2 minutes
    snakeLength: 8,
    trapsEncountered: 2,
    gameEvents: [
      {
        type: 'food-eaten',
        timestamp: Date.now() - 86400000 + 30000,
        position: { x: 5, y: 5 },
      },
      {
        type: 'trap-hit',
        timestamp: Date.now() - 86400000 + 60000,
        position: { x: 10, y: 10 },
      },
    ],
    endReason: 'self-collision',
  },
  {
    id: 'game_2',
    timestamp: Date.now() - 3600000, // 1 hour ago
    score: 25,
    duration: 180000, // 3 minutes
    snakeLength: 12,
    trapsEncountered: 1,
    gameEvents: [
      {
        type: 'food-eaten',
        timestamp: Date.now() - 3600000 + 30000,
        position: { x: 3, y: 3 },
      },
      {
        type: 'speed-increase',
        timestamp: Date.now() - 3600000 + 120000,
        position: { x: 8, y: 8 },
      },
    ],
    endReason: 'user-quit',
  },
  {
    id: 'game_3',
    timestamp: Date.now() - 1800000, // 30 minutes ago
    score: 5,
    duration: 45000, // 45 seconds
    snakeLength: 6,
    trapsEncountered: 0,
    gameEvents: [
      {
        type: 'food-eaten',
        timestamp: Date.now() - 1800000 + 20000,
        position: { x: 7, y: 7 },
      },
    ],
    endReason: 'self-collision',
  },
];

describe('GameHistory Component', () => {
  const mockOnClearHistory = vi.fn();
  const mockOnExportData = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Rendering', () => {
    test('should render with game history', () => {
      render(
        <GameHistory
          history={mockGameSessions}
          onClearHistory={mockOnClearHistory}
          onExportData={mockOnExportData}
        />
      );

      expect(screen.getByText('Game History (3 games)')).toBeInTheDocument();
      expect(screen.getByText('Export Data')).toBeInTheDocument();
      expect(screen.getByText('Clear History')).toBeInTheDocument();
    });

    test('should render empty state when no history', () => {
      render(
        <GameHistory
          history={[]}
          onClearHistory={mockOnClearHistory}
          onExportData={mockOnExportData}
        />
      );

      expect(screen.getByText('Game History')).toBeInTheDocument();
      expect(screen.getByText('No games played yet')).toBeInTheDocument();
      expect(screen.getByText('Start playing to see your game history here!')).toBeInTheDocument();
    });

    test('should render all game sessions in table', () => {
      render(
        <GameHistory
          history={mockGameSessions}
          onClearHistory={mockOnClearHistory}
          onExportData={mockOnExportData}
        />
      );

      // Check table headers
      expect(screen.getByText(/Date/)).toBeInTheDocument();
      expect(screen.getByText(/Score/)).toBeInTheDocument();
      expect(screen.getByText(/Duration/)).toBeInTheDocument();
      expect(screen.getByText(/Snake Length/)).toBeInTheDocument();
      expect(screen.getByText(/Traps Hit/)).toBeInTheDocument();
      expect(screen.getByText(/End Reason/)).toBeInTheDocument();

      // Check game data
      expect(screen.getByText('15')).toBeInTheDocument();
      expect(screen.getByText('25')).toBeInTheDocument();
      expect(screen.getByText('5')).toBeInTheDocument();
      expect(screen.getByText('2m 0s')).toBeInTheDocument();
      expect(screen.getByText('3m 0s')).toBeInTheDocument();
      expect(screen.getByText('45s')).toBeInTheDocument();
    });
  });

  describe('Sorting', () => {
    test('should sort by score when score header is clicked', () => {
      render(
        <GameHistory
          history={mockGameSessions}
          onClearHistory={mockOnClearHistory}
          onExportData={mockOnExportData}
        />
      );

      const scoreHeader = screen.getByText(/Score/);
      fireEvent.click(scoreHeader);

      // Should sort by score descending by default
      const rows = screen.getAllByRole('row');
      expect(rows[1]).toHaveTextContent('25'); // Highest score first
    });

    test('should toggle sort order on repeated clicks', () => {
      render(
        <GameHistory
          history={mockGameSessions}
          onClearHistory={mockOnClearHistory}
          onExportData={mockOnExportData}
        />
      );

      const scoreHeader = screen.getByText(/Score/);
      
      // First click - descending
      fireEvent.click(scoreHeader);
      expect(scoreHeader).toHaveTextContent('↓');

      // Second click - ascending
      fireEvent.click(scoreHeader);
      expect(scoreHeader).toHaveTextContent('↑');
    });

    test('should sort by duration when duration header is clicked', () => {
      render(
        <GameHistory
          history={mockGameSessions}
          onClearHistory={mockOnClearHistory}
          onExportData={mockOnExportData}
        />
      );

      const durationHeader = screen.getByText(/Duration/);
      fireEvent.click(durationHeader);

      // Should sort by duration
      expect(durationHeader).toHaveTextContent('↓');
    });
  });

  describe('Game Details', () => {
    test('should show/hide game details when details button is clicked', () => {
      render(
        <GameHistory
          history={mockGameSessions}
          onClearHistory={mockOnClearHistory}
          onExportData={mockOnExportData}
        />
      );

      const showButtons = screen.getAllByText('Show');
      expect(showButtons).toHaveLength(3);

      // Click first show button
      fireEvent.click(showButtons[0]);

      // Should show details
      expect(screen.getByText(/Game Events \(\d+\):/)).toBeInTheDocument();
      expect(screen.getByText(/🍎 Food eaten/)).toBeInTheDocument();

      // Button should change to Hide
      expect(screen.getByText('Hide')).toBeInTheDocument();

      // Click hide button
      fireEvent.click(screen.getByText('Hide'));

      // Should hide details
      expect(screen.queryByText('Game Events (2):')).not.toBeInTheDocument();
    });

    test('should display event types correctly', () => {
      render(
        <GameHistory
          history={mockGameSessions}
          onClearHistory={mockOnClearHistory}
          onExportData={mockOnExportData}
        />
      );

      // Show details for second game
      const showButtons = screen.getAllByText('Show');
      fireEvent.click(showButtons[1]);

      // Check event icons and text
      expect(screen.getByText('🍎 Food eaten')).toBeInTheDocument();
      expect(screen.getByText('🚀 Speed increase')).toBeInTheDocument();
    });

    test('should show no events message when game has no events', () => {
      const gameWithNoEvents: GameSession = {
        ...mockGameSessions[0],
        gameEvents: [],
      };

      render(
        <GameHistory
          history={[gameWithNoEvents]}
          onClearHistory={mockOnClearHistory}
          onExportData={mockOnExportData}
        />
      );

      const showButton = screen.getByText('Show');
      fireEvent.click(showButton);

      expect(screen.getByText('No events recorded')).toBeInTheDocument();
    });
  });

  describe('Actions', () => {
    test('should call onExportData when export button is clicked', () => {
      render(
        <GameHistory
          history={mockGameSessions}
          onClearHistory={mockOnClearHistory}
          onExportData={mockOnExportData}
        />
      );

      const exportButton = screen.getByText('Export Data');
      fireEvent.click(exportButton);

      expect(mockOnExportData).toHaveBeenCalledTimes(1);
    });

    test('should call onClearHistory when clear button is clicked', () => {
      render(
        <GameHistory
          history={mockGameSessions}
          onClearHistory={mockOnClearHistory}
          onExportData={mockOnExportData}
        />
      );

      const clearButton = screen.getByText('Clear History');
      fireEvent.click(clearButton);

      expect(mockOnClearHistory).toHaveBeenCalledTimes(1);
    });
  });

  describe('Visual Indicators', () => {
    test('should highlight high score games', () => {
      render(
        <GameHistory
          history={mockGameSessions}
          onClearHistory={mockOnClearHistory}
          onExportData={mockOnExportData}
        />
      );

      // Games with score > 20 should have green background
      const rows = screen.getAllByRole('row');
      const highScoreRow = rows.find(row => row.textContent?.includes('25'));
      expect(highScoreRow).toHaveStyle('background-color: #1a3a1a');
    });

    test('should display trap count with appropriate styling', () => {
      render(
        <GameHistory
          history={mockGameSessions}
          onClearHistory={mockOnClearHistory}
          onExportData={mockOnExportData}
        />
      );

      // Check trap count display
      const trapCells = screen.getAllByText('2');
      expect(trapCells.length).toBeGreaterThan(0);

      // Games with no traps should show 0
      expect(screen.getByText('0')).toBeInTheDocument();
    });

    test('should display end reason with appropriate styling', () => {
      render(
        <GameHistory
          history={mockGameSessions}
          onClearHistory={mockOnClearHistory}
          onExportData={mockOnExportData}
        />
      );

      // Debug: log what's actually rendered
      // screen.debug();

      expect(screen.getByText('Collision')).toBeInTheDocument();
      expect(screen.getByText('Quit')).toBeInTheDocument();
    });
  });

  describe('Formatting', () => {
    test('should format duration correctly', () => {
      render(
        <GameHistory
          history={mockGameSessions}
          onClearHistory={mockOnClearHistory}
          onExportData={mockOnExportData}
        />
      );

      expect(screen.getByText('2m 0s')).toBeInTheDocument();
      expect(screen.getByText('3m 0s')).toBeInTheDocument();
      expect(screen.getByText('45s')).toBeInTheDocument();
    });

    test('should format date correctly', () => {
      render(
        <GameHistory
          history={mockGameSessions}
          onClearHistory={mockOnClearHistory}
          onExportData={mockOnExportData}
        />
      );

      // Should display dates in readable format
      const dateElements = screen.getAllByText(/\w{3} \d{1,2}/);
      expect(dateElements.length).toBeGreaterThan(0);
    });
  });
});