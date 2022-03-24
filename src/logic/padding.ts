import { Board, setCellFrom, SKIP_MULTIPLYER } from './board.js';

const assignPadding = ({ output: { data, width, height } }: Board) => {
  const innerWidth = width - 2;
  const innerHeight = height - 2;

  for (let i = 1; i <= width - 1; i++) {
    setCellFrom(data, i, i + width * innerHeight);
  }
  for (let i = width * (height - 1) + 1; i <= width * height - 2; i++) {
    setCellFrom(data, i, i - width * innerHeight);
  }
  for (let i = width; i <= width * (height - 1); i += width) {
    setCellFrom(data, i, i + innerWidth);
  }
  for (let i = width * 2 - 1; i <= width * (height - 1) - 1; i += width) {
    setCellFrom(data, i, i - innerWidth);
  }
  setCellFrom(data, 0, width * (height - 1) - 2);
  setCellFrom(data, width - 1, width * (height - 2) + 1);
  setCellFrom(data, width * (height - 1), width * 2 - 2);
  setCellFrom(data, width * height - 1, width + 1);
};

const assignSkips = ({ output: { width, height }, outSkip }: Board) => {
  const innerWidth = width - 2;
  const innerHeight = height - 2;

  for (let i = 1; i <= width - 1; i++) {
    outSkip[(i + width * innerHeight) / SKIP_MULTIPLYER] = false;
  }
  for (let i = width * (height - 1) + 1; i <= width * height - 2; i++) {
    outSkip[(i - width * innerHeight) / SKIP_MULTIPLYER] = false;
  }
  for (let i = width; i <= width * (height - 1); i += width) {
    outSkip[(i + innerWidth) / SKIP_MULTIPLYER] = false;
  }
  for (let i = width * 2 - 1; i <= width * (height - 1) - 1; i += width) {
    outSkip[(i - innerWidth) / SKIP_MULTIPLYER] = false;
  }
  outSkip[0 / SKIP_MULTIPLYER] = false;
  outSkip[(width - 1) / SKIP_MULTIPLYER] = false;
  outSkip[(width * (height - 1)) / SKIP_MULTIPLYER] = false;
  outSkip[(width * height - 1) / SKIP_MULTIPLYER] = false;
};

export const pad = (board: Board) => {
  assignPadding(board);
  assignSkips(board);
};
