import { Board, DONT_SKIP, getBoardIo, SKIP_MULTIPLYER } from '../logic/board';

export const handleMouse = (canvas: HTMLCanvasElement, board: Board) => {
  const { output, outSkips, inSkips } = getBoardIo(board);
  let mouseDown = false;
  const draw = ({ x, y }: { x: number; y: number }) => {
    const RADIUS = 15;
    for (let yo = y - RADIUS; yo < y + RADIUS; yo++) {
      for (let xo = x - RADIUS; xo < x + RADIUS; xo++) {
        const i = yo * board.width + xo;
        output[i] = Math.round(Math.random());
      }
    }
    for (let yo = y - RADIUS - 1; yo < y + RADIUS + 1; yo++) {
      for (let xo = x - RADIUS - 1; xo < x + RADIUS + 1; xo++) {
        const i = Math.max(0, Math.min(board.width * board.height, yo * board.width + xo));
        outSkips[~~(i / SKIP_MULTIPLYER)] = DONT_SKIP;
        inSkips[~~(i / SKIP_MULTIPLYER)] = DONT_SKIP;
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
