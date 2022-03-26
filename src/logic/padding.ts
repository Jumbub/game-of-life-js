import { Board, DONT_SKIP } from './board.js';

const assignPadding = ({ output, width, height }: Board) => {
  const innerWidth = width - 2;
  const innerHeight = height - 2;

  for (let i = 1; i <= width - 1; i++) {
    output[i] = output[i + width * innerHeight];
  }
  for (let i = width * (height - 1) + 1; i <= width * height - 2; i++) {
    output[i] = output[i - width * innerHeight];
  }
  for (let i = width; i <= width * (height - 1); i += width) {
    output[i] = output[i + innerWidth];
  }
  for (let i = width * 2 - 1; i <= width * (height - 1) - 1; i += width) {
    output[i] = output[i - innerWidth];
  }
  output[0] = output[width * (height - 1) - 2];
  output[width - 1] = output[width * (height - 2) + 1];
  output[width * (height - 1)] = output[width * 2 - 2];
  output[width * height - 1] = output[width + 1];
};

const assignSkips = ({ outSkip, width, height }: Board) => {
  const innerWidth = width - 2;
  const innerHeight = height - 2;

  for (let i = 1; i <= width - 1; i++) {
    outSkip[i + width * innerHeight] = outSkip[DONT_SKIP];
  }
  for (let i = width * (height - 1) + 1; i <= width * height - 2; i++) {
    outSkip[i - width * innerHeight] = outSkip[DONT_SKIP];
  }
  for (let i = width; i <= width * (height - 1); i += width) {
    outSkip[i + innerWidth] = outSkip[DONT_SKIP];
  }
  for (let i = width * 2 - 1; i <= width * (height - 1) - 1; i += width) {
    outSkip[i - innerWidth] = outSkip[DONT_SKIP];
  }
  outSkip[0] = outSkip[DONT_SKIP];
  outSkip[width - 1] = outSkip[DONT_SKIP];
  outSkip[width * (height - 1)] = outSkip[DONT_SKIP];
  outSkip[width * height - 1] = outSkip[DONT_SKIP];
};

export const pad = (board: Board) => {
  assignPadding(board);
  assignSkips(board);
};
