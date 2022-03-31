import { Board, newBoard } from '../logic/board';
import { StartMessage } from '../logic/primaryWorker';
import { newContext } from './context';
import { handleMouse } from './mouse';
import { render } from './render';

export type Meta = {
  board: Board;
  context: CanvasRenderingContext2D;
  primaryWorker: Worker;
  generationsAndMax: Uint32Array; // [computations, maxGenerations]
  renders: number;
  rendersMinimumMilliseconds: number;
  onDone: (meta: Meta) => void;
};

export const setup = async (
  viewWidth: number,
  viewHeight: number,
  maxGenerations: number,
  rendersMinimumMilliseconds: number,
  onDone: (meta: Meta) => void,
): Promise<Meta> => {
  return new Promise<Meta>((resolve, reject) => {
    // Create board, context, and other meta
    const board = newBoard(viewWidth, viewHeight);
    const context = newContext(viewWidth, viewHeight);
    const generationsAndMax = new Uint32Array(new SharedArrayBuffer(8));
    generationsAndMax[0] = 0;
    generationsAndMax[1] = maxGenerations === Infinity ? Math.pow(2, 32) : maxGenerations;
    const meta: Omit<Meta, 'primaryWorker'> = {
      board,
      context,
      generationsAndMax,
      rendersMinimumMilliseconds,
      onDone,
      renders: 0,
    };

    // Interactivity
    handleMouse(board);
    onkeydown = () => (generationsAndMax[1] = 0);

    // Boot primary worker, and only resolve setup when it's ready
    const primaryWorker = new Worker(new URL('../logic/primaryWorker', import.meta.url), {
      name: 'worker-primary',
      type: 'module',
    });
    primaryWorker.addEventListener('message', ({ data: status }: MessageEvent<string>) => {
      if (status !== 'ready') reject('Primary worker failed to initialize');
      else resolve({ ...meta, primaryWorker });
    });
  });
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

  if (meta.generationsAndMax[0] < meta.generationsAndMax[1]) {
    const message: StartMessage = { board: meta.board, generationsAndMax: meta.generationsAndMax };
    meta.primaryWorker.postMessage(message);
  }
};
