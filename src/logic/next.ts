import { Board, Cells, DONT_SKIP, flipBoardIo, getBoardIo, Skip, SKIP, Skips, SKIP_MULTIPLYER } from './board.js';
import { assignBoardPadding } from './padding.js';
import { StartMessage } from './segmentWorker.js';

export const LOOKUP = [0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0, 0, 0] as const;

const isAlive = (i: number, cells: Cells, width: number) => {
  const sum =
    cells[i - width - 1] +
    cells[i - width] +
    cells[i - width + 1] +
    cells[i - 1] +
    cells[i] * 9 + // Notice the `* 9` here
    cells[i + 1] +
    cells[i + width - 1] +
    cells[i + width] +
    cells[i + width + 1];
  return LOOKUP[sum];
};

const revokeSkipForNeighbours = (i: number, outSkip: Skips, width: number) => {
  outSkip[Math.floor((i - width - 1) / SKIP_MULTIPLYER)] = DONT_SKIP;
  outSkip[Math.floor((i - width) / SKIP_MULTIPLYER)] = DONT_SKIP;
  outSkip[Math.floor((i - width + 1) / SKIP_MULTIPLYER)] = DONT_SKIP;
  outSkip[Math.floor((i - 1) / SKIP_MULTIPLYER)] = DONT_SKIP;
  outSkip[Math.floor(i / SKIP_MULTIPLYER)] = DONT_SKIP;
  outSkip[Math.floor((i + 1) / SKIP_MULTIPLYER)] = DONT_SKIP;
  outSkip[Math.floor((i + width - 1) / SKIP_MULTIPLYER)] = DONT_SKIP;
  outSkip[Math.floor((i + width) / SKIP_MULTIPLYER)] = DONT_SKIP;
  outSkip[Math.floor((i + width + 1) / SKIP_MULTIPLYER)] = DONT_SKIP;
};

export const nextBoardSection = (
  i: number,
  endI: number,
  width: number,
  input: Cells,
  output: Cells,
  inSkip: Skips,
  outSkip: Skips,
) => {
  outSkip.fill(SKIP);

  while (i < endI) {
    while (inSkip[Math.floor(i / SKIP_MULTIPLYER)]) i += SKIP_MULTIPLYER;

    output[i] = isAlive(i, input, width);

    if (input[i] !== output[i]) {
      revokeSkipForNeighbours(i, outSkip, width);
    }

    i++;
  }
};

export const startNextBoardLoop = (generationsAndMax: Uint32Array, board: Board, workers: Worker[]) => {
  const startNextBoard = () => {
    flipBoardIo(board);
    const message: StartMessage = { board };
    workers.forEach(worker => worker.postMessage(message));
  };

  const onWorkersFinished = () => {
    assignBoardPadding(board);
    generationsAndMax[0]++;
    if (generationsAndMax[0] < generationsAndMax[1]) startNextBoard();
  };

  // Setup listeners
  let completions = 0;
  workers.forEach(worker => {
    const onWorkerFinished = () => {
      if (++completions === workers.length) {
        completions = 0;
        onWorkersFinished();
      }
    };
    worker.addEventListener('message', onWorkerFinished);
  });

  startNextBoard();
};
