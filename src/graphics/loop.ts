import { createCanvas } from './canvas.js';

export const run = (
  width: number,
  height: number,
  resizable: boolean,
  maxGenerations: number,
  rendersMinimumMilliseconds: number,
) => {
  const canvas = createCanvas(width, height);
  const context = canvas.getContext('2d');
  if (!context) throw new Error('Must be able to retrieve 2d context');
  const images = { input: new ImageData(width, height), output: new ImageData(width, height) };

  let computedGenerations = 0;

  document.addEventListener('keypress', event => {
    if (event.key === 'Enter') {
      // reset
    }
  });

  document.addEventListener('mousedown', event => {
    // draw
  });

  if (resizable) {
    document.addEventListener('resize', () => {
      canvas.width = innerWidth;
      canvas.height = innerHeight;
    });
  }

  const render = async () => {
    let renderStartTime = Date.now();
    context.putImageData(images.output, 0, 0);

    console.log('rendering');

    if (computedGenerations <= maxGenerations) setTimeout(render, rendersMinimumMilliseconds - renderStartTime);
  };

  const compute = () => {
    computedGenerations++;

    if (computedGenerations < maxGenerations) compute();
  };
};
