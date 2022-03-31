import { BootPrimaryMessage } from './primary.worker.js';
import { waitForReady } from './ready.js';

export const primaryFactory = (options: BootPrimaryMessage) => {
  const primary = new Worker('/workers/primary.worker.js', { name: 'primary', type: 'module' });
  primary.postMessage(options);
  return waitForReady(primary);
};
