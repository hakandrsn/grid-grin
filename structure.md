# Project Structure

## App (`/app`)

- `_layout.tsx`: Root layout configuration.
- `index.tsx`: Main Menu screen.
- `game.tsx`: Main Game screen.

## Source (`/src`)

### Components (`/src/components`)

- `Board.tsx`: The main game grid container (View logic).
- `Cell.tsx`: Individual grid cell (Memoized, handles animations).
- `Piece.tsx`: Draggable game pieces (Gesture logic).
- `ScoreBoard.tsx`: Displays current score and streak.
- `StreakOverlay.tsx`: Displays visual feedback for streaks and milestones.
- `GameOverOverlay.tsx`: End-game modal with score and actions.
- `ads/GameBannerAd.tsx`: Component wrapper for Banner Ads.

### Store (`/src/store`)

- `useGameStore.ts`: Central game state (Board data, score, logic actions).
- `adStore.ts`: Manages ad loading and display logic.

### Utils (`/src/utils`)

- `constants.ts`: Global constants (Colors, Board Size, Scoring rules).
- `gameLogic.ts`: Pure functions for game rules (Move processing, line clearing).
