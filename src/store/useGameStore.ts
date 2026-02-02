// src/store/useGameStore.ts
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Haptics from "expo-haptics";
import { create } from "zustand";
import { BOARD_SIZE, SCORING, SHAPES } from "../utils/constants";
import { processMove } from "../utils/gameLogic";

interface GameState {
  board: (string | null)[][];
  score: number;
  streak: number;
  lastMoveResult: any | null;
  lastSavedScore: number | null; // Oturum takibi için
  availablePieces: { id: string; shape: number[][]; color: string }[];
  boardLayout: { x: number; y: number; size: number } | null;
  setBoardLayout: (layout: { x: number; y: number; size: number }) => void;
  bestScore: number;
  leaderboard: number[]; // Top 3 Scores
  milestoneEvent: "sweet" | "good" | "perfect" | null; // For UI feedback
  isGameOver: boolean;
  hasSavedGame: boolean;
  loadLeaderboard: () => Promise<void>;

  // Persistence
  saveGame: () => Promise<void>;
  loadGame: () => Promise<void>;

  resetGame: () => void;
  checkGameOver: () => void;
  continueWithNewPieces: () => void;
  continueWithAd: () => void;

  refreshPieces: (checkPlayability?: boolean) => void;
  removePiece: (id: string) => void;
  onDrop: (
    id: string,
    shape: number[][],
    row: number,
    col: number,
    color: string,
  ) => void;
  handleMove: (piece: number[][], r: number, c: number, color: string) => void;
  canPlacePiece: (piece: number[][], row: number, col: number) => boolean;
  clearMilestone: () => void;
}

export const useGameStore = create<GameState>((set, get) => ({
  board: Array(BOARD_SIZE)
    .fill(null)
    .map(() => Array(BOARD_SIZE).fill(null)),
  score: 0,
  streak: 0,
  lastMoveResult: null,
  lastSavedScore: null,
  availablePieces: [],
  boardLayout: null,
  setBoardLayout: (layout) => set({ boardLayout: layout }),
  bestScore: 0,
  leaderboard: [0, 0, 0],
  milestoneEvent: null,
  isGameOver: false,
  hasSavedGame: false,

  saveGame: async () => {
    const { board, score, streak, availablePieces, isGameOver } = get();
    // Don't save if game over
    if (isGameOver) {
      await AsyncStorage.removeItem("gameState");
      set({ hasSavedGame: false });
      return;
    }

    const stateToSave = {
      board,
      score,
      streak,
      availablePieces,
    };
    try {
      await AsyncStorage.setItem("gameState", JSON.stringify(stateToSave));
      set({ hasSavedGame: true });
    } catch (e) {
      console.error("Failed to save game", e);
    }
  },

  loadGame: async () => {
    try {
      const stored = await AsyncStorage.getItem("gameState");
      const savedLeaderboard = await AsyncStorage.getItem("leaderboard");

      if (savedLeaderboard) {
        set({ leaderboard: JSON.parse(savedLeaderboard) });
      }

      if (stored) {
        const parsed = JSON.parse(stored);
        set({
          board: parsed.board,
          score: parsed.score,
          streak: parsed.streak,
          availablePieces: parsed.availablePieces,
          hasSavedGame: true,
          isGameOver: false,
        });
      } else {
        set({ hasSavedGame: false });
      }
    } catch (e) {
      console.error("Failed to load game", e);
    }
  },

  loadLeaderboard: async () => {
    try {
      const stored = await AsyncStorage.getItem("leaderboard");
      if (stored) {
        set({ leaderboard: JSON.parse(stored) });
      }
    } catch (e) {
      console.error("Failed to load leaderboard", e);
    }
  },

  handleMove: (piece, r, c, color) => {
    const { board, streak, score: currentScore, leaderboard } = get();
    // 1. Hamleyi işle (Puan hesabı hariç)
    const result = processMove(board, piece, r, c, color, streak);

    const clearedCount = result.clearedRows.length + result.clearedCols.length;
    let moveScore = 0;
    let newStreak = 0;

    // 2. Puanlama Mantığı (User Rules)
    if (clearedCount > 0) {
      // Temel Puan
      if (clearedCount === 1) {
        moveScore = SCORING.SINGLE_LINE;
      } else {
        // (Sıra x 100) + (Sıra x 25)
        moveScore =
          clearedCount * SCORING.MULTI_LINE_BASE +
          clearedCount * SCORING.MULTI_LINE_BONUS;
      }

      // Streak Arttır
      newStreak = streak + 1;

      // Streak Bonusu (Streak >= 2 ise)
      if (newStreak >= 2) {
        moveScore += Math.floor(
          moveScore * SCORING.STREAK_MULTIPLIER * newStreak,
        );
      }
    } else {
      // Hiçbir şey silinmediyse streak sıfırlanır
      newStreak = 0;
    }

    const newTotalScore = currentScore + moveScore;

    let milestone: GameState["milestoneEvent"] = null;
    const [first, second, third] = leaderboard;

    // Skor değişimi sınırları geçti mi?
    if (currentScore < third && newTotalScore >= third && third > 0)
      milestone = "sweet";
    else if (currentScore < second && newTotalScore >= second && second > 0)
      milestone = "good";
    else if (currentScore < first && newTotalScore >= first && first > 0)
      milestone = "perfect";

    set({
      board: result.placedBoard,
      score: newTotalScore,
      streak: newStreak,
      milestoneEvent: milestone,
    });

    if (clearedCount > 0) {
      // Animasyon tamamlandıktan sonra board'u güncelle (performans için)
      requestAnimationFrame(() => {
        setTimeout(() => {
          set({ board: result.newBoard });
          // Haptics'i ayrı yap, ana thread'i bloke etmesin
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
          get().checkGameOver();
        }, 100); // Daha uzun süre ver animasyon için
      });
    } else {
      // Silme yoksa direkt güncelle
      requestAnimationFrame(() => {
        set({ board: result.newBoard });
        Haptics.selectionAsync();
        get().checkGameOver();
      });
    }
  },

  clearMilestone: () => set({ milestoneEvent: null }),

  refreshPieces: (checkPlayability = false) => {
    const colors = [
      "#FF5733", // Red-Orange
      "#33FF57", // Green
      "#3357FF", // Blue
      "#F333FF", // Pink/Purple
      "#FFC300", // Gold/Yellow
      "#00F5FF", // Cyan
      "#FF33A1", // Hot Pink
    ];
    const shapesKeys = Object.keys(SHAPES) as (keyof typeof SHAPES)[];

    const doesPieceFit = (
      piece: number[][],
      currentBoard: (string | null)[][],
    ) => {
      const boardSize = currentBoard.length;
      for (let r = 0; r <= boardSize - piece.length; r++) {
        // DİKKAT: Burada da aynı hata olmasın diye <= yaptık (zaten doğruydu ama emin olalım)
        for (let c = 0; c <= boardSize - piece[0].length; c++) {
          let fits = true;
          for (let pr = 0; pr < piece.length; pr++) {
            for (let pc = 0; pc < piece[pr].length; pc++) {
              if (
                piece[pr][pc] === 1 &&
                currentBoard[r + pr][c + pc] !== null
              ) {
                fits = false;
                break;
              }
            }
            if (!fits) break;
          }
          if (fits) return true;
        }
      }
      return false;
    };

    const newPieces = [1, 2, 3].map(() => ({
      id: Math.random().toString(36),
      shape: SHAPES[shapesKeys[Math.floor(Math.random() * shapesKeys.length)]],
      color: colors[Math.floor(Math.random() * colors.length)],
    }));

    if (checkPlayability) {
      const { board } = get();
      const isAnyPlayable = newPieces.some((p) => doesPieceFit(p.shape, board));
      if (!isAnyPlayable) {
        // En güvenli parça ile değiştir
        newPieces[0] = {
          id: Math.random().toString(36) + "_safe",
          shape: SHAPES.DOT,
          color: colors[0],
        };
      }
    }

    set({ availablePieces: newPieces });
  },

  removePiece: (id) => {
    const nextPieces = get().availablePieces.filter((p) => p.id !== id);
    set({ availablePieces: nextPieces });
    if (nextPieces.length === 0) {
      get().refreshPieces();
    }
  },

  canPlacePiece: (piece, row, col) => {
    const { board } = get();
    const boardSize = board.length;
    for (let r = 0; r < piece.length; r++) {
      for (let c = 0; c < piece[r].length; c++) {
        if (piece[r][c] === 1) {
          const targetR = row + r;
          const targetC = col + c;
          if (
            targetR < 0 ||
            targetR >= boardSize ||
            targetC < 0 ||
            targetC >= boardSize ||
            board[targetR][targetC] !== null
          )
            return false;
        }
      }
    }
    return true;
  },

  onDrop: (id, shape, row, col, color) => {
    const { canPlacePiece, handleMove, removePiece } = get();
    if (canPlacePiece(shape, row, col)) {
      // ÖNCE parçayı elden çıkar
      removePiece(id);
      // SONRA hamleyi işle
      handleMove(shape, row, col, color);
    }
  },

  checkGameOver: () => {
    const { availablePieces, canPlacePiece, isGameOver } = get();
    // Oyun zaten bitmişse tekrar bakma
    if (isGameOver || availablePieces.length === 0) return;

    const canMove = availablePieces.some((piece) => {
      // --- DÜZELTME BURADA YAPILDI ---
      // Satır kontrolü
      for (let r = 0; r <= BOARD_SIZE - piece.shape.length; r++) {
        // Sütun kontrolü: Eskiden < (küçüktür) idi, şimdi <= (küçük eşittir) yaptık.
        // Bu sayede son sütunu da kontrol ediyor.
        for (let c = 0; c <= BOARD_SIZE - piece.shape[0].length; c++) {
          if (canPlacePiece(piece.shape, r, c)) return true;
        }
      }
      return false;
    });

    if (!canMove) {
      const { score, leaderboard, lastSavedScore } = get();

      let newLeaderboard = [...leaderboard];
      let shouldUpdate = false;

      // Eğer bu "Continue" sonrası bir Game Over ise:
      if (lastSavedScore !== null) {
        if (score > lastSavedScore) {
          const indexToRemove = newLeaderboard.indexOf(lastSavedScore);
          if (indexToRemove !== -1) {
            newLeaderboard.splice(indexToRemove, 1);
          }
          newLeaderboard.push(score);
          shouldUpdate = true;
        }
      } else {
        // İlk Game Over
        newLeaderboard.push(score);
        shouldUpdate = true;
      }

      if (shouldUpdate) {
        newLeaderboard.sort((a, b) => b - a);
        newLeaderboard = newLeaderboard.slice(0, 3);

        AsyncStorage.setItem("leaderboard", JSON.stringify(newLeaderboard));
        set({
          leaderboard: newLeaderboard,
          bestScore: newLeaderboard[0],
        });
      }

      const sessionBest =
        lastSavedScore !== null ? Math.max(score, lastSavedScore) : score;

      set({
        isGameOver: true,
        lastSavedScore: sessionBest,
      });
    }
  },

  resetGame: () => {
    set({
      board: Array(BOARD_SIZE)
        .fill(null)
        .map(() => Array(BOARD_SIZE).fill(null)),
      score: 0,
      streak: 0,
      isGameOver: false,
      lastMoveResult: null,
      milestoneEvent: null,
      lastSavedScore: null,
    });
    get().refreshPieces();
  },

  continueWithNewPieces: () => {
    const { score } = get();
    if (score >= 500) {
      set({
        isGameOver: false,
        score: score - 500,
      });
      get().refreshPieces(true);
    }
  },

  // Reklam izleyerek devam et (puan düşmez)
  continueWithAd: () => {
    set({ isGameOver: false });
    get().refreshPieces(true);
  },
}));
