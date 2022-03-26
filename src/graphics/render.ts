import { Board } from '../logic/board';

export const ALIVE_COLOR_32 = 4294967295;
export const DEAD_COLOR_32 = 16777215;

const COLOR_DIFF = ALIVE_COLOR_32 - DEAD_COLOR_32;

export const render = (board: Board, context: CanvasRenderingContext2D) => {
  const { width, height, output } = board;

  const image = new ImageData(width, height);
  const image32 = new Uint32Array(image.data.buffer);
  const size = width * height;

  for (let i = 0; i < size; i++) {
    image32[i] = DEAD_COLOR_32 + COLOR_DIFF * output[i];
  }

  context.putImageData(image, 0, 0);
};
