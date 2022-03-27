import { Board, newBoard } from '../logic/board.js';
import { StartMessage } from '../logic/primaryWorker.js';
import { newContext } from './context.js';
import { handleMouse } from './mouse.js';
import { render } from './render.js';

export type Meta = {
  board: Board;
  context: CanvasRenderingContext2D;
  primaryWorker: Worker;
  generationsAndMax: Uint32Array; // [computations, maxGenerations]
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
  const primaryWorker = new Worker('/logic/primaryWorker.js', { name: 'worker-primary', type: 'module' });
  const generationsAndMax = new Uint32Array(new SharedArrayBuffer(8));
  generationsAndMax[0] = 0;
  generationsAndMax[1] = maxGenerations === Infinity ? Math.pow(2, 32) : maxGenerations;
  const meta: Meta = {
    board,
    context,
    generationsAndMax,
    rendersMinimumMilliseconds,
    onDone,
    renders: 0,
    primaryWorker,
  };

  handleMouse(board);

  return meta;
};

export const run = (meta: Meta) => {
  const renderLambda = () => render(meta.board, meta.context);

  const interval = setInterval(() => {
    const [generations, maxGenerations] = meta.generationsAndMax;

    document.title = String(generations);
    requestAnimationFrame(renderLambda);
    meta.renders++;

    if (generations >= maxGenerations) {
      clearInterval(interval);
      meta.onDone(meta);
      return;
    }
  }, meta.rendersMinimumMilliseconds);

  const message: StartMessage = { board: meta.board, generationsAndMax: meta.generationsAndMax };
  meta.primaryWorker.postMessage(message);
};
