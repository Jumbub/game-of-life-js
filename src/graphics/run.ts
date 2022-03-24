import { Board, newBoard } from '../logic/board.js';
import { next } from '../logic/next.js';
import { newContext } from './context.js';
import { handleMouse } from './mouse.js';
import { render } from './render.js';

export const run = (
  viewWidth: number,
  viewHeight: number,
  maxGenerations: number,
  rendersMinimumMilliseconds: number,
  load: (board: Board) => void,
) => {
  const context = newContext(viewWidth, viewHeight);
  const board = newBoard(viewWidth, viewHeight);

  load(board);

  let computedGenerations = 0;

  window.addEventListener('blur', () => (maxGenerations = 0)); // prevent unecessary cpu spam

  handleMouse(board);

  const renderLoop = async () => {
    let renderStartTime = Date.now();

    render(board, context);
    document.title = String(computedGenerations);

    if (computedGenerations <= maxGenerations)
      setTimeout(renderLoop, rendersMinimumMilliseconds - renderStartTime + Date.now());
  };

  const nextLoop = async () => {
    next(board);

    computedGenerations++;
    if (computedGenerations < maxGenerations) setTimeout(nextLoop, 0);
  };

  renderLoop();
  nextLoop();
};
