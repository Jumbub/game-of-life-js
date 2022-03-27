import { load } from './common/load.js';
import { createNonDeterministicBenchmark } from './common/noneDeterministicBenchmark.js';
import { run, setup } from './graphics/loop.js';
import { parseNumberOrDefault } from './parseNumberOrDefault.js';

{
  const params = new URLSearchParams(location.search);
  const maxGenerations = parseNumberOrDefault(params.get('maxGenerations'), Infinity);
  const rendersPerSecond = parseNumberOrDefault(params.get('rendersPerSecond'), 30);

  const meta = await setup(innerWidth, innerHeight, maxGenerations, 1000 / rendersPerSecond, () => {});
  load(meta.board, createNonDeterministicBenchmark(innerWidth, innerHeight));
  run(meta);
}
