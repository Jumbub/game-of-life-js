import { Board, DONT_SKIP, getBoardIo, skipI, SKIP_MULTIPLYER } from './board.js';

const assignPadding = (board: Board) => {
  const { width, height } = board;
  const { output } = getBoardIo(board);

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

const assignSkips = (board: Board) => {
  const { width, height } = board;
  const { outSkips } = getBoardIo(board);

  const innerWidth = width - 2;
  const innerHeight = height - 2;

  for (let i = 1; i <= width - 1; i++) {
    outSkips[skipI(i + width * innerHeight)] = DONT_SKIP;
  }
  for (let i = width * (height - 1) + 1; i <= width * height - 2; i++) {
    outSkips[skipI(i - width * innerHeight)] = DONT_SKIP;
  }
  for (let i = width; i <= width * (height - 1); i += width) {
    outSkips[skipI(i + innerWidth)] = DONT_SKIP;
  }
  for (let i = width * 2 - 1; i <= width * (height - 1) - 1; i += width) {
    outSkips[skipI(i - innerWidth)] = DONT_SKIP;
  }
  outSkips[skipI(0)] = DONT_SKIP;
  outSkips[skipI(width - 1)] = DONT_SKIP;
  outSkips[skipI(width * (height - 1))] = DONT_SKIP;
  outSkips[skipI(width * height - 1)] = DONT_SKIP;
};

export const assignBoardPadding = (board: Board) => {
  assignPadding(board);
  assignSkips(board);
};
