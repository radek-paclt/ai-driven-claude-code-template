import './App.css';
import { GameBoard } from './components/GameBoard';
import { ThemeProvider } from './contexts/ThemeContext';
import { GameConfigProvider } from './contexts/GameConfigContext';
import { CompactThemeToggle } from './components/ThemeToggle';

function App() {
  return (
    <ThemeProvider>
      <GameConfigProvider>
        <div className="App">
          {/* Skip to main content for accessibility */}
          <a href="#main-content" className="skip-link">
            Skip to main content
          </a>
          
          {/* Theme toggle in top corner */}
          <div className="theme-toggle-container">
            <CompactThemeToggle />
          </div>
          
          <header className="App-header">
            <h1 className="game-title animate-fade-in">🐍 Snake Game</h1>
            <p className="game-subtitle">
              Classic snake game with modern design and features
            </p>
          </header>
          
          <main id="main-content" className="main-content">
            <GameBoard />
          </main>
        </div>
      </GameConfigProvider>
    </ThemeProvider>
  );
}

export default App;
