import { littleEndian } from './endianness.js';

export type Board = {
  cells: [Cells, Cells];
  skips: [Skips, Skips];

  cellsInput: Uint32Array; // [index of cells]
  skipsInput: Uint32Array; // [index of skips]

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

export const SKIP_MULTIPLYER = 8;

export const newBoard = (viewWidth: number, viewHeight: number) => {
  if (!littleEndian()) {
    alert('Browser uses incorrect bit endianness');
    throw new Error('git gud');
  }
  if (!crossOriginIsolated) {
    alert('Page is not cross origin isolated');
    throw new Error('git gud');
  }

  const width = viewWidth + 2;
  const height = viewHeight + 2;

  const cells = () => new Uint8Array(new SharedArrayBuffer(width * height));
  const sharedNumber = () => new Uint32Array(new SharedArrayBuffer(4));

  const board: Board = {
    width,
    height,
    cellsInput: sharedNumber(),
    cells: [cells(), cells()],
    skipsInput: sharedNumber(),
    skips: [cells(), cells()],
  };

  return board;
};

export const flipBoardIo = (board: Board) => {
  board.cellsInput[0] = 1 - board.cellsInput[0];
  board.skipsInput[0] = 1 - board.skipsInput[0];
};

export const getBoardIo = (board: Board) => {
  return {
    input: board.cells[board.cellsInput[0]],
    output: board.cells[1 - board.cellsInput[0]],
    inSkips: board.skips[board.skipsInput[0]],
    outSkips: board.skips[1 - board.skipsInput[0]],
  };
};
