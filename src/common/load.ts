import { Board, CELL_COLOR } from '../logic/board.js';

export const load = (board: Board, data: string) => {
  const { input, output, inSkip, outSkip } = board;
  if (data.length !== input.width * input.height) throw new Error('Miss-match width, height for data loader');

  input.data.forEach((_, i) => {
    const state = data[Math.floor(i / 4)] == '1' ? 1 : 0;
    input.data[i] = output.data[i] = CELL_COLOR[state][i % 4];
  });

  inSkip.fill(false);
  outSkip.fill(false);
};
