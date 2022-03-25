import { Board, DONT_SKIP, setCellFrom, setSkip, SKIP_MULTIPLYER } from './board.js';

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
    setSkip(outSkip, i + width * innerHeight, DONT_SKIP);
  }
  for (let i = width * (height - 1) + 1; i <= width * height - 2; i++) {
    setSkip(outSkip, i - width * innerHeight, DONT_SKIP);
  }
  for (let i = width; i <= width * (height - 1); i += width) {
    setSkip(outSkip, i + innerWidth, DONT_SKIP);
  }
  for (let i = width * 2 - 1; i <= width * (height - 1) - 1; i += width) {
    setSkip(outSkip, i - innerWidth, DONT_SKIP);
  }
  setSkip(outSkip, 0, DONT_SKIP);
  setSkip(outSkip, width - 1, DONT_SKIP);
  setSkip(outSkip, width * (height - 1), DONT_SKIP);
  setSkip(outSkip, width * height - 1, DONT_SKIP);
};

export const pad = (board: Board) => {
  assignPadding(board);
  assignSkips(board);
};
