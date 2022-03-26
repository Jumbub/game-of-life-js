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
  if (data.length !== board.width * board.height) throw new Error('Miss-match width, height for data matcher');

  return board.output.every((value, i) => value == parseInt(data[i]));
};

export const random = (size: number) => {
  let data: string[] = Array(size).fill('0');
  for (let i = 0; i < size; i++) if (i % 2 === Math.round(Math.random())) data[i] = '1';
  return data.join('');
};
