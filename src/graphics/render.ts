import { Board } from '../logic/board';

export const ALIVE_COLOR_32 = 4294967295;
export const DEAD_COLOR_32 = 16777215;

const COLOR_DIFF = ALIVE_COLOR_32 - DEAD_COLOR_32;

export const render = (image: ImageData, board: Board, context: CanvasRenderingContext2D) => {
  const { width, height } = board;

  const image32 = new Uint32Array(image.data.buffer);
  const size = width * height;

  const output = board.cells[1 - board.cellsInput[0]];

  for (let i = 0; i < size; i++) {
    image32[i] = DEAD_COLOR_32 + COLOR_DIFF * output[i];
  }

  context.putImageData(image, 0, 0);
};
