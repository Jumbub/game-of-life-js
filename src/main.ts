import { BENCHMARK } from './common/benchmark.js';
import { load } from './common/load.js';
import { createNonDeterministicBenchmark } from './common/noneDeterministicBenchmark.js';
import { run, setup } from './graphics/run.js';
import { parseNumberOrDefault } from './parseNumberOrDefault.js';

{
  const params = new URLSearchParams(location.search);
  const benchmark = params.get('benchmark') === 'true';
  const maxGenerations = parseNumberOrDefault(params.get('maxGenerations'), benchmark ? 2000 : Infinity);
  const rendersPerSecond = parseNumberOrDefault(params.get('rendersPerSecond'), benchmark ? 30 : 30);

  const width = benchmark ? 2560 : innerWidth;
  const height = benchmark ? 1440 : innerHeight;

  const meta = setup(width, height, maxGenerations, 1000 / rendersPerSecond, () => {
    const stop = performance.now();
    alert(`${maxGenerations} generations (${rendersPerSecond}rps): ${stop - start}ms`);
  });

  if (benchmark) load(meta.board, BENCHMARK);
  else load(meta.board, createNonDeterministicBenchmark(width, height));

  const start = performance.now();
  run(meta);
}
