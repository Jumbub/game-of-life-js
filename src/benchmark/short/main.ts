import { BENCHMARK } from '../../common/benchmark.js';
import { load } from '../../common/load.js';
import { run, setup } from '../../graphics/run.js';

{
  const WIDTH = 2560;
  const HEIGHT = 1440;
  const MAX_GENERATIONS = 50;
  const RENDERS_PER_SECOND = 30;

  const onDone = () => {
    const stop = performance.now();
    alert(`${MAX_GENERATIONS} generations (${RENDERS_PER_SECOND}rps): ${((stop - start) / 1000).toFixed(2)}s`);
  };
  const meta = setup(WIDTH, HEIGHT, MAX_GENERATIONS, 1000 / RENDERS_PER_SECOND, onDone);
  load(meta.board, BENCHMARK);

  const start = performance.now();
  run(meta);
}
