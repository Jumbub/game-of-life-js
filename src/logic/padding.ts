import { Board, DONT_SKIP, SKIP_MULTIPLYER } from './board.js';

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
    outSkip[Math.floor((i + width * innerHeight) / SKIP_MULTIPLYER)] = DONT_SKIP;
  }
  for (let i = width * (height - 1) + 1; i <= width * height - 2; i++) {
    outSkip[Math.floor((i - width * innerHeight) / SKIP_MULTIPLYER)] = DONT_SKIP;
  }
  for (let i = width; i <= width * (height - 1); i += width) {
    outSkip[Math.floor((i + innerWidth) / SKIP_MULTIPLYER)] = DONT_SKIP;
  }
  for (let i = width * 2 - 1; i <= width * (height - 1) - 1; i += width) {
    outSkip[Math.floor((i - innerWidth) / SKIP_MULTIPLYER)] = DONT_SKIP;
  }
  outSkip[Math.floor(0 / SKIP_MULTIPLYER)] = DONT_SKIP;
  outSkip[Math.floor((width - 1) / SKIP_MULTIPLYER)] = DONT_SKIP;
  outSkip[Math.floor((width * (height - 1)) / SKIP_MULTIPLYER)] = DONT_SKIP;
  outSkip[Math.floor((width * height - 1) / SKIP_MULTIPLYER)] = DONT_SKIP;
};

export const assignBoardPadding = (board: Board) => {
  assignPadding(board);
  assignSkips(board);
};
