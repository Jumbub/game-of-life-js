import { BENCHMARK } from '../common/benchmark.js';
import { load, match } from '../common/load.js';
import { sleep } from '../common/sleep.js';
import { Board, newBoard } from '../logic/board.js';
import { next } from '../logic/next.js';
import { BENCHMARK_1 } from './benchmark_1.js';
import { BENCHMARK_100 } from './benchmark_100.js';
import { BENCHMARK_2 } from './benchmark_2.js';
import { BENCHMARK_2000 } from './benchmark_2000.js';
import { BENCHMARK_3 } from './benchmark_3.js';

const passed = (status: null | true | false) => {
  switch (status) {
    case true:
      document.body.style.backgroundColor = 'green';
      break;
    case false:
      document.body.style.backgroundColor = 'darkRed';
      break;
    default:
      document.body.style.backgroundColor = 'darkYellow';
  }
};

const print = (label: string) => {
  document.body.append(document.createTextNode(label));
};

const compare = async (label: string, board: Board, data: string) => {
  if (match(board, data)) {
    print(`${label} passed...`);
  } else {
    print(`${label} failed...`);
    passed(false);
    throw new Error(`${label} failed...`);
  }
  await sleep(1);
};

const runGenerations = (n: number, board: Board) => {
  for (let i = 0; i < n; i++) {
    next(board);
    document.title = String(i);
  }
};

(async () => {
  passed(null);
  const board = newBoard(2560, 1440);
  load(board, BENCHMARK);
  await compare('benchmark 0', board, BENCHMARK);
  runGenerations(1, board);
  await compare('benchmark 1', board, BENCHMARK_1);
  runGenerations(1, board);
  await compare('benchmark 2', board, BENCHMARK_2);
  runGenerations(1, board);
  await compare('benchmark 3', board, BENCHMARK_3);
  runGenerations(97, board);
  await compare('benchmark 100', board, BENCHMARK_100);
  runGenerations(1900, board);
  await compare('benchmark 2000', board, BENCHMARK_2000);
  passed(true);
})();
