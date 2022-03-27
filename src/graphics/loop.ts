import { Board, newBoard } from '../logic/board.js';
import { next, startNextBoardLoop } from '../logic/next.js';
import { newContext } from './context.js';
import { handleMouse } from './mouse.js';
import { render } from './render.js';

export type Meta = {
  board: Board;
  context: CanvasRenderingContext2D;
  workers: Worker[];
  maxGenerations: number;
  generations: number;
  renders: number;
  rendersMinimumMilliseconds: number;
  onDone: (meta: Meta) => void;
};

export const setup = (
  viewWidth: number,
  viewHeight: number,
  maxGenerations: number,
  rendersMinimumMilliseconds: number,
  onDone: (meta: Meta) => void,
): Meta => {
  const board = newBoard(viewWidth, viewHeight);
  const context = newContext(viewWidth, viewHeight);
  const workers = Array(1)
    .fill(0)
    .map((_, i) => new Worker('/logic/worker.js', { name: 'worker', type: 'module' }));
  const meta: Meta = {
    board,
    context,
    maxGenerations,
    rendersMinimumMilliseconds,
    onDone,
    generations: 0,
    renders: 0,
    workers,
  };

  window.addEventListener('blur', () => {
    meta.maxGenerations = 0;
  }); // prevent unecessary cpu spam

  handleMouse(board);

  return meta;
};

export const run = (meta: Meta) => {
  const renderLambda = () => render(meta.board, meta.context);

  const interval = setInterval(() => {
    document.title = String(meta.generations);
    requestAnimationFrame(renderLambda);
    meta.renders++;

    if (meta.generations >= meta.maxGenerations) {
      clearInterval(interval);
      meta.onDone(meta);
      return;
    }
  }, meta.rendersMinimumMilliseconds);

  startNextBoardLoop(meta);
};
