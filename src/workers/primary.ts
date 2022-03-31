import { WorkerCountMessage } from './primary.worker';
import { waitForReady } from './ready';

export const primaryFactory = (workerCount: number) => {
  const primary = new Worker(new URL('./primary.worker', import.meta.url), { name: 'primary', type: 'module' });

  const message: WorkerCountMessage = workerCount;
  primary.postMessage(message);

  return waitForReady(primary);
};
