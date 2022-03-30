import { BENCHMARK } from '../common/benchmark.js';
import { bench } from './bench.js';
import { parseNumberOrDefault } from '../parseNumberOrDefault.js';
import { random } from '../common/load.js';

const params = new URLSearchParams(location.search);
const width = parseNumberOrDefault(params.get('width'), 2560);
const height = parseNumberOrDefault(params.get('height'), 1440);
const maxGenerations = parseNumberOrDefault(params.get('maxGenerations'), 2000);
const rendersPerSecond = parseNumberOrDefault(params.get('rendersPerSecond'), 30);

const data = width === 2560 && height === 1440 ? BENCHMARK : random((width + 2) * (height + 2));

await bench(data, width, height, maxGenerations, rendersPerSecond);
