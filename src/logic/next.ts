import { Board, Cells, DONT_SKIP, SKIP, Skips, SKIP_MULTIPLYER } from './board.js';
import { pad } from './padding.js';

export const LOOKUP = [0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0, 0, 0] as const;

const isAlive = (i: number, cells: Cells, width: number) => {
  const sum =
    cells[i - width - 1] +
    cells[i - width] +
    cells[i - width + 1] +
    cells[i - 1] +
    cells[i] * 9 + // Notice the `* 9` here
    cells[i + 1] +
    cells[i + width - 1] +
    cells[i + width] +
    cells[i + width + 1];
  return LOOKUP[sum];
};

const revokeSkipForNeighbours = (i: number, outSkip: Skips, width: number) => {
  const top = Math.floor((i - width - 1) / SKIP_MULTIPLYER);
  const middle = Math.floor((i - 1) / SKIP_MULTIPLYER);
  const bottom = Math.floor((i + width - 1) / SKIP_MULTIPLYER);
  outSkip[top] = DONT_SKIP;
  outSkip[top + 1] = DONT_SKIP;
  outSkip[top + 2] = DONT_SKIP;
  outSkip[middle] = DONT_SKIP;
  outSkip[middle + 1] = DONT_SKIP;
  outSkip[middle + 2] = DONT_SKIP;
  outSkip[bottom] = DONT_SKIP;
  outSkip[bottom + 1] = DONT_SKIP;
  outSkip[bottom + 2] = DONT_SKIP;
};

export const next = (board: Board) => {
  [board.input, board.output, board.inSkip, board.outSkip] = [board.output, board.input, board.outSkip, board.inSkip];

  const size = board.width * board.height;

  board.outSkip.fill(SKIP);

  let i = 0;
  while (i < size) {
    while (board.inSkip[i]) i += SKIP_MULTIPLYER;

    board.output[i] = isAlive(i, board.input, board.width);

    if (board.input[i] !== board.output[i]) {
      revokeSkipForNeighbours(i, board.outSkip, board.width);
    }

    i++;
  }

  pad(board);
};
