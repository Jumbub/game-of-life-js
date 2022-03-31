import { BENCHMARK } from '../common/benchmark';
import { load, match } from '../common/load';
import { print } from '../common/print';
import { Meta, run, setup } from '../graphics/loop';
import { Board } from '../logic/board';
import { PROBABLY_OPTIMAL_JOB_COUNT, PROBABLY_OPTIMAL_THREAD_COUNT } from '../logic/threads';
import { BENCHMARK_1 } from './benchmark_1';
import { BENCHMARK_100 } from './benchmark_100';
import { BENCHMARK_2 } from './benchmark_2';
import { BENCHMARK_2000 } from './benchmark_2000';
import { BENCHMARK_3 } from './benchmark_3';

(async () => {
  const compare = async (label: string, board: Board, data: string) => {
    if (!match(board, data)) {
      print(`${label} failed...`);
      throw new Error(`${label} failed...`);
    }
  };

  const runTest = (meta: Meta, maxGenerations: number, data: string, next: () => void) => {
    meta.generationsAndMax[1] = maxGenerations;
    run({
      ...meta,
      onDone: async () => {
        await compare(`benchmark ${maxGenerations}`, meta.board, data);
        next();
      },
    });
  };

  (async () => {
    const meta = await setup(
      2560,
      1440,
      0,
      1000,
      PROBABLY_OPTIMAL_THREAD_COUNT,
      PROBABLY_OPTIMAL_JOB_COUNT,
      async meta => {
        await compare('benchmark 0', meta.board, BENCHMARK);

        runTest(meta, 1, BENCHMARK_1, () => {
          runTest(meta, 2, BENCHMARK_2, () => {
            runTest(meta, 3, BENCHMARK_3, () => {
              runTest(meta, 100, BENCHMARK_100, () => {
                runTest(meta, 2000, BENCHMARK_2000, () => {
                  document.title = 'passed';
                  print('passed');
                  meta.primaryWorker.terminate();
                });
              });
            });
          });
        });
      },
    );

    load(meta.board, BENCHMARK);
    run(meta);
  })();
})();
