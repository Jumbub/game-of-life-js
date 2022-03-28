import { load, match } from '../common/load';
import { print } from '../common/print';
import { Meta, run, setup } from '../graphics/loop';
import { BENCHMARK_2000 } from '../test/benchmark_2000';

export const bench = async (
  data: string,
  width: number,
  height: number,
  maxGenerations: number,
  rendersPerSecond: number,
) => {
  const onDone = (meta: Meta) => {
    const stop = performance.now();
    const seconds = (stop - start) / 1000;
    const rps = meta.renders / seconds;

    const validParams =
      width === 2560 && height === 1440 && maxGenerations === 2000 && rendersPerSecond === 30
        ? ''
        : '*PARAMS NOT ELIGIBLE FOR DISPLAY ON README*';
    const validOutput = validParams ? '' : match(meta.board, BENCHMARK_2000) ? '' : '*COMPUTED RESULT IS INCORRECT*';
    const validRps = rps > rendersPerSecond * 0.999 ? '' : '*TOO FEW RENDERS TO BE ELIGIBLE FOR DISPLAY ON README*';

    const report = `seconds: ${seconds.toFixed(2)}s
generations: ${meta.generationsAndMax[0]}
generations/second: ${(meta.generationsAndMax[0] / seconds).toFixed(2)}
renders/second: ${rps.toFixed(2)}
${validOutput || validParams || validRps}`;

    print(report);
    console.log(report);
  };

  const meta = await setup(width, height, maxGenerations, 1000 / rendersPerSecond, onDone);
  load(meta.board, data);

  const start = performance.now();
  run(meta);
};
