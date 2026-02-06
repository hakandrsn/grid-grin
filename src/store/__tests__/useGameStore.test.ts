import { BOARD_SIZE } from "../../utils/constants";
import { useGameStore } from "../useGameStore";

const EMPTY_CELL = null;

// Mock dependencies
jest.mock("@react-native-async-storage/async-storage", () => ({
  getItem: jest.fn(() => Promise.resolve(null)),
  setItem: jest.fn(() => Promise.resolve()),
}));

jest.mock("expo-haptics", () => ({
  selectionAsync: jest.fn(),
  notificationAsync: jest.fn(),
  NotificationFeedbackType: {
    Success: "success",
    Error: "error",
  },
}));

// Mock Audio
jest.mock("expo-av", () => ({
  Audio: {
    Sound: {
      createAsync: jest.fn(() =>
        Promise.resolve({
          sound: { playAsync: jest.fn(), unloadAsync: jest.fn() },
        }),
      ),
    },
  },
}));

// Mock gameLogic to avoid issues with constants or complex logic during store tests
jest.mock("../../utils/gameLogic", () => ({
  processMove: jest.fn((board, piece, r, c, color, streak) => ({
    newBoard: board,
    placedBoard: board,
    clearedRows: [],
    clearedCols: [],
    score: 100,
    isCross: false,
    comboType: "SINGLE",
    totalCellsCleared: 0,
  })),
}));

// Mock constants to avoid Dimensions issue in Node environment
jest.mock("../../utils/constants", () => ({
  BOARD_SIZE: 9,
  SCORING: {
    BASE_CELL: 0,
    SINGLE_LINE: 100,
    MULTI_LINE_BASE: 100,
    MULTI_LINE_BONUS: 25,
    STREAK_MULTIPLIER: 0.15,
  },
  SHAPES: {
    DOT: [[1]],
    LINE_2_H: [[1, 1]],
    LINE_2_V: [[1], [1]],
    SQUARE_2x2: [
      [1, 1],
      [1, 1],
    ],
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
    // Add minimal shapes needed for refreshPieces logic
  },
  SHAPE_COLORS: {
    DOT: "#fff",
    LINE_2_H: "#fff",
    LINE_2_V: "#fff",
    SQUARE_2x2: "#fff",
    L_SHAPE: "#fff",
    L_SHAPE_2: "#fff",
  },
  CELL_SIZE: 10,
  GRID_PADDING: 2,
  CELL_BORDER_RADIUS: 4,
  // Add any other exports used by gameStore
}));

describe("useGameStore", () => {
  const initialState = useGameStore.getState();

  beforeEach(() => {
    // Reset store
    useGameStore.setState({
      ...initialState,
      score: 0,
      board: Array(BOARD_SIZE)
        .fill(null)
        .map(() => Array(BOARD_SIZE).fill(EMPTY_CELL)),
      availablePieces: [],
      isGameOver: false,
      isDragging: false,
    });
    jest.clearAllMocks();
  });

  describe("Initialization", () => {
    it("should start with empty board and 0 score", () => {
      const state = useGameStore.getState();
      expect(state.score).toBe(0);
      expect(state.board.length).toBe(BOARD_SIZE);
      expect(state.isGameOver).toBe(false);
    });
  });

  describe("Gameplay Actions", () => {
    it("should update isDragging state", () => {
      expect(useGameStore.getState().isDragging).toBe(false);

      useGameStore.getState().setIsDragging(true);
      expect(useGameStore.getState().isDragging).toBe(true);

      useGameStore.getState().setIsDragging(false);
      expect(useGameStore.getState().isDragging).toBe(false);
    });

    it("should refresh pieces correctly", () => {
      useGameStore.getState().refreshPieces();

      const pieces = useGameStore.getState().availablePieces;
      expect(pieces.length).toBe(3);
      pieces.forEach((piece) => {
        expect(piece).toHaveProperty("id");
        expect(piece).toHaveProperty("shape");
        expect(piece).toHaveProperty("color");
      });
    });

    it("should reset game correctly", () => {
      useGameStore.setState({
        score: 100,
        isGameOver: true,
        streak: 5,
      });

      useGameStore.getState().resetGame();

      expect(useGameStore.getState().score).toBe(0);
      expect(useGameStore.getState().isGameOver).toBe(false);
      expect(useGameStore.getState().streak).toBe(0);
      expect(useGameStore.getState().availablePieces.length).toBe(3);
    });
  });

  describe("Game Over Logic", () => {
    // NOTE: Testing `checkGameOver` usually requires mocking `canPlacePiece` logic
    // or constructing specific board states.
    // For this unit test, we'll verify the state update mechanism.

    it("should perform game over check", () => {
      // Mock available pieces to be something huge that definitely won't fit if board is full
      // Or just test that the function runs without crashing
      useGameStore.getState().refreshPieces();
      useGameStore.getState().checkGameOver();
      // We expect it NOT to be game over on an empty board
      expect(useGameStore.getState().isGameOver).toBe(false);
    });
  });
});
