import { load } from '../common/load.js';
import { Meta, run, setup } from '../graphics/loop.js';

export const bench = (
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
    const valid = rps > rendersPerSecond * 0.999 ? '' : '*TOO FEW RENDERS TO BE CONSIDERED VALID*';

    const report = `seconds: ${seconds.toFixed(2)}s
generations: ${meta.generationsAndMax[0]}
generations/second: ${(meta.generationsAndMax[0] / seconds).toFixed(2)}
renders/second: ${rps.toFixed(2)}
${valid}`;

    const result = document.createElement('div');
    result.style.position = 'fixed';
    result.style.padding = '10px';
    result.style.backgroundColor = 'black';
    result.style.color = 'white';
    result.innerHTML = report.replace(/\n/g, '<br/>');
    document.body.append(result);

    console.log(report);
  };

  const meta = setup(width, height, maxGenerations, 1000 / rendersPerSecond, onDone);
  load(meta.board, data);

  const start = performance.now();
  run(meta);
};
