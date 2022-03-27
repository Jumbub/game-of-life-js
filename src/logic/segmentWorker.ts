import { Board, getBoardIo } from './board.js';
import { nextBoardSection } from './next.js';

export type StartMessage = {
  beginI: number;
  endI: number;
  board: Board;
};

addEventListener('message', (event: MessageEvent<StartMessage>) => {
  const {
    board: { width },
    beginI,
    endI,
  } = event.data;
  const { input, output, inSkips, outSkips } = getBoardIo(event.data.board);
  nextBoardSection(beginI, endI, width, input, output, inSkips, outSkips);
  postMessage(1);
});

postMessage('ready');
