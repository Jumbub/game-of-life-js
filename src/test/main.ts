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

const compare = async (label: string, board: Board, data: string) => {
  if (!match(board, data)) {
    print(`${label} failed...`);
    throw new Error(`${label} failed...`);
  }
};

(async () => {
  const setupCurry = async (maxGenerations: number, data: string) => {
    const meta = await setup(
      2560,
      1440,
      maxGenerations,
      1000,
      PROBABLY_OPTIMAL_THREAD_COUNT,
      PROBABLY_OPTIMAL_JOB_COUNT,
    );
    load(meta.board, data);
    return meta;
  };

  await compare('benchmark 0', (await setupCurry(0, BENCHMARK)).board, BENCHMARK);
  await compare('benchmark 1', (await setupCurry(1, BENCHMARK)).board, BENCHMARK_1);
  await compare('benchmark 2', (await setupCurry(2, BENCHMARK)).board, BENCHMARK_2);
  await compare('benchmark 3', (await setupCurry(3, BENCHMARK)).board, BENCHMARK_3);
  await compare('benchmark 100', (await setupCurry(100, BENCHMARK)).board, BENCHMARK_100);
  await compare('benchmark 2000', (await setupCurry(2000, BENCHMARK)).board, BENCHMARK_2000);
})();
