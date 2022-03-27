import { Board } from './board.js';
import { startNextBoardLoop } from './next.js';
import { PROBABLY_OPTIMAL_WORKER_COUNT } from './workers.js';

export type StartMessage = {
  generationsAndMax: Uint32Array; // [computations, maxGenerations]
  board: Board;
};

// Create workers before "go" to avoid startup time affecting benchmark.
const workers = [...new Array(PROBABLY_OPTIMAL_WORKER_COUNT)].map(
  (_, i) => new Worker('/logic/segmentWorker.js', { name: `worker-${i}`, type: 'module' }),
);

addEventListener('message', (event: MessageEvent<StartMessage>) => {
  startNextBoardLoop(event.data.generationsAndMax, event.data.board, workers);
});

// Await worker statuses
const workerStatuses = workers.map(
  worker =>
    new Promise<true>((resolve, reject) => {
      worker.addEventListener('message', ({ data }: MessageEvent<string>) => {
        if (data === 'ready') resolve(true);
        else reject('failed to start worker');
      });
    }),
);

Promise.all(workerStatuses).then(() => {
  postMessage('ready');
});
