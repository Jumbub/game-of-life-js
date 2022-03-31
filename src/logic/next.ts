import { JobSignals, notifyStartJobs, requestJobToProcess, waitForAllJobsToComplete } from '../workers/jobs.js';
import { Board, Cells, DONT_SKIP, fillSkips, flipBoardIo, getBoardIo, Skips, SKIP_MULTIPLYER } from './board.js';
import { assignBoardPadding } from './padding.js';

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
  outSkip[~~((i - width) / SKIP_MULTIPLYER)] = DONT_SKIP;
  outSkip[~~((i - width + 1) / SKIP_MULTIPLYER)] = DONT_SKIP;
  outSkip[~~((i - 1) / SKIP_MULTIPLYER)] = DONT_SKIP;
  outSkip[~~(i / SKIP_MULTIPLYER)] = DONT_SKIP;
  outSkip[~~((i + 1) / SKIP_MULTIPLYER)] = DONT_SKIP;
  outSkip[~~((i + width - 1) / SKIP_MULTIPLYER)] = DONT_SKIP;
  outSkip[~~((i + width) / SKIP_MULTIPLYER)] = DONT_SKIP;
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

export const createJobs = (segments: number, width: number, height: number): [number, number][] => {
  let endI = width;
  const segmentSize = (Math.floor(height / segments) + (height % segments)) * width;
  return [...Array(segments)].map(() => {
    const beginI = endI + 1;
    endI = Math.min(width * (height - 1), endI + segmentSize);
    return [beginI, endI - 1];
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

export const startNextBoardLoop = (
  generationsAndMax: Uint32Array,
  board: Board,
  jobsN: number,
  signals: JobSignals,
) => {
  const jobs = createJobs(jobsN, board.width, board.height);

  const processJobI = (i: number) => {
    const [beginI, endI] = jobs[i];
    const { input, output, inSkips, outSkips } = getBoardIo(board);
    nextBoardSection(beginI, endI, board.width, input, output, inSkips, outSkips);
  };

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
