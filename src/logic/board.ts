import { littleEndian } from './endianness.js';

export type Board = {
  input: Uint8Array;
  output: Uint8Array;

  inSkip: Skips;
  outSkip: Skips;

  width: number;
  height: number;
};

export const ALIVE = 1 as const;
export const DEAD = 0 as const;

export type Cell = typeof ALIVE | typeof DEAD;
export type Cells = Uint8Array;

export const SKIP = 1 as const;
export const DONT_SKIP = 0 as const;

export type Skip = typeof SKIP | typeof DONT_SKIP;
export type Skips = Uint8Array;

export const SKIP_MULTIPLYER = 2;

export const newBoard = (viewWidth: number, viewHeight: number) => {
  if (!littleEndian()) {
    alert('Browser uses incorrect bit endianness');
    throw new Error('git gud');
  }

  const width = viewWidth + 2;
  const height = viewHeight + 2;

  const newCells = () => new Uint8Array(width * height).fill(DEAD);
  const newSkips = () => new Uint8Array(width * height).fill(DONT_SKIP);

  const board: Board = {
    width,
    height,
    input: newCells(),
    output: newCells(),
    inSkip: newSkips(),
    outSkip: newSkips(),
  };

  return board;
};
