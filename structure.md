# Project Structure

## Root

```
grid-grin/
├── app/                      # Expo Router pages
├── src/                      # Source code
├── assets/                   # Static assets
├── services/                 # External services
├── .agent/                   # Agent workflows
├── app.json                  # Expo config
├── eas.json                  # EAS Build config
├── package.json              # Dependencies
└── tsconfig.json             # TypeScript config
```

## App Pages (`app/`)

- `_layout.tsx` (Root layout with splash screen)
- `index.tsx` (Main menu screen)
- `game.tsx` (Game play screen)

## Source Code (`src/`)

### Components (`src/components/`)

- `Board.tsx` (9x9 game grid with animated border)
- `Cell.tsx` (Single grid cell with puff animation)
- `Piece.tsx` (Draggable puzzle piece)
- `ScoreBoard.tsx` (Score and streak display)
- `GameOverOverlay.tsx` (Game over modal with options)
- `StreakOverlay.tsx` (Streak celebration images)
- `PuffExplosion.tsx` (Cell clear particle effect)
- `Splash/CustomSplashScreen.tsx` (Animated splash screen)
- `ads/GameBannerAd.tsx` (Banner ad wrapper)

### Store (`src/store/`)

- `useGameStore.ts` (Main game state: board, score, pieces)
- `adStore.ts` (Ad timing and state management)

### Utils (`src/utils/`)

- `constants.ts` (Theme, shapes, scoring, cell size)
- `gameLogic.ts` (Move processing, line clearing)

### Types (`src/types/`)

- `index.ts` (Shared TypeScript types)

## Services (`services/`)

- `adManager.ts` (Interstitial ad loading/showing)

## Assets (`assets/images/`)

- `streak/` (Celebration images: good, sweet, perfect)
- App icons and splash images
