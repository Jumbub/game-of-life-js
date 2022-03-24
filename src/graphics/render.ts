import { Board } from '../logic/board';

export const render = (board: Board, context: CanvasRenderingContext2D) => {
  context.putImageData(board.output, 0, 0);
};
