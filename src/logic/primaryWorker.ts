import { Board } from './board.js';

export type GoMessage = Board & {
  generationsAndMax: Uint32Array; // [computations, maxGenerations]
};

{
  const workers = new Array(1)
    .fill(1)
    .map((_, i) => new Worker('/logic/worker.js', { name: `worker-${i}`, type: 'module' }));

  console.log(workers);

  const doGeneration = (data: GoMessage) => {
    workers.forEach(worker => {
      const handleWorkerFinished = () => {
        worker.removeEventListener('message', handleWorkerFinished);

        // Queue next job
        // TODO: investigate removing the timeout because we're in another thread now!!!
        data.generationsAndMax[0]++;
        if (data.generationsAndMax[0] < data.generationsAndMax[1]) {
          doGeneration(data);
        }
      };

      worker.addEventListener('message', handleWorkerFinished);
      worker.postMessage(data);
    });
  };

  addEventListener('message', (event: MessageEvent<GoMessage>) => {
    doGeneration(event.data);
  });
}
