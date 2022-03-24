import { Board, getCell, setCell, SKIP_MULTIPLYER } from './board.js';
import { LOOKUP } from './lookup.js';
import { pad } from './padding.js';

const isAlive = ({ data, width }: ImageData, i: number) => {
  const sum =
    (data[(i - width - 1) * 4] ? 1 : 0) +
    (data[(i - width) * 4] ? 1 : 0) +
    (data[(i - width + 1) * 4] ? 1 : 0) +
    (data[(i - 1) * 4] ? 1 : 0) +
    (data[i * 4] ? 1 : 0) * 9 + // Notice the `* 9` here
    (data[(i + 1) * 4] ? 1 : 0) +
    (data[(i + width - 1) * 4] ? 1 : 0) +
    (data[(i + width) * 4] ? 1 : 0) +
    (data[(i + width + 1) * 4] ? 1 : 0);
  return LOOKUP[sum];
};

const revokeSkipForNeighbours = (i: number, outSkip: boolean[], width: number) => {
  const top = Math.floor((i - width - 1) / SKIP_MULTIPLYER);
  outSkip[top] = false;
  outSkip[top + 1] = false;
  outSkip[top + 2] = false;
  const middle = top + width;
  outSkip[middle] = false;
  outSkip[middle + 1] = false;
  outSkip[middle + 2] = false;
  const bottom = middle + width;
  outSkip[bottom] = false;
  outSkip[bottom + 1] = false;
  outSkip[bottom + 2] = false;
};

export const next = (board: Board) => {
  [board.input, board.output, board.inSkip, board.outSkip] = [board.output, board.input, board.outSkip, board.inSkip];

  const { input, output, inSkip, outSkip } = board;
  const { width, height } = input;

  const endI = width * height;

  outSkip.fill(true);

  let i = 0;
  while (i < endI) {
    while (inSkip[Math.floor(i / SKIP_MULTIPLYER)]) i += SKIP_MULTIPLYER;

    setCell(output.data, i, isAlive(input, i));

    if (getCell(input.data, i) != getCell(output.data, i)) revokeSkipForNeighbours(i, outSkip, width);

    i++;
  }

  pad(board);
};
