import { waitForReady } from './ready.js';

export const secondaryFactory = async (i: number) => {
  return waitForReady(new Worker('/workers/secondary.worker.js', { name: `secondary-${i}`, type: 'module' }));
};

export const secondaryFactoryMulti = (n: number) => {
  return Promise.all<Worker>(
    Array(n)
      .fill(0)
      .map(i => secondaryFactory(i)),
  );
};
