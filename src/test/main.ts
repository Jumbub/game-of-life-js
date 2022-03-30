import { BENCHMARK } from '../common/benchmark.js';
import { load, match } from '../common/load.js';
import { print } from '../common/print.js';
import { Meta, run, setup } from '../graphics/loop.js';
import { Board } from '../logic/board.js';
import { BENCHMARK_1 } from './benchmark_1.js';
import { BENCHMARK_100 } from './benchmark_100.js';
import { BENCHMARK_2 } from './benchmark_2.js';
import { BENCHMARK_2000 } from './benchmark_2000.js';
import { BENCHMARK_3 } from './benchmark_3.js';

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
  const meta = await setup(2560, 1440, 0, 1000, async meta => {
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
  });

  load(meta.board, BENCHMARK);
  run(meta);
})();
