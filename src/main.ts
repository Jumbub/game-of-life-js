import { BENCHMARK } from './common/benchmark.js';
import { load } from './common/load.js';
import { createNonDeterministicBenchmark } from './common/noneDeterministicBenchmark.js';
import { run } from './graphics/run.js';
import { Board } from './logic/board.js';
import { parseNumberOrDefault } from './parseNumberOrDefault.js';

const params = new URLSearchParams(location.search);
const benchmark = params.get('benchmark') === 'true';
const maxGenerations = parseNumberOrDefault(params.get('maxGenerations'), Infinity);
const rendersPerSecond = parseNumberOrDefault(params.get('rendersPerSecond'), 30);

const width = benchmark ? 2560 : innerWidth;
const height = benchmark ? 1440 : innerHeight;
const loadBoard = (board: Board) => {
  if (benchmark) load(board, BENCHMARK);
  else load(board, createNonDeterministicBenchmark(width, height));
};

run(width, height, maxGenerations, 1000 / rendersPerSecond, loadBoard);
