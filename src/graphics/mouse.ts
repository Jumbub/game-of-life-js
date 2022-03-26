import { Board, DONT_SKIP } from '../logic/board.js';

export const handleMouse = (board: Board) => {
  let mouseDown = false;
  const draw = ({ x, y }: { x: number; y: number }) => {
    const RADIUS = 15;
    for (let yo = y - RADIUS; yo < y + RADIUS; yo++) {
      for (let xo = x - RADIUS; xo < x + RADIUS; xo++) {
        const i = yo * board.width + xo;
        board.output[i] = Math.round(Math.random());
        board.outSkip[i] = DONT_SKIP;
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
};
