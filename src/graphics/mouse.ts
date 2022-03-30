import { Board, DONT_SKIP, getBoardIo, SKIP_MULTIPLYER } from '../logic/board.js';

export const handleMouse = (canvas: HTMLCanvasElement, board: Board) => {
  const { output, outSkips } = getBoardIo(board);
  let mouseDown = false;
  const draw = ({ x, y }: { x: number; y: number }) => {
    const RADIUS = 15;
    for (let yo = y - RADIUS; yo < y + RADIUS; yo++) {
      for (let xo = x - RADIUS; xo < x + RADIUS; xo++) {
        const i = yo * board.width + xo;
        output[i] = Math.round(Math.random());
        outSkips[~~(i / SKIP_MULTIPLYER)] = DONT_SKIP;
      }
    }
  };
  canvas.addEventListener('mousedown', event => {
    mouseDown = true;
    draw(event);
  });
  canvas.addEventListener('mousemove', event => {
    if (mouseDown) draw(event);
  });
  canvas.addEventListener('mouseup', () => {
    mouseDown = false;
  });
};
