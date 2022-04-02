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
  fillSkips(outSkip, i + width - 1, endI - width + 1);
  while (i < endI) {
    while (inSkip[~~(i / SKIP_MULTIPLYER)]) i += SKIP_MULTIPLYER;

    output[i] = isAlive(i, input, width);

    if (input[i] !== output[i]) {
      revokeSkipForNeighbours(i, outSkip, width);
    }

    i++;
  }
};

const createJobs = (segments: number, width: number, height: number): [number, number][] => {
  const cellsPerSegment = (width * height - width * 2) / segments;
  return Array(segments)
    .fill(0)
    .map((_, i) => {
      return [
        width + Math.floor((i * cellsPerSegment) / width) * width,
        width + Math.min(width * height, Math.floor(((i + 1) * cellsPerSegment) / width) * width),
      ];
    });
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
