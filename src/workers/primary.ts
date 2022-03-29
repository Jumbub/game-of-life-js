import { waitForReady } from './ready.js';

export const primaryFactory = async () => {
  return waitForReady(new Worker('/workers/primary.worker.js', { name: 'primary', type: 'module' }));
};
