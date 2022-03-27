import { Board } from './board.js';
import { startNextBoardLoop } from './next.js';

export type StartMessage = {
  generationsAndMax: Uint32Array; // [computations, maxGenerations]
  board: Board;
};

{
  // Create workers before "go" to avoid startup time affecting benchmark.
  const workers = [...new Array(1)].map(
    (_, i) => new Worker('/logic/segmentWorker.js', { name: `worker-${i}`, type: 'module' }),
  );

  addEventListener('message', (event: MessageEvent<StartMessage>) => {
    startNextBoardLoop(event.data.generationsAndMax, event.data.board, workers);
  });
}
