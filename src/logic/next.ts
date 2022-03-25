import { Board, DONT_SKIP, getCell, getSkip, setCell, setSkip, SKIP_MULTIPLYER } from './board.js';
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
  for (let b = i - width - 1; b <= i + width - 1; b += width) {
    for (let o = 0; o < 3; o++) {
      setSkip(outSkip, b + o, DONT_SKIP);
    }
  }
};

export const next = (board: Board) => {
  [board.input, board.output, board.inSkip, board.outSkip] = [board.output, board.input, board.outSkip, board.inSkip];

  const { input, output, inSkip, outSkip } = board;
  const { width, height } = input;

  const endI = width * height;

  outSkip.fill(true);

  let i = 0;
  while (i < endI) {
    while (getSkip(inSkip, i)) {
      i += SKIP_MULTIPLYER;
    }

    setCell(output.data, i, isAlive(input, i));

    if (getCell(input.data, i) != getCell(output.data, i)) {
      revokeSkipForNeighbours(i, outSkip, width);
    }

    i++;
  }

  pad(board);
};
