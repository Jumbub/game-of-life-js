import { Board, newBoard } from '../logic/board';
import { primaryFactory } from '../workers/primary';
import { StartPrimaryMessage } from '../workers/primary.worker';
import { newContext } from './context';
import { handleMouse } from './mouse';
import { render } from './render';

export type Meta = {
  board: Board;
  context: CanvasRenderingContext2D;
  canvas: HTMLCanvasElement;
  primaryWorker: Worker;
  generationsAndMax: Uint32Array; // [computations, maxGenerations]
  renders: number;
  rendersMinimumMilliseconds: number;
  jobCount: number;
  imageData: ImageData;
  onDone: (meta: Meta) => void;
};

export const setup = async (
  viewWidth: number,
  viewHeight: number,
  maxGenerations: number,
  rendersMinimumMilliseconds: number,
  workerCount: number,
  jobCount: number,
  onDone: (meta: Meta) => void,
) => {
  const generationsAndMax = new Uint32Array(new SharedArrayBuffer(8));
  generationsAndMax[0] = 0;
  generationsAndMax[1] = maxGenerations === Infinity ? Math.pow(2, 32) : maxGenerations;

  return {
    ...newContext(viewWidth, viewHeight),
    board: newBoard(viewWidth, viewHeight),
    onDone,
    jobCount,
    renders: 0,
    generationsAndMax,
    rendersMinimumMilliseconds,
    imageData: new ImageData(viewWidth + 2, viewHeight + 2),
    primaryWorker: await primaryFactory(workerCount),
  };
};

export const run = (meta: Meta) => {
  handleMouse(meta.canvas, meta.board);

  const interval = setInterval(() => {
    const [generations, maxGenerations] = meta.generationsAndMax;

    document.title = String(generations);
    render(meta.imageData, meta.board, meta.context);
    meta.renders++;

    if (generations >= maxGenerations) {
      clearInterval(interval);
      meta.onDone(meta);
      return;
    }
  }, meta.rendersMinimumMilliseconds);

  const message: StartPrimaryMessage = {
    board: meta.board,
    jobCount: meta.jobCount,
    generationsAndMax: meta.generationsAndMax,
  };
  meta.primaryWorker.postMessage(message);
};
