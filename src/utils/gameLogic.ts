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
  // 1. Structural Sharing: Sadece değişen satırları kopyala
  // Başlangıçta yeni board array'i oluşturuyoruz (shallow copy of rows)
  let placedBoard = [...board];
  let cellsPlaced = 0;

  // Hangi satırların değiştiğini takip et
  const modifiedRows = new Set<number>();

  piece.forEach((pRow, rIdx) => {
    const targetRowIdx = row + rIdx;
    if (targetRowIdx >= 0 && targetRowIdx < BOARD_SIZE) {
      pRow.forEach((cell, cIdx) => {
        if (cell === 1) {
          const targetColIdx = col + cIdx;
          if (targetColIdx >= 0 && targetColIdx < BOARD_SIZE) {
            // Eğer bu satır henüz kopyalanmadıysa, şimdi kopyala
            if (!modifiedRows.has(targetRowIdx)) {
              placedBoard[targetRowIdx] = [...placedBoard[targetRowIdx]];
              modifiedRows.add(targetRowIdx);
            }
            // Hücreyi güncelle
            placedBoard[targetRowIdx][targetColIdx] = color;
            cellsPlaced++;
          }
        }
      });
    }
  });

  const clearedRows: number[] = [];
  const clearedCols: number[] = [];

  // 2. Satırları Kontrol Et
  // placedBoard üzerinden kontrol yapıyoruz
  for (let r = 0; r < BOARD_SIZE; r++) {
    let isFull = true;
    for (let c = 0; c < BOARD_SIZE; c++) {
      if (placedBoard[r][c] === null) {
        isFull = false;
        break;
      }
    }
    if (isFull) clearedRows.push(r);
  }

  // 3. Sütunları Kontrol Et
  for (let c = 0; c < BOARD_SIZE; c++) {
    let isFull = true;
    for (let r = 0; r < BOARD_SIZE; r++) {
      if (placedBoard[r][c] === null) {
        isFull = false;
        break;
      }
    }
    if (isFull) clearedCols.push(c);
  }

  // 4. Board'u Temizle (Structural Sharing Devam)
  // Eğer temizlenecek satır veya sütun yoksa, placedBoard'u direkt kullanabiliriz (newBoard = placedBoard)
  // Ancak temizleme varsa, yine sadece etkilenen satırları kopyalamalıyız.

  let newBoard = placedBoard;
  const hasClearing = clearedRows.length > 0 || clearedCols.length > 0;

  if (hasClearing) {
    // Yeni bir board referansı (shallow copy of rows)
    newBoard = [...placedBoard];

    // Temizlenecek satırların hepsinin kopyalanması lazım (referans koparma)
    // Ancak optimize edebiliriz: Zaten placedBoard oluştururken bazılarını kopyalamıştık.
    // Söyle yapalım: Temizleme işlemi için iterate ederken kopyalama yapalım.

    for (let r = 0; r < BOARD_SIZE; r++) {
      const isRowCleared = clearedRows.includes(r);
      // Bu satırda herhangi bir hücre silinecek mi?
      // (Satırın kendisi siliniyor VEYA sütun silindiği için bu satırdaki bir hücre siliniyor)
      const isAffectedByColClear = clearedCols.length > 0;

      if (isRowCleared || isAffectedByColClear) {
        // Eğer placedBoard oluştururken bu satırı zaten kopyaladıysak (modifiedRows),
        // tekrar kopyalamamıza gerek yok, o array zaten yeni.
        // AMA: placedBoard referansını 'newBoard' değişkenine atadık.
        // Eğer `newBoard[r]` üzerinde değişiklik yapacaksak, ve bu `placedBoard[r]` ile aynı referans ise,
        // o zaman `placedBoard`'u da değiştirmiş oluruz!
        // `placedBoard` bizim "animasyon öncesi dolu hali"miz, onu bozmamalıyız.
        // O YÜZDEN: `newBoard` için değişecek her satırı MUTLAKA kopyalamalıyız.

        newBoard[r] = [...placedBoard[r]];

        for (let c = 0; c < BOARD_SIZE; c++) {
          if (clearedRows.includes(r) || clearedCols.includes(c)) {
            newBoard[r][c] = null;
          }
        }
      }
    }
  }

  // 5. Gelişmiş Skor Hesaplama
  const totalLines = clearedRows.length + clearedCols.length;
  const isCross = clearedRows.length > 0 && clearedCols.length > 0;
  let moveScore = cellsPlaced * SCORING.BASE_CELL;

  if (totalLines > 0) {
    let lineBonus = totalLines * SCORING.SINGLE_LINE;

    // Streak bonus (Üst üste hamleler)
    moveScore += lineBonus * (1 + currentStreak * 0.5);
  }

  return {
    newBoard,
    placedBoard,
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
