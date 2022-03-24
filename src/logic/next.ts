import { Board, CELL_COLOR } from './board.js';
import { LOOKUP } from './lookup.js';

const setCell = (output: ImageData, i: number, alive: boolean) => {
  const color = CELL_COLOR[alive ? 1 : 0];
  for (let offset = 0; offset < 4; offset++) {
    output.data[i * 4 + offset] = color[offset];
  }
};

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

const sameCells = ({ data: a }: ImageData, { data: b }: ImageData, i: number) => {
  return a[i * 4] === b[i * 4];
};

const revokeSkipForNeighbours = (i: number, outSkip: boolean[], width: number) => {
  outSkip[i - width - 1] = false;
  outSkip[i - width] = false;
  outSkip[i - width + 1] = false;
  outSkip[i - 1] = false;
  outSkip[i] = false;
  outSkip[i + 1] = false;
  outSkip[i + width - 1] = false;
  outSkip[i + width] = false;
  outSkip[i + width + 1] = false;
};

export const next = (board: Board) => {
  [board.input, board.output, board.inSkip, board.outSkip] = [board.output, board.input, board.outSkip, board.inSkip];

  const { input, output, inSkip, outSkip } = board;
  const { width, height } = input;

  const endI = width * height;

  outSkip.fill(true);

  let i = 0;
  while (i < endI) {
    while (inSkip[i]) i++;

    setCell(output, i, isAlive(input, i));

    if (!sameCells(input, output, i)) revokeSkipForNeighbours(i, outSkip, width);

    i++;
  }
};
