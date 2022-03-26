import { Board, DONT_SKIP } from '../logic/board.js';

export const load = (board: Board, data: string) => {
  if (data.length !== board.width * board.height) throw new Error('Miss-match width, height for data loader');

  for (let i = 0; i < data.length; i++) {
    board.input[i] = board.output[i] = parseInt(data[i]);
  }

  board.inSkip.fill(DONT_SKIP);
  board.outSkip.fill(DONT_SKIP);
};

export const match = (board: Board, data: string) => {
  if (data.length !== board.width * board.height) throw new Error('Miss-match width, height for data loader');

  return board.output.every((value, i) => value == parseInt(data[i]));
};
