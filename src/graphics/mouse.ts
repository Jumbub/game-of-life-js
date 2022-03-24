import { Board } from '../logic/board';

export const handleMouse = (board: Board) => {
  let mouseDown = false;
  const draw = ({ x, y }: { x: number; y: number }) => {
    const RADIUS = 15;
    for (let yi = y - RADIUS; yi < y + RADIUS; yi++) {
      for (let xi = x - RADIUS; xi < x + RADIUS; xi++) {
        board.output.data[(yi * board.output.width + xi) * 4] = 255;
        board.output.data[(yi * board.output.width + xi) * 4 + 1] = 0;
        board.output.data[(yi * board.output.width + xi) * 4 + 2] = 0;
        board.output.data[(yi * board.output.width + xi) * 4 + 3] = 255;
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
