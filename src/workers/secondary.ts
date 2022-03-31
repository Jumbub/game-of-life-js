import { waitForReady } from './ready';

export const secondaryFactory = async (i: number) => {
  return waitForReady(
    new Worker(new URL('./secondary.worker', import.meta.url), { name: `secondary-${i}`, type: 'module' }),
  );
};

export const secondaryFactoryMulti = (n: number) => {
  return Promise.all<Worker>(
    Array(n)
      .fill(0)
      .map(i => secondaryFactory(i)),
  );
};
