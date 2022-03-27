import { Board, getBoardIo } from './board.js';
import { nextBoardSection } from './next.js';

export type StartMessage = {
  board: Board;
};

{
  addEventListener('message', (event: MessageEvent<StartMessage>) => {
    const { width, height } = event.data.board;
    const { input, output, inSkips, outSkips } = getBoardIo(event.data.board);
    nextBoardSection(width + 1, width * (height - 1) - 1, width, input, output, inSkips, outSkips);
    postMessage(1);
  });
}
