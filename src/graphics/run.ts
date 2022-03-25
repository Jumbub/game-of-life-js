import { Board, newBoard } from '../logic/board.js';
import { next } from '../logic/next.js';
import { newContext } from './context.js';
import { handleMouse } from './mouse.js';
import { render } from './render.js';

type Meta = {
  board: Board;
  context: CanvasRenderingContext2D;
  maxGenerations: number;
  rendersMinimumMilliseconds: number;
  onDone: () => void;
};

export const setup = (
  viewWidth: number,
  viewHeight: number,
  maxGenerations: number,
  rendersMinimumMilliseconds: number,
  onDone: () => void,
): Meta => {
  const board = newBoard(viewWidth, viewHeight);
  const context = newContext(viewWidth, viewHeight);
  const meta: Meta = {
    board,
    context,
    maxGenerations,
    rendersMinimumMilliseconds,
    onDone,
  };

  window.addEventListener('blur', () => {
    meta.maxGenerations = 0;
  }); // prevent unecessary cpu spam

  handleMouse(board);

  return meta;
};

export const run = ({ board, context, maxGenerations, rendersMinimumMilliseconds, onDone }: Meta) => {
  let computedGenerations = 0;

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
    else onDone();
  };

  renderLoop();
  nextLoop();
};
