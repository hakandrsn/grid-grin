// src/utils/constants.ts
import { Dimensions } from "react-native";
const { width, height } = Dimensions.get("window");
export const BOARD_SIZE = 9;

export const SHAPES = {
  DOT: [[1]],
  SQUARE_2x2: [
    [1, 1],
    [1, 1],
  ],
  SQUARE_3x3: [
    [1, 1, 1],
    [1, 1, 1],
    [1, 1, 1],
  ],
  LINE_3_H: [[1, 1, 1]],
  LINE_3_V: [[1], [1], [1]],
  L_SHAPE: [
    [1, 0],
    [1, 0],
    [1, 1],
  ],
  L_SHAPE_2: [
    [0, 1],
    [0, 1],
    [1, 1],
  ],
  Z_SHAPE: [
    [1, 1, 0],
    [0, 1, 1],
  ],
  Z_SHAPE_2: [
    [0, 1, 1],
    [1, 1, 0],
  ],
  T_SHAPE: [
    [1, 1, 1],
    [0, 1, 0],
  ],
  T_REVERSED: [
    [0, 1, 0],
    [1, 1, 1],
  ],
  T_LEFT: [
    [1, 0],
    [1, 1],
    [1, 0],
  ],
  T_RIGHT: [
    [0, 1],
    [1, 1],
    [0, 1],
  ],
  R_LEFT: [
    [1, 0],
    [1, 1],
    [1, 1],
  ],
  R_RIGHT: [
    [0, 1],
    [1, 1],
    [0, 1],
  ],
};

export const THEME = {
  // User Palette
  // 30364F - Main Dark Blue
  // ACBAC4 - Muted Blue/Grey
  // E1D9BC - Beige/Sand
  // F0F0DB - Lightest Beige

  BACKGROUND: "#25343F", // Main Background
  SURFACE: "#23293B", // Slightly darker for clear contrast or "#3B4461" for lighter. Let's go darker for depth.
  SURFACE_LIGHT: "#434C68", // Lighter surface for interaction

  TEXT_PRIMARY: "#F0F0DB", // Lightest
  TEXT_SECONDARY: "#FF5FCF", // Beige
  TEXT_MUTED: "#ACBAC4", // Greyish

  ACCENT: "#E1D9BC", // Using the beige as accent for now, or maybe a generated vibrant one?
  // Let's keep Vibrant colors for game pieces separately?

  // Specific UI
  BUTTON_BG: "#434C68",
  BUTTON_TEXT: "#FFFFFF",
  BUTTON_PRIMARY: "#FF5FCF",
  BUTTON_SECONDARY: "#ACBAC4",
};

export const SCORING = {
  BASE_CELL: 0, // Hücre başına puan yok (Kullanıcı "sadece yok olduğunda" dedi)
  SINGLE_LINE: 100,
  MULTI_LINE_BASE: 100,
  MULTI_LINE_BONUS: 25,
  STREAK_MULTIPLIER: 0.15,
};

export const CELL_MARGIN = 2; // Hücreler arası boşluk

// Board Calculation
// We use the smaller of:
// 1. Width-based (Screen width - padding)
// 2. Height-based (55% of Screen height - padding) to ensure it fits vertically with ads/pieces

// Simplified robust version:
const sizeByWidth = (width - 40) / BOARD_SIZE;
const sizeByHeight = (height * 0.55) / BOARD_SIZE;

export const CELL_SIZE = Math.min(sizeByWidth, sizeByHeight);

export const GRID_PADDING = 2; // Must match Board.tsx gridInner padding

export const CELL_BORDER_RADIUS = 4;

// Test Ad IDs (for development)
const TEST_AD_CONFIG = {
  interstitial: {
    android: "ca-app-pub-3940256099942544/1033173712",
    ios: "ca-app-pub-3940256099942544/4411468910",
  },
  banner: {
    android: "ca-app-pub-3940256099942544/6300978111",
    ios: "ca-app-pub-3940256099942544/2934735716",
  },
  native: {
    android: "ca-app-pub-3940256099942544/2247696110",
    ios: "ca-app-pub-3940256099942544/3986624511",
  },
};

// Production Ad IDs (for release builds)
const PROD_AD_CONFIG = {
  interstitial: {
    android: "ca-app-pub-5502183878891798/6177250595",
    ios: "ca-app-pub-5502183878891798/3358741489",
  },
  banner: {
    android: "ca-app-pub-5502183878891798/3247060847",
    ios: "ca-app-pub-5502183878891798/4671823158",
  },
  native: {
    android: "ca-app-pub-5502183878891798/8939145302",
    ios: "ca-app-pub-5502183878891798/6264880506",
  },
};

export const AD_CONFIG = __DEV__ ? TEST_AD_CONFIG : PROD_AD_CONFIG;
