import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import App from '../App';

describe('App', () => {
  it('renders snake game title', () => {
    render(<App />);
    const title = screen.getByRole('heading', { name: /snake game/i });
    expect(title).toBeInTheDocument();
  });

  it('renders the game board', () => {
    render(<App />);
    const gameBoard = screen.getByTestId('game-board');
    expect(gameBoard).toBeInTheDocument();
  });

  it('shows the score display', () => {
    render(<App />);
    const score = screen.getByTestId('score');
    expect(score).toBeInTheDocument();
  });
});
