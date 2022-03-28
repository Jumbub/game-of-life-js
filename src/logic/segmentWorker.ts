import { Board, getBoardIo } from './board';
import { nextBoardSection } from './next';

export type StartMessage = {
  beginI: number;
  endI: number;
  board: Board;
  segmentsCount: Int32Array;
  segmentsTotal: number;
  segmentsDone: Int32Array;
};

addEventListener('message', (event: MessageEvent<StartMessage>) => {
  const {
    board: { width },
    beginI,
    endI,
    segmentsCount,
    segmentsTotal,
    segmentsDone,
  } = event.data;
  const { input, output, inSkips, outSkips } = getBoardIo(event.data.board);
  nextBoardSection(beginI, endI, width, input, output, inSkips, outSkips);

  const count = Atomics.add(segmentsCount, 0, 1);
  if (count === segmentsTotal - 1) {
    Atomics.store(segmentsDone, 0, 1);
    Atomics.notify(segmentsDone, 0);
  }
});

postMessage('ready');
