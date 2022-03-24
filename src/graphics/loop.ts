import { sleep } from '../common/sleep.js';
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
      location.reload();
    } else if (event.key == 'Escape') {
      maxGenerations = 0;
    }
  });

  {
    let mouseDown = false;
    const draw = ({ x, y }: { x: number; y: number }) => {
      const RADIUS = 15;
      for (let yi = y - RADIUS; yi < y + RADIUS; yi++) {
        for (let xi = x - RADIUS; xi < x + RADIUS; xi++) {
          images.output.data[(yi * images.output.width + xi) * 4] = 255;
          images.output.data[(yi * images.output.width + xi) * 4 + 1] = 0;
          images.output.data[(yi * images.output.width + xi) * 4 + 2] = 0;
          images.output.data[(yi * images.output.width + xi) * 4 + 3] = 255;
        }
      }
    };
    document.addEventListener('mousedown', event => {
      mouseDown = true;
      draw(event);
    });
    document.addEventListener('mousemove', event => {
      if (mouseDown) draw(event);
    });
    document.addEventListener('mouseup', () => {
      mouseDown = false;
    });
  }

  if (resizable) {
    window.addEventListener('resize', () => {
      canvas.width = innerWidth;
      canvas.height = innerHeight;
    });
  }

  const render = async () => {
    let renderStartTime = Date.now();

    context.putImageData(images.output, 0, 0);

    if (computedGenerations <= maxGenerations)
      setTimeout(render, rendersMinimumMilliseconds - renderStartTime + Date.now());
  };
  render();

  const compute = async () => {
    // images.output.data.map(() => Math.random() * 255);
    await sleep(1000);

    computedGenerations++;
    if (computedGenerations < maxGenerations) setTimeout(compute, 1);
  };

  compute();
};
