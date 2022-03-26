import { Board, DONT_SKIP } from '../logic/board.js';

export const load = (board: Board, data: string) => {
  const { width, height, input, output, inSkip, outSkip } = board;
  if (data.length !== width * height) throw new Error('Miss-match width, height for data loader');

  for (let i = 0; i < data.length; i++) {
    input[i] = output[i] = parseInt(data[i]);
  }
  debugger;

  inSkip.fill(DONT_SKIP);
  outSkip.fill(DONT_SKIP);
};

export const match = ({ output, width, height }: Board, data: string) => {
  if (data.length !== width * height) throw new Error('Miss-match width, height for data loader');

  return output.some((value, i) => value != parseInt(data[i]));
};
