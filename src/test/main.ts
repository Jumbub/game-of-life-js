import { BENCHMARK } from '../common/benchmark';
import { load, match } from '../common/load';
import { print } from '../common/print';
import { Meta, run, setup } from '../graphics/loop';
import { PROBABLY_OPTIMAL_THREAD_COUNT } from '../logic/threads';
import { BENCHMARK_1 } from './benchmark_1';
import { BENCHMARK_100 } from './benchmark_100';
import { BENCHMARK_2 } from './benchmark_2';
import { BENCHMARK_2000 } from './benchmark_2000';
import { BENCHMARK_3 } from './benchmark_3';

const compare = async (label: string, meta: Meta, data: string) => {
  if (!match(meta.board, data)) {
    print(`${label} failed...`);
    throw new Error(`${label} failed...`);
  }
};

(async () => {
  const setupAndRun = async (maxGenerations: number, data: string) => {
    const meta = await setup(2560, 1440, maxGenerations, 1000, PROBABLY_OPTIMAL_THREAD_COUNT);
    load(meta.board, data);
    await run(meta);
    return meta;
  };

  await compare('benchmark 0', await setupAndRun(0, BENCHMARK), BENCHMARK);
  await compare('benchmark 1', await setupAndRun(1, BENCHMARK), BENCHMARK_1);
  await compare('benchmark 2', await setupAndRun(2, BENCHMARK), BENCHMARK_2);
  await compare('benchmark 3', await setupAndRun(3, BENCHMARK), BENCHMARK_3);
  await compare('benchmark 100', await setupAndRun(100, BENCHMARK), BENCHMARK_100);
  await compare('benchmark 2000', await setupAndRun(2000, BENCHMARK), BENCHMARK_2000);
  print('success');
})();
