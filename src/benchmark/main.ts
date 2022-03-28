import { BENCHMARK } from '../common/benchmark';
import { bench } from './bench';
import { parseNumberOrDefault } from '../parseNumberOrDefault';
import { random } from '../common/load';

{
  const params = new URLSearchParams(location.search);
  const width = parseNumberOrDefault(params.get('width'), 2560);
  const height = parseNumberOrDefault(params.get('height'), 1440);
  const maxGenerations = parseNumberOrDefault(params.get('maxGenerations'), 2000);
  const rendersPerSecond = parseNumberOrDefault(params.get('rendersPerSecond'), 30);

  const data = width === 2560 && height === 1440 ? BENCHMARK : random((width + 2) * (height + 2));

  bench(data, width, height, maxGenerations, rendersPerSecond);
}
