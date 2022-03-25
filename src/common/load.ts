import { Board, CELL_COLOR, DONT_SKIP } from '../logic/board.js';

export const load = (board: Board, data: string) => {
  const { input, output, inSkip, outSkip } = board;
  if (data.length !== input.width * input.height) throw new Error('Miss-match width, height for data loader');

  input.data.forEach((_, i) => {
    const state = data[Math.floor(i / 4)] == '1' ? 1 : 0;
    input.data[i] = output.data[i] = CELL_COLOR[state][i % 4];
  });

  inSkip.fill(DONT_SKIP);
  outSkip.fill(DONT_SKIP);
};

export const match = ({ output }: Board, data: string) => {
  if (data.length !== output.width * output.height) throw new Error('Miss-match width, height for data loader');

  for (let i = 0; i < data.length; i++) {
    const a = output.data[i * 4] ? 1 : 0;
    const b = data[i] === '1' ? 1 : 0;
    if (a != b) return false;
  }

  return true;
};
