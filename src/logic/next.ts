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
  while (i < endI) {
    while (inSkip[Math.floor(i / SKIP_MULTIPLYER)]) i += SKIP_MULTIPLYER;

    output[i] = isAlive(i, input, width);

    if (input[i] !== output[i]) {
      revokeSkipForNeighbours(i, outSkip, width);
    }

    i++;
  }
};

const createSegments = (segments: number, width: number, height: number) => {
  let endI = width;
  const segmentSize = (Math.floor(height / segments) + (height % segments)) * width;
  return [...Array(segments)].map(() => {
    const beginI = endI + 1;
    endI = Math.min(width * (height - 1), endI + segmentSize);
    return { beginI, endI: endI - 1 };
  });
};

export const startNextBoardLoop = (generationsAndMax: Uint32Array, board: Board, workers: Worker[]) => {
  const segments = createSegments(workers.length, board.width, board.height);
  const segmentsCount = new Int32Array(new SharedArrayBuffer(4));
  const segmentsDone = new Int32Array(new SharedArrayBuffer(4));

  while (generationsAndMax[0] < generationsAndMax[1]) {
    Atomics.store(segmentsCount, 0, 0);
    Atomics.store(segmentsDone, 0, 0);

    flipBoardIo(board);
    board.skips[1 - board.skipsInput[0]].fill(SKIP);
    workers.forEach((worker, i) => {
      const message: StartMessage = {
        ...segments[i],
        board,
        segmentsCount,
        segmentsTotal: segments.length,
        segmentsDone,
      };
      worker.postMessage(message);
    });

    // Wait for segments to be completed
    Atomics.wait(segmentsDone, 0, 0, Infinity);

    assignBoardPadding(board);
    generationsAndMax[0]++;
  }
};
