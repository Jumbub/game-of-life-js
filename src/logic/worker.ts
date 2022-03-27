import { Board } from './board.js';
import { next } from './next.js';

addEventListener('message', (event: MessageEvent<Board>) => {
  const board = event.data;
  next(board);
  postMessage(board);
});
