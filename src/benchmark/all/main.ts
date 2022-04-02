import { BENCHMARK } from '../../common/benchmark';
import { bench } from './../bench';

(async () => {
  sessionStorage.clear();

  const THREAD_COUNT = navigator.hardwareConcurrency;
  for (let workerCount = THREAD_COUNT; workerCount <= THREAD_COUNT * 4; workerCount += THREAD_COUNT) {
    await bench(BENCHMARK, 2560, 1440, 2000, 1000 / 30, workerCount);
  }

  console.log({
    orderedSeconds: Object.keys(sessionStorage).sort(),
  });
})();
