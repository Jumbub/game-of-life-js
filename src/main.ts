import { load } from './common/load';
import { createNonDeterministicBenchmark } from './common/noneDeterministicBenchmark';
import { run, setup } from './graphics/loop';
import { parseNumberOrDefault } from './parseNumberOrDefault';

{
  const params = new URLSearchParams(location.search);
  const maxGenerations = parseNumberOrDefault(params.get('maxGenerations'), Infinity);
  const rendersPerSecond = parseNumberOrDefault(params.get('rendersPerSecond'), 30);

  const meta = await setup(innerWidth, innerHeight, maxGenerations, 1000 / rendersPerSecond, () => {});
  load(meta.board, createNonDeterministicBenchmark(innerWidth, innerHeight));
  run(meta);
}
