import { WorkerCountMessage } from './primary.worker.js';
import { waitForReady } from './ready.js';

export const primaryFactory = (workerCount: number) => {
  const primary = new Worker('/workers/primary.worker.js', { name: 'primary', type: 'module' });

  const message: WorkerCountMessage = workerCount;
  primary.postMessage(message);

  return waitForReady(primary);
};
