import { load, match } from '../common/load.js';
import { print } from '../common/print.js';
import { Meta, run, setup } from '../graphics/loop.js';
import { PROBABLY_OPTIMAL_JOB_COUNT, PROBABLY_OPTIMAL_THREAD_COUNT } from '../logic/threads.js';
import { BENCHMARK_2000 } from '../test/benchmark_2000.js';

export const bench = (
  data: string,
  width: number,
  height: number,
  maxGenerations: number,
  rendersPerSecond: number,
  workerCount: number = PROBABLY_OPTIMAL_THREAD_COUNT,
  jobCount: number = PROBABLY_OPTIMAL_JOB_COUNT,
) =>
  new Promise(async resolve => {
    const onDone = (meta: Meta) => {
      const stop = performance.now();

      meta.primaryWorker.terminate();

      const seconds = (stop - start) / 1000;
      const actualRendersPerSecond = meta.renders / seconds;
      const now = new Date();

      const validConfiguration = width === 2560 && height === 1440 && maxGenerations === 2000;
      const validGraphics = actualRendersPerSecond >= rendersPerSecond * 0.999;
      const validLogic = validConfiguration && match(meta.board, BENCHMARK_2000);

      const report = `${
        !validConfiguration
          ? '*INELIGIBLE CONFIGURATION*\n\n'
          : !validGraphics
          ? '*TOO FEW RENDERS*\n\n'
          : !validLogic
          ? '*FINAL STATE IS WRONG*\n\n'
          : ''
      }seconds: ${seconds.toFixed(2)}s
      generations/second: ${(meta.generationsAndMax[0] / seconds).toFixed(2)}
      renders/second: ${rendersPerSecond.toFixed(2)}

      generations: ${meta.generationsAndMax[0]}
      width: ${width}
      height: ${height}
      workerCount: ${workerCount}
      jobCount: ${jobCount}

      now: ${now.toISOString()}`.replace(/      /g, '');

      print(report);
      console.log(report);
      sessionStorage.setItem(`report-${seconds}-${workerCount}-${jobCount}`, report);

      resolve(true);
    };

    const meta = await setup(width, height, maxGenerations, 1000 / rendersPerSecond, workerCount, jobCount, onDone);
    load(meta.board, data);

    const start = performance.now();
    run(meta);
  });
