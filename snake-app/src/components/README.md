# Snake Game Components

This directory contains the core React components for the Snake game implementation.

## Components

### GameBoard.tsx
**Main game orchestrator component**
- Manages the complete game lifecycle (start, pause, game over)
- Handles keyboard input for game controls
- Renders game overlays and instructions
- Integrates all game components and hooks

**Key Features:**
- Space bar for start/pause/restart
- Visual overlays for different game states
- Responsive keyboard controls
- Score display and game instructions

### Snake.tsx
**Snake rendering component**
- Renders all snake segments with visual distinction between head and body
- Head includes animated eyes for character
- Smooth CSS transitions for movement
- Proper z-index layering

**Styling:**
- Green gradient for head (#4CAF50 to #388E3C)
- Lighter green for body segments (#66BB6A to #4CAF50)
- Rounded corners and shadows for depth

### Food.tsx
**Food item component**
- Renders consumable food as animated red circles
- Includes pulsing animation for visual appeal
- Proper positioning within game grid

**Animation:**
- CSS keyframe animation with scale and opacity changes
- 1.5s duration with infinite loop

### Trap.tsx
**Dangerous obstacle component**
- Renders trap obstacles that reduce snake length when triggered
- Orange/red color scheme with lightning bolt icon for immediate recognition
- Pulsing animation to draw player attention
- Warning state with enhanced visual effects when triggered

**Key Features:**
- Random spawning every 10-15 seconds (maximum 3 active)
- Snake length reduction by half when hit (minimum 1 segment)
- Warning animation and automatic removal after collision
- Smart positioning to avoid snake and food overlap

**Styling:**
- Base color: #FF6B35 (orange) with #B33A20 border
- Warning state: #FF4444 (red) with enhanced glow effects
- Pulsing scale animation (600ms interval)
- CSS keyframe animations for warning state

## State Management

The components use custom hooks for state management:
- `useGameState`: Core game logic and state
- `useKeyboard`: Keyboard input handling

## Testing

All components include comprehensive test suites:
- Rendering tests
- User interaction tests
- State management verification
- Keyboard event handling

## Extensibility

The component structure supports future enhancements:
- Wall passthrough mechanics ✅ Implemented
- Acceleration features ✅ Implemented  
- Trap system integration ✅ Implemented
- Custom themes and skins
- Power-ups and special items
- Multiplayer functionality