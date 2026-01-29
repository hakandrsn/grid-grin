# Block Puzzle Mechanics Master

**Description**: Grid snapping, score calculation, and piece generation logic management.

## Instructions

- Grid yerleşimi hesaplanırken `Math.round` ile en yakın hücreyi bul.
- Yeni parça (shape) üretirken `src/utils/constants.ts` içindeki tanımları baz al.
- Score hesaplamasında streak bonuslarını `processMove` algoritmasına göre uygula.

## Constraints

- Do not modify cell opacity directly without checking if it's a permanent block or a preview.
- Always verify boardLayout coordinates before updating store state.
