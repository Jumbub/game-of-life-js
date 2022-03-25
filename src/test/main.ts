import { BENCHMARK } from '../common/benchmark.js';
import { load, match } from '../common/load.js';
import { newBoard } from '../logic/board.js';
import { next } from '../logic/next.js';
import { BENCHMARK_1 } from './benchmark_1.js';
import { BENCHMARK_2 } from './benchmark_2.js';
import { BENCHMARK_3 } from './benchmark_3.js';
import { BENCHMARK_2000 } from './benchmark_2000.js';
import { BENCHMARK_100 } from './benchmark_100.js';

(async () => {
  const WIDTH = 2560;
  const HEIGHT = 1440;

  document.body.style.backgroundColor = 'yellow';
  const message = (label: string) => {
    document.body.append(document.createTextNode(label));
  };

  const board = newBoard(WIDTH, HEIGHT);
  load(board, BENCHMARK);

  const a = async () => {
    next(board);
    document.title = String(0);
    if (!match(board, BENCHMARK_1)) {
      document.body.style.backgroundColor = 'red';
      message('benchmark 1 failed...');
      return;
    } else message('benchmark 1 passed...');
    setTimeout(b, 0);
  };

  const b = async () => {
    next(board);
    document.title = String(1);
    if (!match(board, BENCHMARK_2)) {
      document.body.style.backgroundColor = 'red';
      message('benchmark 2 failed...');
      return;
    } else message('benchmark 2 passed...');
    setTimeout(c, 0);
  };

  const c = async () => {
    next(board);
    document.title = String(2);
    if (!match(board, BENCHMARK_3)) {
      document.body.style.backgroundColor = 'red';
      message('benchmark 3 failed...');
      return;
    } else message('benchmark 3 passed...');
    setTimeout(d, 0);
  };

  const d = async () => {
    for (let i = 3; i < 100; i++) {
      next(board);
      document.title = String(i);
    }
    if (!match(board, BENCHMARK_100)) {
      document.body.style.backgroundColor = 'red';
      message('benchmark 100 failed...');
      return;
    } else message('benchmark 100 passed...');
    setTimeout(e, 0);
  };

  const e = async () => {
    for (let i = 100; i < 2000; i++) {
      next(board);
      document.title = String(i);
    }
    if (!match(board, BENCHMARK_2000)) {
      document.body.style.backgroundColor = 'red';
      message('benchmark 2000 failed...');
      return;
    } else message('benchmark 2000 passed...');
  };

  a();

  document.body.style.backgroundColor = 'green';
})();
