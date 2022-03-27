import { Board, DONT_SKIP, getBoardIo } from '../logic/board.js';
import { assignBoardPadding } from '../logic/padding.js';

export const load = (board: Board, data: string) => {
  if (data.length !== board.width * board.height) throw new Error('Miss-match width, height for data loader');
  const { input, output, inSkips, outSkips } = getBoardIo(board);

  for (let i = 0; i < data.length; i++) {
    input[i] = output[i] = parseInt(data[i]);
  }

  inSkips.fill(DONT_SKIP);
  outSkips.fill(DONT_SKIP);

  assignBoardPadding(board);
};

export const match = (board: Board, data: string) => {
  if (data.length !== board.width * board.height) throw new Error('Miss-match width, height for data matcher');
  const { output } = getBoardIo(board);

  return output.every((value, i) => value === parseInt(data[i]));
};

export const random = (size: number) => {
  let data: string[] = Array(size).fill('0');
  for (let i = 0; i < size; i++) if (i % 2 === Math.round(Math.random())) data[i] = '1';
  return data.join('');
};
