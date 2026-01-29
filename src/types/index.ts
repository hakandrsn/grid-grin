// src/types/index.ts
export type PieceType = number[][];

export interface GameCell {
  row: number;
  col: number;
  color: string | null;
}
