import { BOARD_SIZE, SCORING } from "./constants";

export interface MoveResult {
  newBoard: (string | null)[][];
  placedBoard: (string | null)[][]; // The board state BEFORE clearing lines
  clearedRows: number[];
  clearedCols: number[];
  score: number;
  isCross: boolean;
  comboType: "SINGLE" | "DOUBLE" | "TRIPLE" | "QUAD" | "MEGA";
  totalCellsCleared: number;
}

export const processMove = (
  board: (string | null)[][],
  piece: number[][],
  row: number,
  col: number,
  color: string,
  currentStreak: number,
): MoveResult => {
  // 1. Board'un kopyasını oluştur ve parçayı yerleştir
  let nextBoard = board.map((r) => [...r]);
  let cellsPlaced = 0;

  piece.forEach((pRow, rIdx) => {
    pRow.forEach((cell, cIdx) => {
      if (cell === 1) {
        nextBoard[row + rIdx][col + cIdx] = color;
        cellsPlaced++;
      }
    });
  });

  const clearedRows: number[] = [];
  const clearedCols: number[] = [];

  // 2. Satırları Kontrol Et
  for (let r = 0; r < BOARD_SIZE; r++) {
    if (nextBoard[r].every((cell) => cell !== null)) clearedRows.push(r);
  }

  // 3. Sütunları Kontrol Et
  for (let c = 0; c < BOARD_SIZE; c++) {
    let isFull = true;
    for (let r = 0; r < BOARD_SIZE; r++) {
      if (nextBoard[r][c] === null) {
        isFull = false;
        break;
      }
    }
    if (isFull) clearedCols.push(c);
  }

  // 4. Board'u Temizle (Görsel animasyon için indexleri saklıyoruz)
  const finalBoard = nextBoard.map((r, rIdx) =>
    r.map((cell, cIdx) =>
      clearedRows.includes(rIdx) || clearedCols.includes(cIdx) ? null : cell,
    ),
  );

  // 5. Gelişmiş Skor Hesaplama
  const totalLines = clearedRows.length + clearedCols.length;
  const isCross = clearedRows.length > 0 && clearedCols.length > 0;
  let moveScore = cellsPlaced * SCORING.BASE_CELL;

  if (totalLines > 0) {
    let lineBonus = totalLines * SCORING.LINE_CLEAR;
    // Multi-line bonus (2 satır silmek 1+1'den daha değerli olmalı)
    lineBonus = Math.floor(
      lineBonus * Math.pow(totalLines, SCORING.MULTI_LINE_EXP - 1),
    );

    // Cross bonus
    if (isCross) lineBonus *= SCORING.CROSS_BONUS;

    // Streak bonus (Üst üste hamleler)
    moveScore += lineBonus * (1 + currentStreak * 0.5);
  }

  return {
    newBoard: finalBoard,
    placedBoard: nextBoard,
    clearedRows,
    clearedCols,
    score: Math.floor(moveScore),
    isCross,
    totalCellsCleared:
      clearedRows.length * BOARD_SIZE +
      clearedCols.length * BOARD_SIZE -
      clearedRows.length * clearedCols.length,
    comboType:
      totalLines <= 1
        ? "SINGLE"
        : totalLines === 2
          ? "DOUBLE"
          : totalLines === 3
            ? "TRIPLE"
            : "MEGA",
  };
};
