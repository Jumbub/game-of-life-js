import { load } from '../common/load';
import { createNonDeterministicBenchmark } from '../common/noneDeterministicBenchmark';
import { run, setup } from '../graphics/loop';
import { PROBABLY_OPTIMAL_JOB_COUNT, PROBABLY_OPTIMAL_THREAD_COUNT } from '../logic/threads';
import { parseNumberOrDefault } from '../parseNumberOrDefault';

(async () => {
  const params = new URLSearchParams(location.search);
  const maxGenerations = parseNumberOrDefault(params.get('maxGenerations'), 999999);
  const rendersPerSecond = parseNumberOrDefault(params.get('rendersPerSecond'), 30);

  const meta = await setup(
    innerWidth,
    innerHeight,
    maxGenerations,
    1000 / rendersPerSecond,
    PROBABLY_OPTIMAL_THREAD_COUNT,
    PROBABLY_OPTIMAL_JOB_COUNT,
    () => {
      meta.primaryWorker.terminate();
    },
  );
  load(meta.board, createNonDeterministicBenchmark(innerWidth, innerHeight));
  run(meta);
})();
