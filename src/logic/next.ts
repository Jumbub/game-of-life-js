import { Meta } from '../graphics/loop.js';
import { Board, Cells, DONT_SKIP, SKIP, Skips, SKIP_MULTIPLYER } from './board.js';
import { assignBoardPadding } from './padding.js';

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
  outSkip[Math.floor((i - width - 1) / SKIP_MULTIPLYER)] = DONT_SKIP;
  outSkip[Math.floor((i - width) / SKIP_MULTIPLYER)] = DONT_SKIP;
  outSkip[Math.floor((i - width + 1) / SKIP_MULTIPLYER)] = DONT_SKIP;
  outSkip[Math.floor((i - 1) / SKIP_MULTIPLYER)] = DONT_SKIP;
  outSkip[Math.floor(i / SKIP_MULTIPLYER)] = DONT_SKIP;
  outSkip[Math.floor((i + 1) / SKIP_MULTIPLYER)] = DONT_SKIP;
  outSkip[Math.floor((i + width - 1) / SKIP_MULTIPLYER)] = DONT_SKIP;
  outSkip[Math.floor((i + width) / SKIP_MULTIPLYER)] = DONT_SKIP;
  outSkip[Math.floor((i + width + 1) / SKIP_MULTIPLYER)] = DONT_SKIP;
};

export const next = (board: Board) => {
  [board.input, board.output, board.inSkip, board.outSkip] = [board.output, board.input, board.outSkip, board.inSkip];

  board.outSkip.fill(SKIP);

  let i = board.width + 1;
  const endI = board.width * (board.height - 1) - 1;
  while (i < endI) {
    while (board.inSkip[Math.floor(i / SKIP_MULTIPLYER)]) i += SKIP_MULTIPLYER;

    board.output[i] = isAlive(i, board.input, board.width);

    if (board.input[i] !== board.output[i]) {
      revokeSkipForNeighbours(i, board.outSkip, board.width);
    }

    i++;
  }

  assignBoardPadding(board);
};

export const startNextBoardLoop = (meta: Meta & { loop?: () => void }) => {
  next(meta.board);
  meta.generations++;

  if (meta.generations < meta.maxGenerations) {
    if (!meta.loop)
      meta.loop = () => {
        startNextBoardLoop(meta);
      };
    setTimeout(meta.loop, 0);
  } else meta.onDone(meta);
};
