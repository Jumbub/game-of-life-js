import { createJobSignals, notifyStartJobs, requestJobToProcess, waitForAllJobsToComplete } from '../workers/jobs';
import { BootMessage } from '../workers/secondary.worker';
import { Board, Cells, DONT_SKIP, fillSkips, flipBoardIo, getBoardIo, Skips, SKIP_MULTIPLYER } from './board';
import { assignBoardPadding } from './padding';

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
  outSkip[~~((i - width - 1) / SKIP_MULTIPLYER)] = DONT_SKIP;
  outSkip[~~((i - width + 1) / SKIP_MULTIPLYER)] = DONT_SKIP;
  outSkip[~~((i - 1) / SKIP_MULTIPLYER)] = DONT_SKIP;
  outSkip[~~((i + 1) / SKIP_MULTIPLYER)] = DONT_SKIP;
  outSkip[~~((i + width - 1) / SKIP_MULTIPLYER)] = DONT_SKIP;
  outSkip[~~((i + width + 1) / SKIP_MULTIPLYER)] = DONT_SKIP;
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
  const min = Math.min;
  fillSkips(outSkip, i + width - 1, endI - width + 1);

  do {
    output[i] = isAlive(i, input, width);
    if (input[i] !== output[i]) revokeSkipForNeighbours(i, outSkip, width);
    i++;
  } while (i % SKIP_MULTIPLYER !== 0 && i < endI);

  while (i < endI) {
    while (inSkip[i / SKIP_MULTIPLYER]) i += SKIP_MULTIPLYER;

    const tilI = min(i + SKIP_MULTIPLYER, endI);
    while (i < tilI) {
      if (input[i] !== (output[i] = isAlive(i, input, width))) revokeSkipForNeighbours(i, outSkip, width);
      i++;
    }
  }
};

const createJobs = (segments: number, width: number, height: number): [number, number][] => {
  const computeSize = width * (height - 2);
  const cellsPerSegment = computeSize / segments;
  return Array(segments)
    .fill(0)
    .map((_, i) => [i * cellsPerSegment, (i + 1) * cellsPerSegment])
    .map(([left, right]) => [Math.floor(left / width) * width, Math.floor(right / width) * width])
    .map(([left, right]) => [left + width, right + width])
    .map(([left, right]) => [Math.max(width, left), Math.min(width * (height - 1), right)])
    .map(([left, right]) => [left + 1, right - 1]);
};

const setSkipBorders = (board: Board, jobs: [number, number][]) => {
  const { width } = board;
  const { outSkips } = getBoardIo(board);

  for (let i = 0; i < jobs.length; i++) {
    const [beginI] = jobs[i];
    fillSkips(outSkips, beginI - width - 1, beginI + width - 1);
  }
};

export const startNextBoardLoop = (generationsAndMax: Uint32Array, board: Board, workers: Worker[], jobsN: number) => {
  const jobs = createJobs(jobsN, board.width, board.height);
  const signals = createJobSignals(jobs.length);

  const processJobI = (i: number) => {
    const [beginI, endI] = jobs[i];
    const { input, output, inSkips, outSkips } = getBoardIo(board);
    nextBoardSection(beginI, endI, board.width, input, output, inSkips, outSkips);
  };

  // Note: likely improvements by moving this into the setup function
  workers.forEach(worker => {
    const message: BootMessage = {
      board,
      jobs,
      signals,
    };
    worker.postMessage(message);
  });

  while (generationsAndMax[0] < generationsAndMax[1]) {
    // Pre-processing
    flipBoardIo(board);
    setSkipBorders(board, jobs);

    // Processing
    notifyStartJobs(signals);
    while (requestJobToProcess(signals, processJobI)) {}
    waitForAllJobsToComplete(signals);

    // Post-processing
    assignBoardPadding(board);
    generationsAndMax[0]++;
  }
};
