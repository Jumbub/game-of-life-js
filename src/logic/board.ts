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

  const makeZeros = () => {
    const buffer = new SharedArrayBuffer(width * height);
    return new Uint8Array(buffer);
  };

  const board: Board = {
    width,
    height,
    input: makeZeros(),
    output: makeZeros(),
    inSkip: makeZeros(),
    outSkip: makeZeros(),
  };

  return board;
};
