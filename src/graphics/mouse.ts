import { Board, CELL_COLOR, DONT_SKIP, getSkipI } from '../logic/board.js';

export const handleMouse = (board: Board) => {
  let mouseDown = false;
  const draw = ({ x, y }: { x: number; y: number }) => {
    const RADIUS = 15;
    for (let yi = y - RADIUS; yi < y + RADIUS; yi++) {
      for (let xi = x - RADIUS; xi < x + RADIUS; xi++) {
        const alive = Math.round(Math.random());
        for (let c = 0; c < 4; c++) {
          const i = yi * board.output.width + xi;
          board.output.data[i * 4 + c] = CELL_COLOR[alive][c];
          board.outSkip[getSkipI(i)] = DONT_SKIP;
        }
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
